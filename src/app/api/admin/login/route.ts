import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { verifyPassword, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
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
