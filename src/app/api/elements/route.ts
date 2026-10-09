import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// GET /api/elements — публичный список глобальных активных доп. элементов
// (category = lighting | decor | prop | letter | service). Без авторизации.
// Опционально: ?category=lighting — фильтр по одной категории.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;

  const where: { isActive: boolean; photozoneId: null; category?: string } = {
    isActive: true,
    photozoneId: null,
  };
  if (category) where.category = category;

  const elements = await db.element.findMany({
    where,
    orderBy: { category: 'asc' },
  });

  return NextResponse.json({ items: elements });
}
