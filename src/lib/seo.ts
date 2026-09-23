import { SITE } from './constants';

// ===== JSON-LD генераторы микроразметки =====

// LocalBusiness — базовая микроразметка для всех страниц
export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    legalName: SITE.legalName,
    description: 'Аренда фотозон в Красноярске и пригороде. Свадебные, детские, корпоративные, новогодние фотозоны. Доставка, монтаж и демонтаж включены.',
    image: `${SITE.url}/images/hero.jpg`,
    logo: `${SITE.url}/favicon.svg`,
    url: SITE.url,
    telephone: SITE.phoneRaw,
    email: SITE.email,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Парижской Коммуны, 33',
      addressLocality: 'Красноярск',
      addressRegion: 'Красноярский край',
      postalCode: '660049',
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '09:00', closes: '21:00',
    }],
    areaServed: [
      { '@type': 'City', name: 'Красноярск' },
      ...SITE.districts.map((d) => ({ '@type': 'AdministrativeArea', name: `${d} район Красноярска` })),
      ...SITE.suburbs.map((s) => ({ '@type': 'City', name: s })),
    ],
    sameAs: [
      `https://wa.me/${SITE.whatsapp}`,
      `https://t.me/${SITE.telegram}`,
    ],
  };
}

// Product + Offer + AggregateRating — для карточки фотозоны
export function productLd(p: {
  title: string; slug: string; description: string; basePrice: number;
  images?: string[]; rating?: number; reviewCount?: number;
}) {
  const product: any = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description.slice(0, 300),
    image: (p.images ?? []).map((i) => (i.startsWith('http') ? i : `${SITE.url}${i}`)),
    brand: { '@type': 'Brand', name: SITE.name },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: p.basePrice,
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/katalog/${p.slug}`,
      seller: { '@type': 'Organization', name: SITE.name },
      priceValidUntil: new Date(new Date().getFullYear() + 1, 11, 31).toISOString().slice(0, 10),
    },
  };
  if (p.rating && p.reviewCount) {
    product.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: p.rating.toFixed(1),
      reviewCount: p.reviewCount,
      bestRating: '5',
      worstRating: '1',
    };
  }
  return product;
}

// BreadcrumbList — хлебные крошки
export function breadcrumbsLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: `${SITE.url}${it.url}`,
    })),
  };
}

// FAQPage — для страниц с вопросами-ответами
export function faqLd(qa: { q: string; a: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: qa.map((x) => ({
      '@type': 'Question',
      name: x.q,
      acceptedAnswer: { '@type': 'Answer', text: x.a },
    })),
  };
}

// Review + AggregateRating — для страницы отзывов
export function reviewsLd(reviews: { author: string; text: string; rating: number }[]) {
  const agg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 5;
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: SITE.name,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: agg.toFixed(1),
      reviewCount: reviews.length || 1,
      bestRating: '5',
      worstRating: '1',
    },
    review: reviews.slice(0, 5).map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  };
}

// Article — для блог-статей
export function articleLd(a: { title: string; slug: string; excerpt: string; cover?: string; publishedAt: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    image: a.cover ? (a.cover.startsWith('http') ? a.cover : `${SITE.url}${a.cover}`) : `${SITE.url}/images/hero.jpg`,
    datePublished: a.publishedAt,
    dateModified: a.publishedAt,
    author: { '@type': 'Organization', name: SITE.name },
    publisher: {
      '@type': 'Organization',
      name: SITE.name,
      logo: { '@type': 'ImageObject', url: `${SITE.url}/favicon.svg` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${a.slug}` },
  };
}

// Service — для посадочных страниц (свадьбы, детские, выпускные, корпоративы)
export function serviceLd(opts: {
  name: string;
  description: string;
  slug: string;
  areaServed?: string[];
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: opts.name,
    description: opts.description,
    provider: { '@type': 'LocalBusiness', name: SITE.name, url: SITE.url },
    areaServed: opts.areaServed || [
      { '@type': 'City', name: 'Красноярск' },
      ...SITE.districts.map((d) => ({ '@type': 'AdministrativeArea', name: `${d} район` })),
      ...SITE.suburbs.map((s) => ({ '@type': 'City', name: s })),
    ],
    url: `${SITE.url}/${opts.slug}`,
    serviceType: 'Аренда фотозон',
  };
}

// WebPage — базовая микроразметка для любой страницы
export function webPageLd(opts: { title: string; description: string; url: string }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: opts.title,
    description: opts.description,
    url: `${SITE.url}${opts.url}`,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
  };
}

// CollectionPage — для каталога
export function collectionPageLd(opts: { name: string; description: string; url: string; itemCount?: number }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: opts.name,
    description: opts.description,
    url: `${SITE.url}${opts.url}`,
    isPartOf: { '@type': 'WebSite', name: SITE.name, url: SITE.url },
    ...(opts.itemCount ? { numberOfItems: opts.itemCount } : {}),
  };
}

export function jsonLd(obj: object) {
  return JSON.stringify(obj);
}
