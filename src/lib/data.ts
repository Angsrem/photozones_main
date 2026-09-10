import { db } from './db';

export async function getPhotozones(opts: {
  category?: string;
  occasion?: string;
  isActive?: boolean;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'new' | 'hit' | 'rating-desc' | 'reviews-desc';
  limit?: number;
} = {}) {
  const { category, occasion, isActive = true, search, sort = 'hit', limit } = opts;
  const where: any = { isActive };
  if (category) where.category = category;
  if (search) where.title = { contains: search };

  let orderBy: any = { sortOrder: 'asc' };
  if (sort === 'price-asc') orderBy = { basePrice: 'asc' };
  else if (sort === 'price-desc') orderBy = { basePrice: 'desc' };
  else if (sort === 'new') orderBy = { createdAt: 'desc' };
  else if (sort === 'hit') orderBy = [{ hit: 'desc' }, { sortOrder: 'asc' }];
  // rating-desc и reviews-desc — сортируем в JS после запроса

  let items = await db.photoZone.findMany({
    where,
    orderBy,
    include: { elements: true },
  });

  // JS-фильтр по occasion (массив строк в Json)
  if (occasion) {
    items = items.filter((z) => Array.isArray(z.occasions) && (z.occasions as string[]).includes(occasion));
  }

  // Сортировка по рейтингу и количеству отзывов (JS, т.к. требует агрегации Review)
  if (sort === 'rating-desc' || sort === 'reviews-desc') {
    // Получаем агрегацию отзывов для всех фотозон одним запросом
    const reviewStats = await db.review.groupBy({
      by: ['photozoneId'],
      where: { isPublished: true, photozoneId: { in: items.map((z) => z.id) } },
      _avg: { rating: true },
      _count: true,
    });
    const statsMap = new Map(reviewStats.map((r) => [r.photozoneId, { avg: r._avg.rating || 0, count: r._count }]));
    items = items.map((z) => ({
      ...z,
      _reviewAvg: statsMap.get(z.id)?.avg || 0,
      _reviewCount: statsMap.get(z.id)?.count || 0,
    }));
    if (sort === 'rating-desc') {
      items.sort((a: any, b: any) => (b._reviewAvg - a._reviewAvg) || (b._reviewCount - a._reviewCount));
    } else {
      items.sort((a: any, b: any) => (b._reviewCount - a._reviewCount) || (b._reviewAvg - a._reviewAvg));
    }
  }

  if (limit) items = items.slice(0, limit);
  return items;
}

export async function getPhotozoneBySlug(slug: string) {
  return db.photoZone.findUnique({
    where: { slug },
    include: { elements: { where: { isActive: true }, orderBy: { category: 'asc' } } },
  });
}

// Фотозона + её собственные опции + глобальные опции (освещение и др., photozoneId=null)
export async function getPhotozoneWithOptions(slug: string) {
  const pz = await db.photoZone.findUnique({ where: { slug } });
  if (!pz) return null;
  const [ownElements, globalElements] = await Promise.all([
    db.element.findMany({ where: { photozoneId: pz.id, isActive: true }, orderBy: { category: 'asc' } }),
    db.element.findMany({ where: { photozoneId: null, isActive: true }, orderBy: { category: 'asc' } }),
  ]);
  return { ...pz, elements: [...ownElements, ...globalElements] };
}

export async function getReviews(limit = 50) {
  return db.review.findMany({
    where: { isPublished: true },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  });
}

// Отзывы по конкретной фотозоне
export async function getReviewsByPhotozone(photozoneId: string, limit = 20) {
  return db.review.findMany({
    where: { isPublished: true, photozoneId },
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
