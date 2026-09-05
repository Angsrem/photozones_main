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
  // SQLite не поддерживает string_contains для Json-надёжно → фильтруем occasion в JS
  if (search) where.title = { contains: search };

  let orderBy: any = { sortOrder: 'asc' };
  if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'new') orderBy = { createdAt: 'desc' };
  else if (sort === 'hit') orderBy = [{ hit: 'desc' }, { sortOrder: 'asc' }];

  let items = await db.photoZone.findMany({
    where,
    orderBy,
    include: { elements: true },
  });

  // JS-фильтр по occasion (массив строк в Json)
  if (occasion) {
    items = items.filter((z) => Array.isArray(z.occasions) && (z.occasions as string[]).includes(occasion));
  }

  if (limit) items = items.slice(0, limit);
  return items;
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
  const promos = await db.promo.findMany({
    where: {
      isActive: true,
      AND: [
        { OR: [{ activeFrom: null }, { activeFrom: { lte: now } }] },
        { OR: [{ activeTo: null }, { activeTo: { gte: now } }] },
      ],
    },
    orderBy: { createdAt: 'desc' },
  });
  // фильтруем по pages (Json-массив строк) — берём промо для конкретной страницы или без привязки
  return promos.filter((p) => {
    const pages = asStringArray(p.pages);
    if (!pages.length) return true; // без привязки — показываем везде
    return pages.includes(page);
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
