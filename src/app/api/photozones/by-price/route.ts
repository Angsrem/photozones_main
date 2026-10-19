import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/photozones/by-price?min=X&max=Y&limit=5
// Публичный список активных фотозон в диапазоне basePrice [min..max].
// Сортировка: hit (хиты — первыми), затем sortOrder. Без авторизации.
//
// Используется в калькуляторе/конструкторе для блока «Похожие из наличия ±15%»:
// после расчёта calc_price запрашиваются фотозоны с basePrice ∈ [calc×0.85 .. calc×1.15].
// Бэкенд валидирует параметры: min/max clamp в разумные границы, limit ≤ 12.
export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;

  // Валидация на сервере — не доверяем клиенту
  const minRaw = Number(sp.get('min') ?? 0);
  const maxRaw = Number(sp.get('max') ?? 1_000_000);
  const limitRaw = Number(sp.get('limit') ?? 5);
  const excludeSlug = sp.get('exclude') || undefined;

  // Защита от NaN / отрицательных / нереалистичных значений
  const min = Number.isFinite(minRaw) && minRaw > 0 ? Math.floor(minRaw) : 0;
  const max = Number.isFinite(maxRaw) && maxRaw > 0 ? Math.floor(maxRaw) : 1_000_000;
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 12) : 5;

  // Если min > max — пустой результат (защита от инъекций)
  if (min > max) {
    return NextResponse.json({ items: [] });
  }

  const photozones = await db.photoZone.findMany({
    where: {
      isActive: true,
      basePrice: { gte: min, lte: max },
      ...(excludeSlug ? { slug: { not: excludeSlug } } : {}),
    },
    orderBy: [{ hit: 'desc' }, { sortOrder: 'asc' }],
    take: limit,
    select: {
      id: true,
      slug: true,
      title: true,
      basePrice: true,
      images: true,
      sizeW: true,
      sizeH: true,
      hit: true,
      badge: true,
      category: true,
      description: true,
    },
  });

  return NextResponse.json({ items: photozones });
}
