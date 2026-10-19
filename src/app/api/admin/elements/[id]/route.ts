import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

const ALLOWED_CATEGORIES = ['letter', 'decor', 'prop', 'lighting', 'service'];

// PATCH /api/admin/elements/[id] — обновить глобальный элемент
// Разрешены поля: name, description, price, image, category, isActive
// Запрещено менять photozoneId из этого endpoint (используйте редактор фотозоны).
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { id } = await params;
  const body = await req.json().catch(() => ({}));

  // Элемент должен существовать
  const existing = await db.element.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Элемент не найден' }, { status: 404 });

  const data: any = {};
  if (typeof body.name === 'string' && body.name.trim()) data.name = body.name.trim();
  if ('description' in body) data.description = body.description ? String(body.description) : null;
  if ('image' in body) data.image = body.image ? String(body.image) : null;
  if (body.price != null && Number.isFinite(Number(body.price)) && Number(body.price) >= 0) {
    data.price = Number(body.price);
  }
  if (typeof body.category === 'string' && ALLOWED_CATEGORIES.includes(body.category)) {
    data.category = body.category;
  }
  if (typeof body.isActive === 'boolean') data.isActive = body.isActive;

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: 'Нет полей для обновления' }, { status: 422 });
  }

  const element = await db.element.update({ where: { id }, data });
  return NextResponse.json({ ok: true, element });
}

// DELETE /api/admin/elements/[id] — удалить глобальный элемент
// Запрещено удалять элементы, привязанные к фотозоне (photozoneId != null),
// их удаляют через редактор фотозоны (onDelete: Cascade).
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { id } = await params;
  const existing = await db.element.findUnique({ where: { id } });
  if (!existing) return NextResponse.json({ error: 'Элемент не найден' }, { status: 404 });
  if (existing.photozoneId) {
    return NextResponse.json(
      { error: 'Этот элемент привязан к фотозоне — удалите его в редакторе фотозоны' },
      { status: 422 }
    );
  }

  await db.element.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
