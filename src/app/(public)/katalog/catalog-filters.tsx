'use client';

import { useRouter } from 'next/navigation';
import { useCallback, useTransition } from 'react';
import { Search, SlidersHorizontal, X, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CATEGORIES, OCCASIONS } from '@/lib/constants';

type SortValue = 'hit' | 'price-asc' | 'price-desc' | 'new' | 'rating-desc' | 'reviews-desc';

const SORTS: { value: SortValue; label: string }[] = [
  { value: 'hit', label: 'Сначала хиты' },
  { value: 'price-asc', label: 'Цена ↑' },
  { value: 'price-desc', label: 'Цена ↓' },
  { value: 'rating-desc', label: 'По рейтингу' },
  { value: 'reviews-desc', label: 'По отзывам' },
  { value: 'new', label: 'Новинки' },
];

export function CatalogFilters({
  initialCategory,
  initialOccasion,
  initialSort,
  initialSearch,
}: {
  initialCategory?: string;
  initialOccasion?: string;
  initialSort?: string;
  initialSearch?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const pushQuery = useCallback(
    (patch: Record<string, string | undefined>) => {
      const params = new URLSearchParams(window.location.search);
      Object.entries(patch).forEach(([k, v]) => {
        if (!v) params.delete(k);
        else params.set(k, v);
      });
      const qs = params.toString();
      startTransition(() => {
        router.push(qs ? `/katalog?${qs}` : '/katalog', { scroll: false });
      });
    },
    [router],
  );

  const hasFilters =
    !!initialCategory || !!initialOccasion || !!initialSearch || (!!initialSort && initialSort !== 'hit');

  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4 sm:p-5 sticky top-3 z-20 backdrop-blur supports-[backdrop-filter]:bg-card/50">
      <div className="flex items-center gap-2 mb-3 text-sm text-muted-foreground">
        <SlidersHorizontal className="w-4 h-4 text-gold" />
        <span className="font-medium text-foreground">Фильтры</span>
        {pending && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Поиск */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <Input
            type="search"
            placeholder="Поиск по названию"
            defaultValue={initialSearch ?? ''}
            aria-label="Поиск фотозоны по названию"
            className="pl-9 h-11 bg-background"
            onChange={(e) => {
              const v = e.target.value.trim();
              pushQuery({
                search: v || undefined,
                category: initialCategory,
                occasion: initialOccasion,
                sort: initialSort,
              });
            }}
          />
        </div>

        {/* Категория */}
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

        {/* Повод */}
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

        {/* Сортировка */}
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

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
            onClick={() => startTransition(() => router.push('/katalog', { scroll: false }))}
          >
            <X className="w-4 h-4 mr-1" /> Сбросить фильтры
          </Button>
        </div>
      )}
    </div>
  );
}
