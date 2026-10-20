import Link from 'next/link';
import type { Metadata } from 'next';
import { CatalogFilters } from './catalog-filters';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizStrip } from '@/components/site/quiz-button';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, collectionPageLd } from '@/lib/seo';
import { getPhotozones } from '@/lib/data';
import { CATEGORIES, OCCASIONS } from '@/lib/constants';
import { pluralize } from '@/lib/format';
import { Badge } from '@/components/ui/badge';
import { CatalogHero } from './_components/catalog-hero';
import { CatalogGrid } from './_components/catalog-grid';
import { CatalogEmpty } from './_components/catalog-empty';
import { CatalogParallaxCta } from './_components/catalog-parallax-cta';
import { ArrowRight } from 'lucide-react';

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

function asNumber(v: string | string[] | undefined): number | undefined {
  const s = asString(v);
  if (!s) return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? n : undefined;
}

function asBool(v: string | string[] | undefined): boolean | undefined {
  const s = asString(v);
  if (!s) return undefined;
  return s === '1' || s === 'true' || s === 'yes';
}

const VALID_CATEGORIES = CATEGORIES.map((c) => c.value) as string[];
const VALID_OCCASIONS = OCCASIONS.map((o) => o.value) as string[];
const VALID_SORTS = ['hit', 'new', 'price-asc', 'price-desc', 'rating-desc', 'reviews-desc'];
const VALID_BADGES = ['HIT', 'NEW'];

export default async function CatalogPage({ searchParams }: { searchParams: SearchParams }) {
  const sp = await searchParams;

  const category = asString(sp.category);
  const occasion = asString(sp.occasion);
  const sort = asString(sp.sort);
  const search = asString(sp.search);
  const priceMin = asNumber(sp.priceMin);
  const priceMax = asNumber(sp.priceMax);
  const hitOnly = asBool(sp.hitOnly);
  const badge = asString(sp.badge);

  const safeCategory = category && VALID_CATEGORIES.includes(category) ? category : undefined;
  const safeOccasion = occasion && VALID_OCCASIONS.includes(occasion) ? occasion : undefined;
  const safeSort = sort && VALID_SORTS.includes(sort)
    ? (sort as 'hit' | 'new' | 'price-asc' | 'price-desc' | 'rating-desc' | 'reviews-desc')
    : 'hit';
  const safeSearch = search?.trim() || undefined;
  const safeBadge = badge && VALID_BADGES.includes(badge) ? badge : undefined;

  // Основной запрос — category/occasion/sort/search обрабатываются в lib
  let zones = await getPhotozones({
    category: safeCategory,
    occasion: safeOccasion,
    sort: safeSort,
    search: safeSearch,
  });

  // Дополнительные JS-фильтры (price/hit/badge) — не трогая lib/data.ts
  if (priceMin !== undefined) {
    zones = zones.filter((z) => z.basePrice >= priceMin);
  }
  if (priceMax !== undefined) {
    zones = zones.filter((z) => z.basePrice <= priceMax);
  }
  if (hitOnly) {
    zones = zones.filter((z) => z.hit);
  }
  if (safeBadge) {
    zones = zones.filter((z) => z.badge === safeBadge);
  }

  const activeFilters: string[] = [];
  if (safeCategory) activeFilters.push(CATEGORIES.find((c) => c.value === safeCategory)?.label ?? safeCategory);
  if (safeOccasion) activeFilters.push(OCCASIONS.find((o) => o.value === safeOccasion)?.label ?? safeOccasion);
  if (safeSearch) activeFilters.push(`«${safeSearch}»`);
  if (safeBadge) activeFilters.push(safeBadge === 'HIT' ? 'Хиты' : 'Новинки');
  if (hitOnly) activeFilters.push('Только хиты');
  if (priceMin !== undefined || priceMax !== undefined) {
    const min = priceMin ?? 0;
    const max = priceMax ?? 50_000;
    activeFilters.push(`${min.toLocaleString('ru-RU')}–${max.toLocaleString('ru-RU')} ₽`);
  }

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          collectionPageLd({
            name: 'Каталог фотозон в Красноярске',
            description: 'Все фотозоны в аренду: свадебные, детские, корпоративные, новогодние. Доставка, монтаж и демонтаж включены.',
            url: '/katalog',
            itemCount: zones.length,
          }),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Каталог фотозон', url: '/katalog' },
          ]),
        ]}
      />

      <PromoStrip page="/katalog" />

      <QuizStrip />

      {/* ===== COMPACT HERO ===== */}
      <CatalogHero count={zones.length} />

      {/* ===== FILTERS + GRID ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-[260px_1fr] gap-6 lg:gap-8 items-start">
          {/* Filters: desktop sticky sidebar + mobile sheet */}
          <CatalogFilters
            initialCategory={safeCategory}
            initialOccasion={safeOccasion}
            initialSort={safeSort}
            initialSearch={safeSearch}
            initialPriceMin={priceMin}
            initialPriceMax={priceMax}
            initialHitOnly={hitOnly}
            initialBadge={safeBadge}
          />

          {/* Results */}
          <div className="min-w-0">
            {activeFilters.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground mb-5">
                <span className="text-muted-foreground/70">Показываем:</span>
                {activeFilters.map((f) => (
                  <Badge key={f} variant="outline" className="border-gold/30 text-gold/90">
                    {f}
                  </Badge>
                ))}
                <Link
                  href="/katalog"
                  className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Сбросить <ArrowRight className="w-3 h-3" />
                </Link>
              </div>
            )}

            {zones.length === 0 ? (
              <CatalogEmpty safeOccasion={safeOccasion} />
            ) : (
              <>
                <div className="mb-4 text-sm text-muted-foreground">
                  {zones.length} {pluralize(zones.length, ['фотозона', 'фотозоны', 'фотозон'])} найдено
                </div>
                <CatalogGrid zones={zones} />
              </>
            )}
          </div>
        </div>
      </section>

      {/* ===== PARALLAX CTA ===== */}
      <CatalogParallaxCta
        title="Не нашли подходящую фотозону?"
        subtitle="Опишите повод и бюджет — менеджер подберёт вариант из наличия или предложим сборную композицию под ваш сценарий."
        prefill={{ source: 'catalog-cta', sourcePage: '/katalog' }}
      />
    </>
  );
}
