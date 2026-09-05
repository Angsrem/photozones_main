import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const items = await db.photoZone.findMany({ orderBy: { sortOrder: 'asc' }, include: { _count: { select: { elements: true } } } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { title, slug, description, category, occasions, basePrice, sizeW, sizeH, images, includes, badge, hit, sortOrder, isActive } = body;
  if (!title || !slug || !category || basePrice == null) return NextResponse.json({ error: 'Заполните обязательные поля' }, { status: 422 });
  const existing = await db.photoZone.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: 'Slug занят' }, { status: 409 });
  const pz = await db.photoZone.create({
    data: {
      title, slug, description: description || '', category,
      occasions: occasions || [], basePrice: Number(basePrice),
      sizeW: sizeW ? Number(sizeW) : null, sizeH: sizeH ? Number(sizeH) : null,
      images: images || [], includes: includes || [],
      badge: badge || null, hit: !!hit, sortOrder: Number(sortOrder ?? 100), isActive: isActive !== false,
    },
  });
  return NextResponse.json({ ok: true, photozone: pz });
}
