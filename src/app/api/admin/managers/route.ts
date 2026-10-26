import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession, hashPassword } from '@/lib/auth';

export const runtime = 'nodejs';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const ROLE_RE = /^(MANAGER|ADMIN)$/;

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return { ok: false as const, status: 401, error: 'Не авторизован' };
  if (session.role !== 'ADMIN') return { ok: false as const, status: 403, error: 'Только для ADMIN' };
  return { ok: true as const };
}

function publicManager(m: {
  id: string; email: string; name: string; phone: string | null; role: string;
  isActive: boolean; avatar: string | null; createdAt: Date; totpSecret: string | null;
}) {
  return {
    id: m.id,
    email: m.email,
    name: m.name,
    phone: m.phone,
    role: m.role,
    isActive: m.isActive,
    avatar: m.avatar,
    has2fa: !!m.totpSecret,
    createdAt: m.createdAt.toISOString(),
  };
}

/** GET — список всех менеджеров. */
export async function GET() {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const managers = await db.manager.findMany({
    orderBy: { createdAt: 'asc' },
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      isActive: true, avatar: true, createdAt: true, totpSecret: true,
    },
  });

  return NextResponse.json({ items: managers.map(publicManager) });
}

/** POST — создать нового менеджера. */
export async function POST(req: NextRequest) {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  const name = String(body.name || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const phone = body.phone ? String(body.phone).trim() : null;
  const password = String(body.password || '');
  const role = String(body.role || 'MANAGER').toUpperCase();

  if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Некорректный email' }, { status: 422 });
  if (!ROLE_RE.test(role)) return NextResponse.json({ error: 'Некорректная роль' }, { status: 422 });
  if (password.length < 6) return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 422 });

  const exists = await db.manager.findUnique({ where: { email } });
  if (exists) return NextResponse.json({ error: 'Менеджер с таким email уже существует' }, { status: 409 });

  const manager = await db.manager.create({
    data: {
      name,
      email,
      phone,
      role,
      passwordHash: hashPassword(password),
      isActive: true,
    },
    select: {
      id: true, email: true, name: true, phone: true, role: true,
      isActive: true, avatar: true, createdAt: true, totpSecret: true,
    },
  });

  return NextResponse.json({ ok: true, manager: publicManager(manager) });
}
