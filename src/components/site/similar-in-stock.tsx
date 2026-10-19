'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Sparkles, Tag, Info, TrendingDown } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export type SimilarPhotozone = {
  id: string;
  slug: string;
  title: string;
  basePrice: number;
  images: unknown; // Json: string[]
  sizeW: number | null;
  sizeH: number | null;
  hit: boolean;
  badge: string | null;
  category: string;
  description: string;
};

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

type Status = 'idle' | 'loading' | 'loaded' | 'empty' | 'error';

/**
 * Блок «Похожие из наличия за ±15%».
 *
 * Запрашивает с /api/photozones/by-price фотозоны в диапазоне [calcPrice×0.85 .. calcPrice×1.15].
 * Показывает 3–5 карточек: фото, название, basePrice, «Экономия от калькулятора: X ₽», кнопка «Подробнее».
 *
 * Если nothing found — показывает: «Похожих фотозон из наличия не найдено. Оформите индивидуальный заказ.»
 *
 * Используется в калькуляторе (после расчёта) и конструкторе (в sticky-сайдбаре).
 */
export function SimilarInStock({
  calcPrice,
  excludeSlug,
  limit = 5,
  variant = 'grid',
  className = '',
}: {
  calcPrice: number;
  excludeSlug?: string;
  limit?: number;
  variant?: 'grid' | 'compact';
  className?: string;
}) {
  const [items, setItems] = React.useState<SimilarPhotozone[]>([]);
  const [status, setStatus] = React.useState<Status>('idle');

  React.useEffect(() => {
    if (!calcPrice || calcPrice <= 0) {
      setStatus('idle');
      setItems([]);
      return;
    }

    let cancelled = false;
    const min = Math.max(0, Math.round(calcPrice * 0.85));
    const max = Math.round(calcPrice * 1.15);

    setStatus('loading');
    (async () => {
      try {
        const params = new URLSearchParams({ min: String(min), max: String(max), limit: String(limit) });
        if (excludeSlug) params.set('exclude', excludeSlug);
        const res = await fetch(`/api/photozones/by-price?${params.toString()}`, { cache: 'no-store' });
        if (!res.ok) throw new Error('network');
        const data = (await res.json()) as { items: SimilarPhotozone[] };
        if (cancelled) return;
        setItems(data.items ?? []);
        setStatus((data.items?.length ?? 0) === 0 ? 'empty' : 'loaded');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [calcPrice, excludeSlug, limit]);

  if (status === 'idle') return null;

  // === Заголовок блока ===
  const Header = (
    <div className="flex items-start gap-2.5 mb-4">
      <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-gold/15 text-gold shrink-0">
        <Tag className="w-5 h-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-display text-lg sm:text-xl leading-tight flex items-center gap-2 flex-wrap">
          Похожие из наличия
          <Badge variant="outline" className="text-gold border-gold/40">±15%</Badge>
        </h3>
        <p className="text-sm text-muted-foreground mt-0.5">
          Готовые фотозоны в диапазоне {formatPrice(Math.round(calcPrice * 0.85))} – {formatPrice(Math.round(calcPrice * 1.15))}
        </p>
      </div>
    </div>
  );

  if (status === 'loading') {
    return (
      <section className={className} aria-label="Похожие фотозоны из наличия">
        {Header}
        <div className={variant === 'grid' ? 'grid gap-3 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-3'}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className={variant === 'grid' ? 'h-[180px] rounded-2xl' : 'h-[88px] rounded-xl'} />
          ))}
        </div>
      </section>
    );
  }

  if (status === 'error') {
    return (
      <section className={className} aria-label="Похожие фотозоны из наличия">
        {Header}
        <div className="rounded-2xl border border-border bg-background p-4 text-sm text-muted-foreground flex items-start gap-2">
          <Info className="w-4 h-4 mt-0.5 text-gold shrink-0" />
          <span>
            Не удалось загрузить похожие фотозоны. Попробуйте позже или закажите индивидуальную сборку.
          </span>
        </div>
      </section>
    );
  }

  if (status === 'empty') {
    return (
      <section className={className} aria-label="Похожие фотозоны из наличия">
        {Header}
        <div className="rounded-2xl border border-dashed border-border bg-background p-5 text-center">
          <p className="text-sm text-muted-foreground">
            Похожих фотозон из наличия не найдено.{' '}
            <Link href="/kalkulyator" className="text-gold font-medium underline underline-offset-4 hover:text-gold/80">
              Оформите индивидуальный заказ
            </Link>
            .
          </p>
        </div>
      </section>
    );
  }

  // === loaded ===
  if (variant === 'compact') {
    // Компактный список (для sidebar конструктора)
    return (
      <section className={className} aria-label="Похожие фотозоны из наличия">
        {Header}
        <div className="space-y-2.5">
          {items.map((pz, i) => {
            const images = asStringArray(pz.images);
            const img = images[0] || '/images/photozones/love.jpg';
            const savings = calcPrice - pz.basePrice;
            return (
              <motion.div
                key={pz.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.3) }}
                className="group flex gap-3 rounded-xl border border-border bg-background hover:border-gold/50 transition-colors overflow-hidden"
              >
                <Link href={`/katalog/${pz.slug}`} className="relative w-20 h-20 sm:w-24 sm:h-24 shrink-0 overflow-hidden" aria-label={pz.title}>
                  <Image
                    src={img}
                    alt={pz.title}
                    fill
                    sizes="96px"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </Link>
                <div className="flex-1 min-w-0 p-2.5 flex flex-col justify-between">
                  <div className="min-w-0">
                    <Link href={`/katalog/${pz.slug}`} className="block">
                      <h4 className="font-display text-sm leading-tight truncate group-hover:text-gold transition-colors">
                        {pz.title}
                      </h4>
                    </Link>
                    {pz.sizeW && pz.sizeH && (
                      <p className="text-xs text-muted-foreground mt-0.5">{pz.sizeW} × {pz.sizeH} м</p>
                    )}
                  </div>
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <div className="font-display text-base text-gold leading-none">{formatPrice(pz.basePrice)}</div>
                      {savings > 0 && (
                        <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5">
                          <TrendingDown className="w-3 h-3" />
                          <span>Экономия {formatPrice(savings)}</span>
                        </div>
                      )}
                    </div>
                    <Button asChild size="sm" variant="outline" className="h-8 px-2.5 shrink-0 text-xs">
                      <Link href={`/katalog/${pz.slug}`}>
                        Подробнее <ArrowRight className="w-3 h-3 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>
    );
  }

  // === grid variant (для калькулятора ResultView) ===
  return (
    <section className={className} aria-label="Похожие фотозоны из наличия">
      {Header}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
        {items.map((pz, i) => {
          const images = asStringArray(pz.images);
          const img = images[0] || '/images/photozones/love.jpg';
          const savings = calcPrice - pz.basePrice;
          const badgeLabel = pz.badge === 'HIT' ? 'Хит' : pz.badge === 'NEW' ? 'Новинка' : null;
          return (
            <motion.article
              key={pz.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: Math.min(i * 0.06, 0.35) }}
              className="group flex flex-col rounded-2xl border border-border bg-card overflow-hidden hover:border-gold/50 hover:shadow-lg transition-all"
            >
              <Link
                href={`/katalog/${pz.slug}`}
                className="relative block aspect-[4/3] overflow-hidden"
                aria-label={pz.title}
              >
                <Image
                  src={img}
                  alt={pz.title}
                  fill
                  sizes="(max-width: 768px) 100vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />
                <div className="absolute top-2.5 left-2.5 flex gap-1.5">
                  {badgeLabel && (
                    <Badge className="bg-gold text-primary-foreground border-0 text-[10px] px-2 py-0.5">
                      {badgeLabel}
                    </Badge>
                  )}
                  {pz.hit && !badgeLabel && (
                    <Badge className="bg-gold text-primary-foreground border-0 text-[10px] px-2 py-0.5">Хит</Badge>
                  )}
                </div>
                <h4 className="absolute bottom-2.5 left-2.5 right-2.5 font-display text-base sm:text-lg text-white drop-shadow leading-tight line-clamp-2">
                  {pz.title}
                </h4>
              </Link>

              <div className="p-3.5 flex flex-col gap-2.5 flex-1">
                {pz.sizeW && pz.sizeH && (
                  <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <span className="inline-block w-1 h-1 rounded-full bg-gold" />
                    {pz.sizeW} × {pz.sizeH} м
                  </p>
                )}
                <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{pz.description}</p>

                <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="font-display text-xl text-gold leading-none">{formatPrice(pz.basePrice)}</span>
                    {savings > 0 && (
                      <span className="flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <TrendingDown className="w-3.5 h-3.5" />
                        Экономия {formatPrice(savings)}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1">Экономия от калькулятора</p>
                </div>

                <Button asChild size="sm" className="h-10 w-full bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
                  <Link href={`/katalog/${pz.slug}`}>
                    Подробнее <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </motion.article>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground text-center mt-4 flex items-center justify-center gap-1.5">
        <Sparkles className="w-3.5 h-3.5 text-gold" />
        <span>Готовая фотозона дешевле на 15% — соберите её в калькуляторе и увидите разницу</span>
      </p>
    </section>
  );
}
