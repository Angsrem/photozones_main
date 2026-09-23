import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/constants';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api', '/spasibo', '/podborka', '/qr'],
      },
      {
        userAgent: 'Yandex',
        allow: '/',
        disallow: ['/admin', '/api', '/spasibo', '/podborka', '/qr'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/admin', '/api', '/spasibo', '/podborka', '/qr'],
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
