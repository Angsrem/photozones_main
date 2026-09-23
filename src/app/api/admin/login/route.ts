import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 5 попыток в минуту на IP — защита от brute-force пароля.
    const ip = getClientIp(req);
    if (!rateLimit(`login:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const { email, password } = await req.json().catch(() => ({}));
    if (!email || !password) return NextResponse.json({ error: 'Введите email и пароль' }, { status: 422 });

    const manager = await db.manager.findUnique({ where: { email: String(email).toLowerCase().trim() } });
    if (!manager || !verifyPassword(String(password), manager.passwordHash)) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }

    await setSessionCookie({ id: manager.id, email: manager.email, name: manager.name, role: manager.role });
    return NextResponse.json({ ok: true, manager: { id: manager.id, email: manager.email, name: manager.name, role: manager.role } });
  } catch (e: any) {
    console.error('[admin/login]', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
