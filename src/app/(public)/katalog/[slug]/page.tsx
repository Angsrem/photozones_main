import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { PhotozoneCard } from '@/components/site/photozone-card';
import { TransparentPricing } from '@/components/site/transparent-pricing';
import { OrderButton } from '@/components/site/quick-order-modal';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { PhotozoneGallery } from './gallery';
import { OptionsWithStickyBar } from './options-with-sticky';
import type { Option } from './options-selector';
import { PhotozoneReviewsCarousel } from '@/components/site/photozone-reviews-carousel';
import { db } from '@/lib/db';
import { getPhotozoneBySlug, getPhotozoneWithOptions, getPhotozones, getReviewsByPhotozone, asStringArray } from '@/lib/data';
import { localBusinessLd, productLd, breadcrumbsLd } from '@/lib/seo';
import { CATEGORIES, OCCASIONS, SITE } from '@/lib/constants';
import { formatPrice, formatPriceFrom } from '@/lib/format';
import {
  Sparkles,
  Ruler,
  Phone,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';

type Params = Promise<{ slug: string }>;

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params;
  const pz = await getPhotozoneBySlug(slug);
  if (!pz) {
    return { title: 'Фотозона не найдена' };
  }
  const description = pz.description.slice(0, 158) + (pz.description.length > 158 ? '…' : '');
  return {
    title: pz.title,
    description,
    alternates: { canonical: `/katalog/${pz.slug}` },
    openGraph: {
      title: pz.title,
      description,
      images: asStringArray(pz.images).slice(0, 1).map((i) => ({
        url: i.startsWith('http') ? i : `${SITE.url}${i}`,
        width: 1200,
        height: 800,
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
  const badge = pz.badge === 'HIT' ? 'Хит' : pz.badge === 'NEW' ? 'Новинка' : null;

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

      <div className="container mx-auto max-w-7xl px-4 pt-6 pb-10">
        {/* ХЛЕБНЫЕ КРОШКИ */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/katalog">Каталог</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>{pz.title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_1fr] gap-6 lg:gap-10">
          {/* ГАЛЕРЕЯ + КНОПКА ОТЗЫВОВ */}
          <div>
            <PhotozoneGallery images={images} videos={videos} title={pz.title} />
            <PhotozoneReviewsCarousel reviews={reviews.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }))} photozoneTitle={pz.title} />
          </div>

          {/* ИНФО + ОРДЕР */}
          <div className="lg:sticky lg:top-6 lg:self-start space-y-5">
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {badge && (
                  <Badge className="bg-gold text-primary-foreground border-0">{badge}</Badge>
                )}
                <Badge variant="outline" className="border-gold/30 text-gold">
                  {catLabel(pz.category)}
                </Badge>
                {occasions.slice(0, 3).map((o) => (
                  <Badge key={o} variant="outline">
                    {occLabel(o)}
                  </Badge>
                ))}
              </div>
              <h1 className="font-display text-3xl sm:text-4xl leading-tight mb-3">
                {pz.title}
              </h1>
              <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                <span className="font-display text-2xl sm:text-3xl text-gold">
                  {formatPriceFrom(pz.basePrice)}
                </span>
                {pz.sizeW && pz.sizeH && (
                  <span className="text-sm text-muted-foreground flex items-center gap-1.5">
                    <Ruler className="w-4 h-4" /> {pz.sizeW} × {pz.sizeH} м
                  </span>
                )}
              </div>
            </div>

            <Separator />

            {/* ОПИСАНИЕ */}
            <div>
              <h2 className="font-display text-lg mb-2">Описание</h2>
              <p className="text-muted-foreground leading-relaxed">{pz.description}</p>
            </div>

            {/* ПРОЗРАЧНАЯ ЦЕНА */}
            {includes.length > 0 && (
              <TransparentPricing includes={includes} basePrice={pz.basePrice} />
            )}

            {/* ОПЦИИ + STICKY-БАР */}
            <OptionsWithStickyBar
              options={options}
              basePrice={pz.basePrice}
              baseTitle={pz.title}
              orderPrefill={orderPrefill}
            />
          </div>
        </div>

        {/* ПОХОЖИЕ ФОТОЗОНЫ */}
        {similar.length > 0 && (
          <section className="mt-16">
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
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {similar.map((s, i) => (
                <PhotozoneCard key={s.id} pz={s} index={i} />
              ))}
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="mt-14">
          <CtaBand
            title="Хотите эту фотозону на свою дату?"
            subtitle="Оставьте заявку — менеджер перезвонит за 15 минут, подтвердим наличие или подберём аналог."
            prefill={{ ...orderPrefill, source: 'photozone-cta' }}
          />
        </section>
      </div>
    </>
  );
}
