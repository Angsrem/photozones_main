import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

/** GET — текущий профиль авторизованного менеджера. */
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const manager = await db.manager.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, phone: true, role: true, avatar: true },
  });
  if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  return NextResponse.json({
    profile: {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      phone: manager.phone,
      role: manager.role,
      avatar: manager.avatar,
    },
  });
}

/** PATCH — обновить имя и телефон текущего менеджера (email нельзя менять). */
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const data: { name?: string; phone?: string | null } = {};

  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: 'Имя не может быть пустым' }, { status: 422 });
    data.name = name;
  }
  if ('phone' in body) {
    data.phone = body.phone ? String(body.phone).trim() : null;
  }

  const updated = await db.manager.update({
    where: { id: session.id },
    data,
    select: { id: true, email: true, name: true, phone: true, role: true, avatar: true },
  });

  // Обновим cookie сессии (там хранится имя — отображается в шапке).
  await setSessionCookie({
    id: updated.id,
    email: updated.email,
    name: updated.name,
    role: updated.role,
    avatar: updated.avatar,
  });

  return NextResponse.json({
    ok: true,
    profile: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      phone: updated.phone,
      role: updated.role,
      avatar: updated.avatar,
    },
  });
}
