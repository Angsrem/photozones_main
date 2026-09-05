import { SITE } from './constants';

// JSON-LD генераторы микроразметки
export function localBusinessLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE.url}/#business`,
    name: SITE.name,
    legalName: SITE.legalName,
    image: `${SITE.url}/images/hero.png`,
    url: SITE.url,
    telephone: SITE.phoneRaw,
    email: SITE.email,
    priceRange: '₽₽',
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'ул. Парижской Коммуны, 33',
      addressLocality: 'Красноярск',
      addressRegion: 'Красноярский край',
      addressCountry: 'RU',
    },
    geo: { '@type': 'GeoCoordinates', latitude: SITE.geo.lat, longitude: SITE.geo.lng },
    openingHoursSpecification: [{
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'],
      opens: '09:00', closes: '21:00',
    }],
    areaServed: [SITE.city, ...SITE.suburbs],
  };
}

export function productLd(p: { title: string; slug: string; description: string; basePrice: number; images?: string[] }) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: p.title,
    description: p.description,
    image: (p.images ?? []).map((i) => (i.startsWith('http') ? i : `${SITE.url}${i}`)),
    offers: {
      '@type': 'Offer',
      priceCurrency: 'RUB',
      price: p.basePrice,
      availability: 'https://schema.org/InStock',
      url: `${SITE.url}/katalog/${p.slug}`,
    },
  };
}

export function breadcrumbsLd(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem', position: i + 1, name: it.name, item: `${SITE.url}${it.url}`,
    })),
  };
}

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
    },
    review: reviews.map((r) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: r.author },
      reviewBody: r.text,
      reviewRating: { '@type': 'Rating', ratingValue: r.rating, bestRating: 5 },
    })),
  };
}

export function jsonLd(obj: object) {
  return JSON.stringify(obj);
}
