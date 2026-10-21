import Link from 'next/link';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Sparkles } from 'lucide-react';
import { pluralize } from '@/lib/format';

/**
 * Компактный hero для каталога /katalog.
 *
 * Тёмный фон с лёгким градиентом + золотые акценты. Без parallax (он только на главной).
 * Содержит breadcrumbs + заголовок + подзаголовок с количеством фотозон.
 *
 * Server Component (статичный).
 */
export function CatalogHero({ count }: { count: number }) {
  return (
    <section
      className="relative overflow-hidden border-b border-border/60"
      aria-label="Заголовок каталога"
    >
      {/* Тёплый градиентный фон */}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-gold/5 via-background to-background" />
      <div className="absolute -top-24 left-1/4 w-72 h-72 rounded-full bg-gold/10 blur-3xl -z-10" aria-hidden />
      <div className="absolute -top-16 right-1/4 w-64 h-64 rounded-full bg-coral/8 blur-3xl -z-10" aria-hidden />

      <div className="container mx-auto max-w-7xl px-4 pt-6 pb-8">
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
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Каталог · {count} {pluralize(count, ['фотозона', 'фотозоны', 'фотозон'])}
          </span>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-3 tracking-tight">
            Каталог фотозон <span className="text-gradient-gold">в Красноярске</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            {count} {pluralize(count, ['фотозона', 'фотозоны', 'фотозон'])} в аренду
            <span className="text-foreground/70"> · </span>
            Доставка и монтаж включены
          </p>
        </div>
      </div>
    </section>
  );
}
