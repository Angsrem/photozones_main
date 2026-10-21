'use client';

import * as React from 'react';
import Link from 'next/link';
import { SearchX, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OrderButton } from '@/components/site/quick-order-modal';

/**
 * Пустое состояние каталога — когда под фильтры не нашлось ни одной фотозоны.
 *
 * Server-friendly (нет state/effects) — вызывается из page.tsx.
 */
export function CatalogEmpty({ safeOccasion }: { safeOccasion?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/40 p-10 sm:p-16 text-center">
      <div className="mx-auto w-14 h-14 rounded-full bg-gold/10 flex items-center justify-center mb-4">
        <SearchX className="w-7 h-7 text-gold" />
      </div>
      <h2 className="font-display text-2xl mb-2">Под ваш фильтр ничего не нашлось</h2>
      <p className="text-muted-foreground max-w-md mx-auto mb-6">
        Попробуйте сбросить фильтры — или соберите фотозону в калькуляторе,
        менеджер подберёт аналог из наличия за 15 минут.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button asChild variant="outline" className="h-12 px-8">
          <Link href="/katalog">
            <ArrowRight className="w-4 h-4 mr-2 rotate-180" /> Сбросить фильтры
          </Link>
        </Button>
        <OrderButton
          prefill={{
            source: 'catalog-empty',
            sourcePage: '/katalog',
            occasion: safeOccasion,
          }}
          className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-2" /> Собрать в калькуляторе
        </OrderButton>
      </div>
    </div>
  );
}
