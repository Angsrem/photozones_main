import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// POST — сохранить partial-ответы квиза (когда пользователь бросил)
export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 20 запросов в минуту на IP.
    const ip = getClientIp(req);
    if (!rateLimit(`quiz-partial:${ip}`, 20, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = await req.json().catch(() => ({}));
    const { answers, step, source, utm } = body;
    if (!answers || !step) return NextResponse.json({ error: 'Нет данных' }, { status: 422 });

    const partial = await db.quizPartial.create({
      data: {
        answers: answers as any,
        step: Number(step),
        source: source || null,
        utm: utm || null,
        converted: false,
      },
    });
    return NextResponse.json({ ok: true, id: partial.id }, { status: 201 });
  } catch (e: any) {
    console.error('[POST /api/quiz-partial]', e);
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 });
  }
}

// GET — для админки: список partial-лидов
export async function GET(req: NextRequest) {
  const { getSession } = await import('@/lib/auth');
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') || 50);
  const items = await db.quizPartial.findMany({
    orderBy: { createdAt: 'desc' },
    take: limit,
  });
  return NextResponse.json({ items });
}
