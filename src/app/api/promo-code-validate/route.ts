import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo-codes';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// POST — проверить промокод (для формы быстрого заказа)
export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 20 проверок в минуту на IP.
    const ip = getClientIp(req);
    if (!rateLimit(`promo:${ip}`, 20, 60_000)) {
      return NextResponse.json(
        { valid: false, reason: 'Слишком много запросов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const { code } = await req.json().catch(() => ({}));
    if (!code) return NextResponse.json({ error: 'Укажите код' }, { status: 422 });
    const result = await validatePromoCode(String(code));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ valid: false, reason: 'Ошибка проверки' }, { status: 500 });
  }
}
