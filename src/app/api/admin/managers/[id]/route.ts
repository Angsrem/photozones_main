import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

const ROLE_RE = /^(MANAGER|ADMIN)$/;

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return { ok: false as const, status: 401, error: 'Не авторизован' };
  if (session.role !== 'ADMIN') return { ok: false as const, status: 403, error: 'Только для ADMIN' };
  return { ok: true as const };
}

/** PATCH — обновить менеджера (имя, телефон, роль, isActive). */
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  const target = await db.manager.findUnique({
    where: { id },
    select: { id: true, role: true, isActive: true },
  });
  if (!target) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  const data: {
    name?: string;
    phone?: string | null;
    role?: string;
    isActive?: boolean;
  } = {};

  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (!name) return NextResponse.json({ error: 'Имя не может быть пустым' }, { status: 422 });
    data.name = name;
  }
  if ('phone' in body) {
    data.phone = body.phone ? String(body.phone).trim() : null;
  }
  if (typeof body.role === 'string') {
    const role = body.role.toUpperCase();
    if (!ROLE_RE.test(role)) return NextResponse.json({ error: 'Некорректная роль' }, { status: 422 });
    data.role = role;
  }
  if (typeof body.isActive === 'boolean') {
    data.isActive = body.isActive;
  }

  // Защита: нельзя снять ADMIN с последнего активного админа
  // (или просто понизить последнего ADMIN в MANAGER).
  if (
    target.role === 'ADMIN' &&
    (('role' in data && data.role !== 'ADMIN') ||
      ('isActive' in data && data.isActive === false))
  ) {
    const activeAdmins = await db.manager.count({
      where: { role: 'ADMIN', isActive: true },
    });
    if (activeAdmins <= 1) {
      return NextResponse.json(
        { error: 'Нельзя снять роль ADMIN или отключить последнего активного администратора' },
        { status: 422 },
      );
    }
  }

  const updated = await db.manager.update({
    where: { id },
    data,
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      isActive: true, avatar: true, createdAt: true, totpSecret: true,
    },
  });

  return NextResponse.json({ ok: true, manager: {
    id: updated.id,
    email: updated.email,
    name: updated.name,
    phone: updated.phone,
    role: updated.role,
    isActive: updated.isActive,
    avatar: updated.avatar,
    has2fa: !!updated.totpSecret,
    createdAt: updated.createdAt.toISOString(),
  } });
}

/** DELETE — удалить менеджера (нельзя удалить себя, нельзя удалить последнего ADMIN). */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  if (id === session.id) {
    return NextResponse.json({ error: 'Нельзя удалить себя' }, { status: 422 });
  }

  const target = await db.manager.findUnique({
    where: { id },
    select: { id: true, role: true },
  });
  if (!target) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  if (target.role === 'ADMIN') {
    const activeAdmins = await db.manager.count({ where: { role: 'ADMIN' } });
    if (activeAdmins <= 1) {
      return NextResponse.json(
        { error: 'Нельзя удалить последнего администратора' },
        { status: 422 },
      );
    }
  }

  await db.manager.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
