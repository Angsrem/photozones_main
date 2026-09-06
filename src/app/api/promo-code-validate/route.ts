import { NextRequest, NextResponse } from 'next/server';
import { validatePromoCode } from '@/lib/promo-codes';

export const runtime = 'nodejs';

// POST — проверить промокод (для формы быстрого заказа)
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json().catch(() => ({}));
    if (!code) return NextResponse.json({ error: 'Укажите код' }, { status: 422 });
    const result = await validatePromoCode(String(code));
    return NextResponse.json(result);
  } catch (e: any) {
    return NextResponse.json({ valid: false, reason: 'Ошибка проверки' }, { status: 500 });
  }
}
