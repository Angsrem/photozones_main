import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE } from '@/lib/constants';

export const runtime = 'nodejs';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = SITE.url;
  const staticRoutes = [
    '', '/katalog', '/svadby', '/detskie-prazdniki', '/vypusknie', '/korporativy',
    '/prazdniki/novyj-god', '/prazdniki/8-marta', '/prazdniki/23-fevralya',
    '/ceny', '/kalkulyator', '/konstruktor', '/o-kompanii', '/otzyvy', '/kontakty', '/blog',
  ];

  const entries: MetadataRoute.Sitemap = staticRoutes.map((r) => ({
    url: `${base}${r}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: r === '' ? 1 : 0.8,
  }));

  // карточки фотозон
  const zones = await db.photoZone.findMany({ where: { isActive: true }, select: { slug: true, updatedAt: true } });
  for (const z of zones) {
    entries.push({
      url: `${base}/katalog/${z.slug}`,
      lastModified: z.updatedAt,
      changeFrequency: 'monthly',
      priority: 0.7,
    });
  }

  // статьи
  const articles = await db.article.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } });
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
