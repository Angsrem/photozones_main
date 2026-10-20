'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Search, SlidersHorizontal, X, Loader2, Star } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { CATEGORIES, OCCASIONS } from '@/lib/constants';
import { formatPrice } from '@/lib/format';
import { cn } from '@/lib/utils';

type SortValue = 'hit' | 'price-asc' | 'price-desc' | 'new' | 'rating-desc' | 'reviews-desc';

const SORTS: { value: SortValue; label: string }[] = [
  { value: 'hit', label: 'Сначала хиты' },
  { value: 'price-asc', label: 'Цена ↑' },
  { value: 'price-desc', label: 'Цена ↓' },
  { value: 'rating-desc', label: 'По рейтингу' },
  { value: 'reviews-desc', label: 'По отзывам' },
  { value: 'new', label: 'Новинки' },
];

// Жёсткий диапазон для цены (жёстко в UI — не запрашиваем min/max из БД,
// чтобы не плодить отдельный API-вызов; охватывает все 53 фотозоны с запасом)
const PRICE_MIN = 5_000;
const PRICE_MAX = 50_000;
const PRICE_STEP = 500;

const BADGES: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'HIT', label: 'Хиты' },
  { value: 'NEW', label: 'Новинки' },
];

export function CatalogFilters({
  initialCategory,
  initialOccasion,
  initialSort,
  initialSearch,
  initialPriceMin,
  initialPriceMax,
  initialHitOnly,
  initialBadge,
}: {
  initialCategory?: string;
  initialOccasion?: string;
  initialSort?: string;
  initialSearch?: string;
  initialPriceMin?: number;
  initialPriceMax?: number;
  initialHitOnly?: boolean;
  initialBadge?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  // Локальный state для ползунка цены (controlled slider needs immediate feedback)
  const [priceRange, setPriceRange] = React.useState<[number, number]>([
    initialPriceMin ?? PRICE_MIN,
    initialPriceMax ?? PRICE_MAX,
  ]);

  // Синхронизируем локальный state с URL-параметрами (например, при сбросе фильтров)
  React.useEffect(() => {
    setPriceRange([initialPriceMin ?? PRICE_MIN, initialPriceMax ?? PRICE_MAX]);
  }, [initialPriceMin, initialPriceMax]);

  const pushQuery = React.useCallback(
    (patch: Record<string, string | undefined | number | boolean | null>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(patch).forEach(([k, v]) => {
        if (v === undefined || v === null || v === '' || v === false) params.delete(k);
        else if (typeof v === 'boolean') params.set(k, '1');
        else params.set(k, String(v));
      });
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/katalog?${qs}` : '/katalog', { scroll: false });
      });
    },
    [router],
  );

  const hasFilters =
    !!initialCategory ||
    !!initialOccasion ||
    !!initialSearch ||
    (!!initialSort && initialSort !== 'hit') ||
    !!initialHitOnly ||
    (!!initialBadge && initialBadge !== 'ALL') ||
    (!!initialPriceMin && initialPriceMin > PRICE_MIN) ||
    (!!initialPriceMax && initialPriceMax < PRICE_MAX);

  const activeCount = [
    initialCategory,
    initialOccasion,
    initialSearch && 'search',
    initialSort && initialSort !== 'hit' && 'sort',
    initialHitOnly && 'hit',
    initialBadge && initialBadge !== 'ALL' && 'badge',
    (initialPriceMin && initialPriceMin > PRICE_MIN) && 'pmin',
    (initialPriceMax && initialPriceMax < PRICE_MAX) && 'pmax',
  ].filter(Boolean).length;

  // ===== Контент фильтров (используется и в сайдбаре, и в mobile sheet) =====
  const filtersContent = (
    <div className="space-y-5">
      {/* Поиск */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Поиск
        </label>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="По названию"
            defaultValue={initialSearch ?? ''}
            aria-label="Поиск фотозоны по названию"
            className="pl-9 h-11 bg-background"
            onChange={(e) => {
              const v = e.target.value.trim();
              pushQuery({
                search: v || undefined,
              });
            }}
          />
        </div>
      </div>

      <Separator />

      {/* Категория */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Категория
        </label>
        <Select
          value={initialCategory ?? 'ALL'}
          onValueChange={(v) => pushQuery({ category: v === 'ALL' ? undefined : v })}
        >
          <SelectTrigger className="h-11 w-full bg-background" aria-label="Категория фотозоны">
            <SelectValue placeholder="Категория" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Все категории</SelectItem>
            {CATEGORIES.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Повод */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Повод
        </label>
        <Select
          value={initialOccasion ?? 'ALL'}
          onValueChange={(v) => pushQuery({ occasion: v === 'ALL' ? undefined : v })}
        >
          <SelectTrigger className="h-11 w-full bg-background" aria-label="Повод">
            <SelectValue placeholder="Повод" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Любой повод</SelectItem>
            {OCCASIONS.map((o) => (
              <SelectItem key={o.value} value={o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <Separator />

      {/* Цена */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Цена
          </label>
          <span className="text-xs text-gold font-nums">
            {formatPrice(priceRange[0])} – {formatPrice(priceRange[1])}
          </span>
        </div>
        <div className="px-1">
          <Slider
            value={priceRange}
            min={PRICE_MIN}
            max={PRICE_MAX}
            step={PRICE_STEP}
            onValueChange={(v) => {
              const arr = v as unknown as number[];
              if (Array.isArray(arr) && arr.length === 2) {
                setPriceRange([arr[0], arr[1]]);
              }
            }}
            onValueCommit={(v) => {
              const arr = v as unknown as number[];
              if (Array.isArray(arr) && arr.length === 2) {
                pushQuery({
                  priceMin: arr[0] > PRICE_MIN ? arr[0] : undefined,
                  priceMax: arr[1] < PRICE_MAX ? arr[1] : undefined,
                });
              }
            }}
            className="py-2"
          />
        </div>
        <div className="flex justify-between text-[11px] text-muted-foreground/70 mt-1">
          <span>от {formatPrice(PRICE_MIN)}</span>
          <span>до {formatPrice(PRICE_MAX)}</span>
        </div>
      </div>

      <Separator />

      {/* Бейдж (HIT/NEW) + Хиты */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Отметки
        </label>
        <div className="grid grid-cols-3 gap-2">
          {BADGES.map((b) => {
            const active = (initialBadge ?? 'ALL') === b.value;
            return (
              <button
                key={b.value}
                type="button"
                onClick={() => pushQuery({ badge: b.value === 'ALL' ? undefined : b.value })}
                className={cn(
                  'h-9 rounded-md border text-xs font-medium transition-colors',
                  active
                    ? 'border-gold bg-gold/10 text-gold'
                    : 'border-border bg-card/40 hover:border-gold/40',
                )}
              >
                {b.label}
              </button>
            );
          })}
        </div>
        <label
          className={cn(
            'flex items-center gap-2.5 mt-3 p-2.5 rounded-md border cursor-pointer transition-colors',
            initialHitOnly ? 'border-gold bg-gold/5' : 'border-border hover:border-gold/40',
          )}
        >
          <Checkbox
            checked={!!initialHitOnly}
            onCheckedChange={(v) => pushQuery({ hitOnly: v === true ? true : undefined })}
            className="data-[state=checked]:bg-gold data-[state=checked]:border-gold"
          />
          <span className="flex items-center gap-1.5 text-sm">
            <Star className="w-3.5 h-3.5 text-gold" />
            Только хиты
          </span>
        </label>
      </div>

      <Separator />

      {/* Сортировка */}
      <div>
        <label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2 block">
          Сортировка
        </label>
        <Select
          value={initialSort ?? 'hit'}
          onValueChange={(v) => pushQuery({ sort: v === 'hit' ? undefined : v })}
        >
          <SelectTrigger className="h-11 w-full bg-background" aria-label="Сортировка">
            <SelectValue placeholder="Сортировка" />
          </SelectTrigger>
          <SelectContent>
            {SORTS.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Сброс */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground hover:text-foreground"
          onClick={() => startTransition(() => router.push('/katalog', { scroll: false }))}
        >
          <X className="w-4 h-4 mr-1" /> Сбросить фильтры
        </Button>
      )}
    </div>
  );

  return (
    <>
      {/* ===== Desktop sidebar ===== */}
      <aside className="hidden lg:block sticky top-20 h-fit">
        <div className="rounded-2xl border border-gold/30 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-xl shadow-black/20 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <h2 className="font-display text-lg">Фильтры</h2>
            {pending && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />}
            {activeCount > 0 && !pending && (
              <Badge className="ml-auto bg-gold/15 text-gold border border-gold/30">{activeCount}</Badge>
            )}
          </div>
          {filtersContent}
        </div>
      </aside>

      {/* ===== Mobile sheet ===== */}
      <div className="lg:hidden">
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              className="w-full h-11 justify-start border-gold/30 bg-card/60 backdrop-blur"
            >
              <SlidersHorizontal className="w-4 h-4 mr-2 text-gold" />
              Фильтры
              {hasFilters && (
                <Badge className="ml-2 bg-gold/15 text-gold border border-gold/30">
                  {activeCount}
                </Badge>
              )}
              {pending && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="top" className="max-h-[88vh] overflow-y-auto p-0">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60">
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold" /> Фильтры
                {activeCount > 0 && (
                  <Badge className="ml-1 bg-gold/15 text-gold border border-gold/30">
                    {activeCount}
                  </Badge>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="px-5 py-4 pb-8">{filtersContent}</div>
            <div className="sticky bottom-0 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t border-border">
              <Button
                className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
                onClick={() => setMobileOpen(false)}
              >
                Показать результаты
              </Button>
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
