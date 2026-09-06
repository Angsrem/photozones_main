import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const pz = await db.photoZone.findUnique({ where: { id }, include: { elements: true } });
  if (!pz) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json(pz);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  for (const k of ['title','slug','description','category','basePrice','sizeW','sizeH','images','videos','includes','badge','hit','sortOrder','isActive']) {
    if (k in body) data[k] = body[k];
  }
  if ('occasions' in body) data.occasions = body.occasions;
  if ('basePrice' in body) data.basePrice = Number(body.basePrice);
  if ('sortOrder' in body) data.sortOrder = Number(body.sortOrder);

  // синхронизация элементов: если пришёл массив elements [{id?, name, price, category?, image?, description?, isActive?}]
  if (Array.isArray(body.elements)) {
    const incoming = body.elements as Array<{ id?: string; name: string; price: number; category?: string; image?: string | null; description?: string | null; isActive?: boolean }>;
    const incomingIds = new Set(incoming.filter((e) => e.id).map((e) => e.id!));
    // удаляем отсутствующие
    await db.element.deleteMany({ where: { photozoneId: id, NOT: { id: { in: [...incomingIds] } } } });
    // обновляем/создаём
    for (const e of incoming) {
      const payload = {
        name: e.name,
        price: Number(e.price),
        isActive: e.isActive !== false,
        category: e.category || 'decor',
        image: e.image || null,
        description: e.description || null,
      };
      if (e.id && incomingIds.has(e.id)) {
        await db.element.update({ where: { id: e.id }, data: payload });
      } else {
        await db.element.create({ data: { ...payload, photozoneId: id } });
      }
    }
  }

  const pz = await db.photoZone.update({ where: { id }, data });
  return NextResponse.json({ ok: true, photozone: pz });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  await db.photoZone.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
