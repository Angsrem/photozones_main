import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { QrLanding } from './qr-landing';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Хотите такую же фотозону? — промокод QR10 на скидку 10%',
  description: 'Вы отсканировали QR-код на фотозоне! Получите скидку 10% на аренду любой фотозоны в Красноярске по промокоду QR10.',
  alternates: { canonical: '/qr' },
  robots: { index: false, follow: true }, // landing только для QR-трафика
};

export default function QrPage() {
  return (
    <>
      <JsonLd data={[localBusinessLd(), breadcrumbsLd([{ name: 'QR-промокод', url: '/qr' }])]} />
      <QrLanding />
    </>
  );
}
