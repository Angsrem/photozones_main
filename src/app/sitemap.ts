import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';

export const runtime = 'nodejs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;

  // Статические страницы с приоритетами
  const staticRoutes: { path: string; priority: number; changefreq: 'daily' | 'weekly' | 'monthly' }[] = [
    { path: '', priority: 1.0, changefreq: 'daily' },
    { path: '/katalog', priority: 0.9, changefreq: 'daily' },
    { path: '/svadby', priority: 0.9, changefreq: 'weekly' },
    { path: '/detskie-prazdniki', priority: 0.9, changefreq: 'weekly' },
    { path: '/vypusknie', priority: 0.8, changefreq: 'weekly' },
    { path: '/korporativy', priority: 0.8, changefreq: 'weekly' },
    { path: '/prazdniki/novyj-god', priority: 0.8, changefreq: 'weekly' },
    { path: '/prazdniki/8-marta', priority: 0.7, changefreq: 'monthly' },
    { path: '/prazdniki/23-fevralya', priority: 0.7, changefreq: 'monthly' },
    { path: '/ceny', priority: 0.8, changefreq: 'monthly' },
    { path: '/kalkulyator', priority: 0.7, changefreq: 'monthly' },
    { path: '/o-kompanii', priority: 0.6, changefreq: 'monthly' },
    { path: '/otzyvy', priority: 0.8, changefreq: 'daily' },
    { path: '/kontakty', priority: 0.7, changefreq: 'monthly' },
    { path: '/blog', priority: 0.7, changefreq: 'weekly' },
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r.path}`,
    lastModified: new Date(),
    changeFrequency: r.changefreq,
    priority: r.priority,
  }));

  // Карточки фотозон
  const zones = await db.photoZone.findMany({
    where: { isActive: true },
    select: { slug: true, updatedAt: true },
  });
  for (const z of zones) {
    entries.push({
      url: `${base}/katalog/${z.slug}`,
      lastModified: z.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // Статьи блога
  const articles = await db.article.findMany({
    where: { isPublished: true },
    select: { slug: true, updatedAt: true },
  });
  for (const a of articles) {
    entries.push({
      url: `${base}/blog/${a.slug}`,
      lastModified: a.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.6,
    });
  }

  return entries;
}
