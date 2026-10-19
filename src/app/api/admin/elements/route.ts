import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

const ALLOWED_CATEGORIES = ['letter', 'decor', 'prop', 'lighting', 'service'];

// GET /api/admin/elements — список глобальных элементов калькулятора (photozoneId IS NULL)
// Опциональные query:
//   ?category=lighting — фильтр по одной категории
//   ?q=шары — поиск по названию/описанию (case-insensitive)
//   ?includeInactive=1 — показывать неактивные тоже (по умолчанию только активные)
//   ?all=1 — игнорировать фильтр по photozoneId, показать ВСЕ элементы (включая привязанные)
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const includeInactive = searchParams.get('includeInactive') === '1';
  const all = searchParams.get('all') === '1';

  const where: any = {};
  if (!all) where.photozoneId = null;
  if (category && ALLOWED_CATEGORIES.includes(category)) where.category = category;
  if (!includeInactive) where.isActive = true;
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const items = await db.element.findMany({
    where,
    orderBy: [{ category: 'asc' }, { price: 'asc' }],
  });

  return NextResponse.json({ items });
}

// POST /api/admin/elements — создать новый глобальный элемент калькулятора
// Обязательные поля: name, price, category
// Опциональные: description, image, isActive (по умолчанию true)
// ВАЖНО: photozoneId принудительно устанавливается в null (глобальный элемент)
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { name, description, price, image, category, isActive } = body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    return NextResponse.json({ error: 'Укажите название элемента' }, { status: 422 });
  }
  if (price == null || !Number.isFinite(Number(price)) || Number(price) < 0 || Number(price) > 1_000_000) {
    return NextResponse.json({ error: 'Укажите корректную цену (0–1 000 000 ₽)' }, { status: 422 });
  }
  const cat = typeof category === 'string' && ALLOWED_CATEGORIES.includes(category) ? category : 'decor';

  const element = await db.element.create({
    data: {
      name: name.trim(),
      description: description ? String(description) : null,
      price: Number(price),
      image: image ? String(image) : null,
      category: cat,
      isActive: isActive !== false,
      photozoneId: null, // глобальный элемент калькулятора
    },
  });

  return NextResponse.json({ ok: true, element });
}
