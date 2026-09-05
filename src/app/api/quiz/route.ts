import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { runQuiz, QUIZ_PROMO_CODE, type QuizAnswers } from '@/lib/quiz';

export const runtime = 'nodejs';

// POST — создать сессию квиза с ответами, вернуть recommended + sessionId
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const answers = body.answers as QuizAnswers;
    if (!answers || !answers.occasion) {
      return NextResponse.json({ error: 'Не переданы ответы' }, { status: 422 });
    }

    const { recommended } = await runQuiz(answers);

    // срок жизни — 90 дней
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 90);

    const session = await db.quizSession.create({
      data: {
        answers: answers as any,
        recommendedIds: recommended.map((z) => z.id) as any,
        promoCode: QUIZ_PROMO_CODE,
        expiresAt,
        source: body.source || null,
      },
    });

    return NextResponse.json({
      sessionId: session.id,
      promoCode: QUIZ_PROMO_CODE,
      recommended: recommended.map((z) => ({
        id: z.id,
        slug: z.slug,
        title: z.title,
        basePrice: z.basePrice,
        images: z.images,
        sizeW: z.sizeW,
        sizeH: z.sizeH,
        includes: z.includes,
        badge: z.badge,
        hit: z.hit,
      })),
    });
  } catch (e: any) {
    console.error('[POST /api/quiz]', e);
    return NextResponse.json({ error: 'Внутренняя ошибка' }, { status: 500 });
  }
}
