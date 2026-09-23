import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const items = await db.promo.findMany({ orderBy: { createdAt: 'desc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { title, description, discount, activeFrom, activeTo, pages, isActive } = body;
  if (!title) return NextResponse.json({ error: 'Укажите название' }, { status: 422 });
  if (discount !== null && discount !== undefined && (!Number.isFinite(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
    return NextResponse.json({ error: 'Скидка 0–100%' }, { status: 422 });
  }
  const promo = await db.promo.create({
    data: {
      title: String(title),
      description: description ? String(description) : null,
      discount: discount ? Number(discount) : null,
      activeFrom: activeFrom ? new Date(activeFrom) : null,
      activeTo: activeTo ? new Date(activeTo) : null,
      pages: pages || [],
      isActive: isActive !== false,
    },
  });
  return NextResponse.json({ ok: true, promo });
}
