import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, verifyPassword } from '@/lib/auth';
import { generateSecret, generateCode, verifyCode, otpAuthUrl } from '@/lib/totp';

export const runtime = 'nodejs';

/** GET — текущее состояние 2FA для авторизованного менеджера. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const manager = await db.manager.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, totpSecret: true },
  });
  if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });
  return NextResponse.json({
    manager: { id: manager.id, email: manager.email, name: manager.name, role: manager.role },
    has2fa: !!manager.totpSecret,
  });
}

/** POST — действия по 2FA: generate (новый секрет), confirm (сохранить), disable (отключить). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || '');

  if (action === 'generate') {
    // Создаём новый секрет, НЕ сохраняем (UI должен сначала проверить код).
    const secret = generateSecret();
    const manager = await db.manager.findUnique({
      where: { id: session.id },
      select: { email: true },
    });
    if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });
    return NextResponse.json({
      secret,
      otpAuthUrl: otpAuthUrl(secret, manager.email),
      // Текущий 6-значный код (для удобства — на случай если нет приложения-аутентификатора,
      // пользователь может сам ввести его для проверки).
      previewCode: generateCode(secret),
    });
  }

  if (action === 'confirm') {
    // Проверить код и сохранить секрет.
    const secret = String(body.secret || '');
    const code = String(body.code || '');
    if (!secret || !/^[A-Z2-7]{16,}$/.test(secret)) {
      return NextResponse.json({ error: 'Некорректный секрет' }, { status: 422 });
    }
    if (!/^\d{6}$/.test(code)) {
      return NextResponse.json({ error: 'Код состоит из 6 цифр' }, { status: 422 });
    }
    if (!verifyCode(secret, code)) {
      return NextResponse.json({ error: 'Неверный или просроченный код' }, { status: 401 });
    }
    await db.manager.update({
      where: { id: session.id },
      data: { totpSecret: secret },
    });
    return NextResponse.json({ ok: true, has2fa: true });
  }

  if (action === 'disable') {
    // Для отключения 2FA требуется пароль (защита от случайного/несанкционированного отключения).
    const password = String(body.password || '');
    const manager = await db.manager.findUnique({
      where: { id: session.id },
      select: { passwordHash: true, totpSecret: true },
    });
    if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });
    if (!verifyPassword(password, manager.passwordHash)) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 401 });
    }
    if (!manager.totpSecret) {
      return NextResponse.json({ error: '2FA уже отключена' }, { status: 422 });
    }
    await db.manager.update({
      where: { id: session.id },
      data: { totpSecret: null },
    });
    return NextResponse.json({ ok: true, has2fa: false });
  }

  return NextResponse.json({ error: 'Неизвестное действие' }, { status: 422 });
}
