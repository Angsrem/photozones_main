import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { createLead } from '@/lib/leads';
import { isPhoneValid, addDaysISO } from '@/lib/format';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import { sendDripEmail } from '@/lib/notify';

export const runtime = 'nodejs';

// Принимает заявку на лид-магнит:
//  - slug магнита (должен существовать и быть активным)
//  - name (обязательно), phone (маска +7, валидный), email (опционально)
// Создаёт Lead со source='leadmagnet', config с slug магнита,
// инкрементирует LeadMagnet.downloads, возвращает fileUrl для скачивания.
// Rate-limit: 5 запросов в минуту на IP (защита от спама).
export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    if (!rateLimit(`leadmagnet:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });

    const slug = String(body.slug || '').trim();
    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const email = body.email ? String(body.email).trim().toLowerCase() : '';

    if (!slug) return NextResponse.json({ error: 'Не указан лид-магнит' }, { status: 422 });
    if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
    if (!isPhoneValid(phone)) return NextResponse.json({ error: 'Введите корректный телефон' }, { status: 422 });
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 422 });
    }

    const magnet = await db.leadMagnet.findUnique({ where: { slug } });
    if (!magnet || !magnet.isActive) {
      return NextResponse.json({ error: 'Лид-магнит не найден или снят с публикации' }, { status: 404 });
    }

    // eventDate: относительная дата +14 дней (заглушка — клиент не обязан указывать дату).
    // Это позволяет сохранить совместимость со схемой Lead (eventDate обязателен).
    const eventDate = body.eventDate ? String(body.eventDate).slice(0, 10) : addDaysISO(14);

    // Создаём лид со source='leadmagnet' и config { leadMagnetSlug, leadMagnetTitle, email }
    const lead = await createLead({
      name,
      phone,
      eventDate,
      occasion: magnet.occasion ?? null,
      comment: email ? `Email: ${email}` : null,
      source: 'leadmagnet',
      sourcePage: body.sourcePage ? String(body.sourcePage) : null,
      utm: body.utm ?? null,
      referrer: body.referrer ?? null,
      config: {
        type: 'leadmagnet',
        leadMagnetSlug: magnet.slug,
        leadMagnetTitle: magnet.title,
        email: email || null,
        promoCode: 'QUIZ5',
        promoDiscount: 5,
      },
      priceEstimate: null,
      promoCode: 'QUIZ5',
      promoDiscount: 5,
    });

    // Инкрементируем счётчик скачиваний
    await db.leadMagnet.update({
      where: { id: magnet.id },
      data: { downloads: { increment: 1 } },
    });

    // Запускаем дожим-цепочку (без блокировки ответа):
    // Шаг 1 — сразу: PDF + промокод QUIZ5
    if (email) {
      sendDripEmail(email, 1, magnet.slug, { name, leadId: lead.id }).catch((e) =>
        console.error('[lead-magnet] drip step 1 error', e),
      );
    }

    return NextResponse.json(
      {
        ok: true,
        id: lead.id,
        fileUrl: magnet.fileUrl,
        title: magnet.title,
        promoCode: 'QUIZ5',
        promoDiscount: 5,
        expiresAt: addDaysISO(5),
      },
      { status: 201 },
    );
  } catch (e: any) {
    console.error('[POST /api/lead-magnets] error', e);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}

// GET — публичный список активных магнитов (для SSR-компонентов — без скачиваний).
export async function GET() {
  const magnets = await db.leadMagnet.findMany({
    where: { isActive: true },
    select: { slug: true, title: true, description: true, occasion: true },
    orderBy: { createdAt: 'asc' },
  });
  return NextResponse.json({ items: magnets });
}
