import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ manager: null }, { status: 401 });

  // Подтянем свежие данные (имя могло поменяться через /api/admin/profile,
  // аватар — через /api/admin/profile/avatar, isActive мог стать false).
  const manager = await db.manager.findUnique({
    where: { id: s.id },
    select: { id: true, email: true, name: true, role: true, avatar: true, isActive: true },
  });
  if (!manager || !manager.isActive) {
    return NextResponse.json({ manager: null }, { status: 401 });
  }

  return NextResponse.json({
    manager: {
      id: manager.id,
      email: manager.email,
      name: manager.name,
      role: manager.role,
      avatar: manager.avatar,
    },
  });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
