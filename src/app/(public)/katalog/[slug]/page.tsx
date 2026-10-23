import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';
import { PhotozoneCard } from '@/components/site/photozone-card';
import { TransparentPricing } from '@/components/site/transparent-pricing';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { PhotozoneGallery } from './gallery';
import { OptionsWithStickyBar } from './options-with-sticky';
import { IncludesBlock } from './includes-block';
import { CardHeroParallax } from './card-hero-parallax';
import type { Option } from './options-selector';
import { PhotozoneReviewsCarousel } from '@/components/site/photozone-reviews-carousel';
import { db } from '@/lib/db';
import { getPhotozoneBySlug, getPhotozoneWithOptions, getPhotozones, getReviewsByPhotozone, asStringArray } from '@/lib/data';
import { localBusinessLd, productLd, breadcrumbsLd } from '@/lib/seo';
import { CATEGORIES, OCCASIONS, SITE } from '@/lib/constants';
import { Reveal, StaggerGroup, StaggerItem } from '../../_components/home-reveal';
import { ArrowRight } from 'lucide-react';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const pz = await getPhotozoneBySlug(slug);
  if (!pz) {
    return { title: 'Фотозона не найдена', robots: { index: false } };
  }
  const description = pz.description.slice(0, 158) + (pz.description.length > 158 ? '…' : '');
  const title = `${pz.title} — аренда фотозоны в Красноярске`;
  return {
    title,
    description,
    keywords: [
      `${pz.title} Красноярск`,
      `аренда ${pz.title.toLowerCase()}`,
      `фотозона ${pz.title.toLowerCase()} Красноярск`,
      'аренда фотозоны Красноярск',
    ],
    alternates: { canonical: `/katalog/${pz.slug}` },
    openGraph: {
      title: `${pz.title} — от ${pz.basePrice.toLocaleString('ru-RU')} ₽ | Fotoarka`,
      description,
      url: `${SITE.url}/katalog/${pz.slug}`,
      siteName: SITE.name,
      locale: 'ru_RU',
      type: 'website',
      images: asStringArray(pz.images).slice(0, 1).map((i) => ({
        url: i.startsWith('http') ? i : `${SITE.url}${i}`,
        width: 1200,
        height: 800,
        alt: `${pz.title} — аренда фотозоны в Красноярске`,
      })),
    },
  };
}

export async function generateStaticParams() {
  const zones = await db.photoZone.findMany({ where: { isActive: true }, select: { slug: true } });
  return zones.map((z) => ({ slug: z.slug }));
}

const catLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;
const occLabel = (o: string) => OCCASIONS.find((x) => x.value === o)?.label ?? o;

export default async function PhotozonePage({ params }: { params: Params }) {
  const { slug } = await params;
  const pz = await getPhotozoneWithOptions(slug);

  if (!pz || !pz.isActive) {
    notFound();
  }

  const images = asStringArray(pz.images);
  const videos = asStringArray(pz.videos);
  const includes = asStringArray(pz.includes);
  const occasions = asStringArray(pz.occasions);
  const elements = pz.elements ?? [];
  const options: Option[] = elements.map((e) => ({
    id: e.id, name: e.name, description: e.description, price: e.price,
    image: e.image, category: e.category || 'decor',
  }));
  const badge = pz.badge === 'HIT' ? 'HIT' : pz.badge === 'NEW' ? 'NEW' : null;

  // calc_price — обратный пересчёт из basePrice по формуле base = calc × 0.85.
  // Округляем до десятков, чтобы получить «цену при самостоятельной сборке».
  const calcPrice = Math.round((pz.basePrice / 0.85) / 10) * 10;

  // Похожие фотозоны той же категории
  const similarRaw = await getPhotozones({ category: pz.category, sort: 'hit', limit: 4 });
  const similar = similarRaw.filter((s) => s.id !== pz.id).slice(0, 3);

  // Отзывы по этой фотозоне
  const reviews = await getReviewsByPhotozone(pz.id, 12);

  const orderPrefill = {
    photozoneId: pz.id,
    photozoneTitle: pz.title,
    photozoneImage: images[0] ?? '/images/photozones/love.jpg',
    photozonePrice: pz.basePrice,
    source: 'photozone-card',
    sourcePage: `/katalog/${pz.slug}`,
  };

  // Данные для parallax hero
  const heroImage = images[0] ?? '/images/photozones/love.jpg';

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          productLd({
            title: pz.title,
            slug: pz.slug,
            description: pz.description.slice(0, 300),
            basePrice: pz.basePrice,
            images,
          }),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Каталог фотозон', url: '/katalog' },
            { name: pz.title, url: `/katalog/${pz.slug}` },
          ]),
        ]}
      />

      {/* ===== PARALLAX HERO ===== */}
      <CardHeroParallax
        title={pz.title}
        image={heroImage}
        basePrice={pz.basePrice}
        calcPrice={calcPrice}
        badge={badge}
        categoryLabel={catLabel(pz.category)}
        occasionLabels={occasions.map(occLabel)}
        sizeW={pz.sizeW}
        sizeH={pz.sizeH}
        slug={pz.slug}
      />

      {/* ===== ГАЛЕРЕЯ + ОПЦИИ (sticky sidebar) ===== */}
      <div className="container mx-auto max-w-7xl px-4 pt-10 pb-10 overflow-x-hidden">
        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 lg:gap-10 items-start">
          {/* Левая колонка: галерея + описание + состав + прозрачная цена */}
          <div className="min-w-0 space-y-10">
            <Reveal>
              <PhotozoneGallery images={images} videos={videos} title={pz.title} />
            </Reveal>

            {/* Описание */}
            <Reveal delay={0.05}>
              <section>
                <h2 className="font-display text-2xl mb-3">Описание</h2>
                <p className="text-muted-foreground leading-relaxed">{pz.description}</p>
              </section>
            </Reveal>

            {/* Состав фотозоны — что входит */}
            {includes.length > 0 && (
              <Reveal delay={0.05}>
                <IncludesBlock includes={includes} />
              </Reveal>
            )}

            {/* Прозрачная цена — детали (без монтажа/доставки, надбавки) */}
            <Reveal delay={0.05}>
              <TransparentPricing includes={includes} basePrice={pz.basePrice} />
            </Reveal>

            {/* Отзывы — оставляем carousel, добавлен Reveal-обёртка */}
            <Reveal delay={0.05}>
              <PhotozoneReviewsCarousel
                reviews={reviews.map((r) => ({
                  ...r,
                  publishedAt: r.publishedAt.toISOString(),
                  photos: (r.photos as string[]) || null,
                  videos: (r.videos as string[]) || null,
                }))}
                photozoneTitle={pz.title}
              />
            </Reveal>
          </div>

          {/* Правая колонка: опции (sticky sidebar на десктопе) */}
          <div className="min-w-0">
            <OptionsWithStickyBar
              options={options}
              basePrice={pz.basePrice}
              baseTitle={pz.title}
              orderPrefill={orderPrefill}
            />
          </div>
        </div>
      </div>

      {/* ===== ПОХОЖИЕ ФОТОЗОНЫ ===== */}
      {similar.length > 0 && (
        <section className="container mx-auto max-w-7xl px-4 mt-8 mb-10">
          <Reveal>
            <div className="flex items-end justify-between mb-6 gap-4">
              <div>
                <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">
                  Похожие
                </span>
                <h2 className="font-display text-2xl sm:text-3xl">Фотозоны в этой же категории</h2>
              </div>
              <Button asChild variant="ghost" className="shrink-0">
                <Link href="/katalog">
                  Весь каталог <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            </div>
          </Reveal>
          <StaggerGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
            {similar.map((s, i) => (
              <StaggerItem key={s.id}>
                <PhotozoneCard pz={s} index={i} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </section>
      )}

      {/* ===== ФИНАЛЬНЫЙ CTA ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-24 lg:pb-16">
        <Reveal>
          <CtaBand
            title="Хотите эту фотозону на свою дату?"
            subtitle="Оставьте заявку — менеджер перезвонит за 15 минут, подтвердим наличие или подберём аналог."
            prefill={{ ...orderPrefill, source: 'photozone-cta' }}
          />
        </Reveal>
      </section>
    </>
  );
}
