import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

// Шаблоны названий «базовых конструкций» (10 элементов из ELEMENTS-FINAL.md, группа «Каркасы и основы»).
// В схеме Element нет поля isBase/slug — отличаем базу по имени.
// Список поддерживается в синхронизации с prisma/seed.ts.
const BASE_NAME_PATTERNS: RegExp[] = [
  /^Мольберт[-\s]/i,
  /^Металлическая\s+арка/i,
  /^Деревянная\s+арка/i,
  /^Каркасная\s+основа/i,
  /^Каркас\s+пресс-волл/i,
  /^Лёгкая\s+стена/i,
  /^Премиум-стена/i,
  /^Стена\s+из\s+паллет/i,
];

function isBaseElementName(name: string): boolean {
  return BASE_NAME_PATTERNS.some((p) => p.test(name));
}

// GET /api/elements — публичный список глобальных активных доп. элементов
// (category = lighting | decor | prop | letter | service). Без авторизации.
// Опционально: ?category=lighting — фильтр по одной категории.
// В ответе добавлено поле isBase: boolean — относится ли элемент к «базовым конструкциям»
// (мольберт/арка/каркас/пресс-волл/стена-драпировка/премиум-стена/стена из паллет).
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
    orderBy: [{ category: 'asc' }, { price: 'asc' }],
  });

  // Обогащаем флагом isBase на основе имени
  const items = elements.map((e) => ({
    ...e,
    isBase: isBaseElementName(e.name),
  }));

  return NextResponse.json({ items });
}
