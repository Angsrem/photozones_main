import Link from 'next/link';
import type { Metadata } from 'next';
import { PhotozoneCard } from '@/components/site/photozone-card';
import { CatalogFilters } from './catalog-filters';
import { OrderButton } from '@/components/site/quick-order-modal';
import { CtaBand } from '@/components/site/cta-band';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizStrip } from '@/components/site/quiz-button';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { getPhotozones } from '@/lib/data';
import { CATEGORIES, OCCASIONS } from '@/lib/constants';
import { pluralize } from '@/lib/format';
import { Button } from '@/components/ui/button';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Sparkles, SearchX, ArrowRight } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Каталог фотозон в Красноярске — аренда с доставкой',
  description:
    'Каталог фотозон в аренду в Красноярске: свадебные, детские, корпоративные, новогодние. Цены от 8 900 ₽. Доставка, монтаж и демонтаж включены. Подбор по категории и поводу.',
  alternates: { canonical: '/katalog' },
};

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

function asString(v: string | string[] | undefined): string | undefined {
  if (Array.isArray(v)) return v[0];
  return v;
}

const VALID_CATEGORIES = CATEGORIES.map((c) => c.value);
const VALID_OCCASIONS = OCCASIONS.map((o) => o.value);
const VALID_SORTS = ['hit', 'new', 'price-asc', 'price-desc', 'rating-desc', 'reviews-desc'];

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const category = asString(sp.category);
  const occasion = asString(sp.occasion);
  const sort = asString(sp.sort);
  const search = asString(sp.search);

  const safeCategory = category && VALID_CATEGORIES.includes(category) ? category : undefined;
  const safeOccasion = occasion && VALID_OCCASIONS.includes(occasion) ? occasion : undefined;
  const safeSort = sort && VALID_SORTS.includes(sort) ? (sort as 'hit' | 'new' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc') : 'hit';
  const safeSearch = search?.trim() || undefined;

  const zones = await getPhotozones({
    category: safeCategory,
    occasion: safeOccasion,
    sort: safeSort,
    search: safeSearch,
  });

  const activeFilters: string[] = [];
  if (safeCategory) activeFilters.push(CATEGORIES.find((c) => c.value === safeCategory)?.label ?? safeCategory);
  if (safeOccasion) activeFilters.push(OCCASIONS.find((o) => o.value === safeOccasion)?.label ?? safeOccasion);
  if (safeSearch) activeFilters.push(`«${safeSearch}»`);

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Каталог фотозон', url: '/katalog' },
          ]),
        ]}
      />

      <PromoStrip page="/katalog" />

      <QuizStrip />

      {/* HERO + ХЛЕБНЫЕ КРОШКИ */}
      <section className="container mx-auto max-w-7xl px-4 pt-6 pb-4">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Каталог фотозон</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            Каталог · {zones.length} {pluralize(zones.length, ['фотозона', 'фотозоны', 'фотозон'])}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            Каталог фотозон <span className="text-gradient-gold">в Красноярске</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Аренда фотозон в Красноярске и пригороде для свадеб, дней рождения, корпоративов
            и сезонных праздников. Доставка по Центральному, Советскому, Свердловскому,
            Октябрьскому и другим районам города, монтаж за 1 час и демонтаж включены в стоимость.
            Подберите фотозону по категории, поводу и бюджету — оставьте заявку, перезвоним за 15 минут.
          </p>
        </div>
      </section>

      {/* ФИЛЬТРЫ */}
      <section className="container mx-auto max-w-7xl px-4 pb-6">
        <CatalogFilters
          initialCategory={safeCategory}
          initialOccasion={safeOccasion}
          initialSort={safeSort}
          initialSearch={safeSearch}
        />
      </section>

      {/* РЕЗУЛЬТАТЫ */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        {activeFilters.length > 0 && (
          <div className="text-sm text-muted-foreground mb-5">
            Показываем: <span className="text-foreground font-medium">{activeFilters.join(' · ')}</span>
          </div>
        )}

        {zones.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 sm:p-16 text-center">
            <div className="mx-auto w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
              <SearchX className="w-7 h-7 text-gold" />
            </div>
            <h2 className="font-display text-2xl mb-2">Ничего не нашли</h2>
            <p className="text-muted-foreground max-w-md mx-auto mb-6">
              По вашим фильтрам нет подходящих фотозон. Оставьте заявку — менеджер
              подберёт вариант под ваш повод и бюджет за 15 минут.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <OrderButton
                prefill={{
                  source: 'catalog-empty',
                  sourcePage: '/katalog',
                  occasion: safeOccasion,
                }}
                className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
              >
                <Sparkles className="w-4 h-4 mr-2" /> Подобрать фотозону
              </OrderButton>
              <Button asChild variant="outline" className="h-12 px-8">
                <Link href="/katalog">
                  <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Сбросить фильтры
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((pz, i) => (
              <PhotozoneCard key={pz.id} pz={pz} index={i} />
            ))}
          </div>
        )}
      </section>

      {/* CTA */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Не нашли подходящую фотозону?"
          subtitle="Опишите повод и бюджет — менеджер подберёт вариант из наличия или предложим сборную композицию под ваш сценарий."
          prefill={{ source: 'catalog-cta', sourcePage: '/katalog' }}
        />
      </section>
    </>
  );
}
