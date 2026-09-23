import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET — получить сессию (для /podborka/[id]) + инкремент просмотров
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.quizSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  if (session.expiresAt < new Date()) {
    return NextResponse.json({ error: 'Срок действия подборки истёк' }, { status: 410 });
  }

  // инкремент просмотров
  await db.quizSession.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  // подтянуть фотозоны
  const ids = (session.recommendedIds as string[]) || [];
  const zones = await db.photoZone.findMany({
    where: { id: { in: ids } },
  });
  // восстановить порядок [эконом, хит, премиум]
  const ordered = ids.map((id) => zones.find((z) => z.id === id)).filter(Boolean);

  return NextResponse.json({
    session: {
      id: session.id,
      answers: session.answers,
      promoCode: session.promoCode,
      createdAt: session.createdAt,
      expiresAt: session.expiresAt,
      views: session.views,
      contact: session.contact,
      channel: session.channel,
    },
    recommended: ordered.map((z) => z && {
      id: z.id, slug: z.slug, title: z.title, basePrice: z.basePrice,
      images: z.images, sizeW: z.sizeW, sizeH: z.sizeH, includes: z.includes,
      badge: z.badge, hit: z.hit,
    }).filter(Boolean),
  });
}

// POST — сохранить контакт (отправка подборки себе)
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const { contact, channel } = body;
  const contactStr = String(contact || '').trim();
  if (!contactStr || contactStr.length > 100) return NextResponse.json({ error: 'Некорректный контакт' }, { status: 422 });

  const session = await db.quizSession.findUnique({ where: { id } });
  if (!session) return NextResponse.json({ error: 'Сессия не найдена' }, { status: 404 });

  await db.quizSession.update({
    where: { id },
    data: { contact: contactStr, channel: channel || null },
  });

  // создадим лид с источником quiz-send
  const answers = (session.answers as any) || {};
  const ids = (session.recommendedIds as string[]) || [];
  try {
    await db.lead.create({
      data: {
        name: 'Квиз — отправка подборки',
        phone: contactStr,
        eventDate: answers.date || '',
        occasion: answers.occasion || null,
        comment: `Квиз. Канал: ${channel || '—'}. Рекомендации: ${ids.join(', ')}`,
        source: 'quiz-send',
        sourcePage: `/podborka/${id}`,
        config: { quizSessionId: id, answers, recommendedIds: ids, promoCode: session.promoCode } as any,
        priceEstimate: null,
        status: 'NEW',
      },
    });
  } catch (e) {
    console.error('[quiz contact] lead create error', e);
  }

  return NextResponse.json({ ok: true });
}
