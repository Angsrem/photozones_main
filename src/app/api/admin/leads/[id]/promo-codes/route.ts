import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { waTemplate } from '@/lib/promo-codes';

export const runtime = 'nodejs';

// GET — промокоды конкретного лида + шаблоны WhatsApp
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, select: { id: true, name: true, phone: true, photozone: { select: { title: true } } } });
  if (!lead) return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });

  const promoCodes = await db.promoCode.findMany({
    where: { leadId: id },
    orderBy: { createdAt: 'desc' },
  });

  // Генерируем WhatsApp-ссылки для каждого сценария
  const waBase = `https://wa.me/${(lead.phone || '').replace(/\D/g, '').replace(/^8/, '7').replace(/^/, '7').slice(0, 11)}`;
  const reviewLink = 'https://yandex.ru/maps/org/fotozona24';
  const templates = {
    day_after: waTemplate('day_after', { name: lead.name, photozoneTitle: lead.photozone?.title, reviewLink }),
    reminder: waTemplate('reminder', { name: lead.name, reviewLink }),
    photo_no_review: waTemplate('photo_no_review', { name: lead.name, reviewLink }),
    negative: waTemplate('negative', { name: lead.name }),
  };

  // Для выданных промокодов — шаблон code_issued
  const codesWithTemplates = promoCodes.map((pc) => ({
    ...pc,
    waCodeIssued: waTemplate('code_issued', {
      name: lead.name,
      code: pc.code,
      expiresAt: pc.expiresAt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }),
    waLink: `${waBase}?text=${encodeURIComponent(waTemplate('code_issued', {
      name: lead.name,
      code: pc.code,
      expiresAt: pc.expiresAt.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    }))}`,
  }));

  return NextResponse.json({ promoCodes: codesWithTemplates, templates, waBase });
}
