import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return { ok: false as const, status: 401, error: 'Не авторизован' };
  if (session.role !== 'ADMIN') return { ok: false as const, status: 403, error: 'Только для ADMIN' };
  return { ok: true as const };
}

/** POST — сменить пароль менеджера. */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');

  if (password.length < 6) {
    return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 422 });
  }

  const target = await db.manager.findUnique({ where: { id }, select: { id: true } });
  if (!target) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  await db.manager.update({
    where: { id },
    data: { passwordHash: hashPassword(password) },
  });

  return NextResponse.json({ ok: true });
}
