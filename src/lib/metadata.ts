import type { Metadata } from 'next';
import { SITE } from './constants';

// Хелпер для создания metadata с GEO-ключами для посадочных страниц
export function pageMetadata(opts: {
  title: string;
  description: string;
  path: string;
  keywords?: string[];
  ogImage?: string;
}): Metadata {
  return {
    title: opts.title,
    description: opts.description,
    keywords: opts.keywords || [],
    alternates: { canonical: opts.path },
    openGraph: {
      title: opts.title,
      description: opts.description,
      url: `${SITE.url}${opts.path}`,
      siteName: SITE.name,
      locale: 'ru_RU',
      type: 'website',
      images: [{ url: opts.ogImage || '/images/hero.jpg', width: 1344, height: 768 }],
    },
  };
}

// Хелпер для карточки фотозоны
export function photozoneMetadata(opts: {
  title: string;
  description: string;
  slug: string;
  price: number;
  image?: string;
}): Metadata {
  return {
    title: `${opts.title} — аренда в Красноярске`,
    description: opts.description.slice(0, 160),
    keywords: [
      `${opts.title} Красноярск`,
      `аренда ${opts.title.toLowerCase()}`,
      `фотозона ${opts.title.toLowerCase()}`,
      'аренда фотозоны Красноярск',
    ],
    alternates: { canonical: `/katalog/${opts.slug}` },
    openGraph: {
      title: `${opts.title} — аренда от ${opts.price.toLocaleString('ru-RU')} ₽ | Fotoarka`,
      description: opts.description.slice(0, 160),
      url: `${SITE.url}/katalog/${opts.slug}`,
      siteName: SITE.name,
      locale: 'ru_RU',
      type: 'website',
      images: [{ url: opts.image || '/images/hero.jpg', alt: opts.title }],
    },
  };
}
