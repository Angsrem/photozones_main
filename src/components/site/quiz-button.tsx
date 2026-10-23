'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';

// Кнопка запуска квиза с автоподстановкой occasion по посадочной странице
const PAGE_TO_OCCASION: Record<string, string> = {
  '/svadby': 'WEDDING',
  '/detskie-prazdniki': 'BIRTHDAY',
  '/vypusknie': 'GRADUATION',
  '/korporativy': 'CORPORATE',
  '/prazdniki/novyj-god': 'NEW_YEAR',
  '/prazdniki/8-marta': 'MARCH_8',
  '/prazdniki/23-fevralya': 'FEB_23',
};

export function QuizButton({
  label = 'Подобрать фотозону за 60 секунд',
  className,
  variant = 'default',
  size,
  occasion,
}: {
  label?: string;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  occasion?: string;
}) {
  const pathname = usePathname();
  const occ = occasion || PAGE_TO_OCCASION[pathname || ''] || '';
  const href = occ ? `/kviz?occasion=${occ}&source=${pathname || '/'}` : '/kviz';
  return (
    <Button asChild variant={variant as any} size={size as any} className={className}>
      <Link href={href}>
        <Sparkles className="w-4 h-4 mr-2" /> {label}
      </Link>
    </Button>
  );
}

// Тонкая золотая полоса-квиз-CTA для посадочных
export function QuizStrip() {
  const pathname = usePathname();
  const occ = PAGE_TO_OCCASION[pathname || ''] || '';
  const href = occ ? `/kviz?occasion=${occ}&source=${pathname || '/'}` : '/kviz';
  return (
    <section className="container mx-auto max-w-7xl px-4 py-3">
      <Link
        href={href}
        className="group flex items-center gap-3 rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-card p-3 sm:p-4 hover:from-gold/15 transition-colors"
      >
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/15 shrink-0">
          <Sparkles className="w-5 h-5 text-gold" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium">Не знаете, что выбрать? Пройдите квиз за 60 секунд</div>
          <div className="text-xs text-muted-foreground">Покажем 3 варианта под ваш повод и бюджет · бонус: промокод 5%</div>
        </div>
        <ArrowRight className="w-5 h-5 text-gold shrink-0 group-hover:translate-x-1 transition-transform" />
      </Link>
    </section>
  );
}

