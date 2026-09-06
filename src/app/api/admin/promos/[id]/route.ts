import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const k of ['title', 'description', 'discount', 'pages', 'isActive']) {
    if (k in body) data[k] = body[k];
  }
  if ('discount' in body) data.discount = body.discount ? Number(body.discount) : null;
  if ('activeFrom' in body) data.activeFrom = body.activeFrom ? new Date(body.activeFrom) : null;
  if ('activeTo' in body) data.activeTo = body.activeTo ? new Date(body.activeTo) : null;
  const promo = await db.promo.update({ where: { id }, data });
  return NextResponse.json({ ok: true, promo });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  await db.promo.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
