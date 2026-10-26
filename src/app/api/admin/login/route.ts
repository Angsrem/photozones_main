import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';
import { verifyCode } from '@/lib/totp';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 5 попыток в минуту на IP — защита от brute-force пароля/2FA-кода.
    const ip = getClientIp(req);
    if (!rateLimit(`login:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много попыток входа. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const { email, password, totpCode } = await req.json().catch(() => ({}));
    if (!email || !password) return NextResponse.json({ error: 'Введите email и пароль' }, { status: 422 });

    const manager = await db.manager.findUnique({
      where: { email: String(email).toLowerCase().trim() },
      select: {
        id: true, email: true, name: true, role: true,
        passwordHash: true, totpSecret: true, isActive: true, avatar: true,
      },
    });
    if (!manager || !verifyPassword(String(password), manager.passwordHash)) {
      return NextResponse.json({ error: 'Неверный email или пароль' }, { status: 401 });
    }
    if (!manager.isActive) {
      return NextResponse.json({ error: 'Аккаунт отключен. Обратитесь к администратору.' }, { status: 403 });
    }

    // Если у менеджера включена 2FA — требуем totpCode.
    if (manager.totpSecret) {
      if (!totpCode) {
        // Сообщаем фронту, что нужен 2FA-код (пароль при этом уже валиден).
        return NextResponse.json(
          { error: 'Требуется код двухфакторной аутентификации', needsTotp: true },
          { status: 401 },
        );
      }
      if (!verifyCode(manager.totpSecret, String(totpCode))) {
        return NextResponse.json(
          { error: 'Неверный или просроченный код 2FA', needsTotp: true },
          { status: 401 },
        );
      }
    }

    await setSessionCookie({
      id: manager.id,
      email: manager.email,
      name: manager.name,
      role: manager.role,
      avatar: manager.avatar,
    });
    return NextResponse.json({
      ok: true,
      manager: {
        id: manager.id,
        email: manager.email,
        name: manager.name,
        role: manager.role,
        avatar: manager.avatar,
      },
    });
  } catch (e: any) {
    console.error('[admin/login]', e);
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 });
  }
}
