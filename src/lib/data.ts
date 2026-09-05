import { db } from './db';

export async function getPhotozones(opts: {
  category?: string;
  occasion?: string;
  isActive?: boolean;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'new' | 'hit';
  limit?: number;
} = {}) {
  const { category, occasion, isActive = true, search, sort = 'hit', limit } = opts;
  const where: any = { isActive };
  if (category) where.category = category;
  if (occasion) where.occasions = { string_contains: JSON.stringify(occasion) };
  if (search) where.title = { contains: search };

  let orderBy: any = { sortOrder: 'asc' };
  if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'new') orderBy = { createdAt: 'desc' };
  else if (sort === 'hit') orderBy = [{ hit: 'desc' }, { sortOrder: 'asc' }];

  return db.photoZone.findMany({
    where,
    orderBy,
    ...(limit ? { take: limit } : {}),
    include: { elements: true },
  });
}

export async function getPhotozoneBySlug(slug: string) {
  return db.photoZone.findUnique({
    where: { slug },
    include: { elements: { where: { isActive: true } } },
  });
}

export async function getReviews(limit = 50) {
  return db.review.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function getPromosForPage(page: string) {
  const now = new Date();
  return db.promo.findMany({
    where: {
      isActive: true,
      OR: [{ activeFrom: null }, { activeFrom: { lte: now } }],
      OR2: [{ activeTo: null }, { activeTo: { gte: now } }],
    },
  });
}

export async function getArticles(limit = 50) {
  return db.article.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

export async function getArticleBySlug(slug: string) {
  return db.article.findUnique({ where: { slug } });
}

// Помощь для парсинга Json-полей (массивы строк)
export function asStringArray(v: unknown): string[] {
  if (Array.isArray(v)) return v as string[];
  return [];
}
