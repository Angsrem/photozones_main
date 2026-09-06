import { db } from '@/lib/db';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { PODBORKA_SHEET } from './podborka-client';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';

export const runtime = 'nodejs';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const session = await db.quizSession.findUnique({ where: { id } });
  if (!session) return { title: 'Подборка не найдена' };
  return {
    title: 'Ваша подборка фотозон — ФотоЗона24 Красноярск',
    description: 'Подборка фотозон под ваш повод и бюджет. Промокод на скидку внутри.',
    robots: { index: false, follow: true },
  };
}

export default async function PodborkaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await db.quizSession.findUnique({ where: { id } });
  if (!session || session.expiresAt < new Date()) notFound();

  const ids = (session.recommendedIds as string[]) || [];
  const zones = await db.photoZone.findMany({ where: { id: { in: ids } } });
  const ordered = ids.map((zid) => zones.find((z) => z.id === zid)).filter(Boolean) as typeof zones;

  // инкремент просмотров
  await db.quizSession.update({ where: { id }, data: { views: { increment: 1 } } }).catch(() => {});

  const answers = (session.answers as any) || {};

  return (
    <>
      <JsonLd data={[localBusinessLd(), breadcrumbsLd([{ name: 'Главная', url: '/' }, { name: 'Подборка', url: `/podborka/${id}` }])]} />
      <PODBORKA_SHEET
        session={{
          id: session.id,
          promoCode: session.promoCode,
          expiresAt: session.expiresAt.toISOString(),
          answers,
        }}
        zones={ordered.map((z) => ({
          id: z.id, slug: z.slug, title: z.title, basePrice: z.basePrice,
          images: z.images as string[], sizeW: z.sizeW, sizeH: z.sizeH,
          includes: z.includes as string[], badge: z.badge, hit: z.hit,
        }))}
      />
    </>
  );
}
