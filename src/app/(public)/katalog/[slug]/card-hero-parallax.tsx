'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Ruler } from 'lucide-react';
import { formatPrice } from '@/lib/format';

export type CardHeroParallaxProps = {
  title: string;
  image: string;
  basePrice: number;
  calcPrice: number; // Цена без скидки (для зачёркнутой)
  badge: string | null;
  categoryLabel: string;
  occasionLabels: string[];
  sizeW: number | null;
  sizeH: number | null;
  slug: string;
};

/**
 * Parallax hero карточки фотозоны.
 *
 * Простой pseudo-3D parallax при движении мыши (±10px сдвиг).
 * 2 слоя: фоновое фото (дальше) + контент (ближе).
 * Уважает prefers-reduced-motion и touch-устройства.
 *
 * Изображение: priority (первый экран). sizes=100vw (на мобиле) / 80vw (десктоп).
 */
export function CardHeroParallax({
  title,
  image,
  basePrice,
  calcPrice,
  badge,
  categoryLabel,
  occasionLabels,
  sizeW,
  sizeH,
  slug,
}: CardHeroParallaxProps) {
  const reduce = useReducedMotion();
  const [parallaxOn, setParallaxOn] = React.useState(false);

  React.useEffect(() => {
    if (reduce) {
      setParallaxOn(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    setParallaxOn(mq.matches);
    const handler = (e: MediaQueryListEvent) => setParallaxOn(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [reduce]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springConfig = { stiffness: 100, damping: 22, mass: 0.5 };
  const sx = useSpring(mx, springConfig);
  const sy = useSpring(my, springConfig);

  // Лёгкий сдвиг ±10px (background), контент ±5px (ближе)
  const bgX = useTransform(sx, [-0.5, 0.5], [10, -10]);
  const bgY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  // Scale фона чуть больше, чтобы при сдвиге не появлялись пустые края
  const bgScale = 1.12;
  const contentX = useTransform(sx, [-0.5, 0.5], [-5, 5]);
  const contentY = useTransform(sy, [-0.5, 0.5], [-5, 5]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!parallaxOn) return;
    const rect = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - rect.left) / rect.width - 0.5);
    my.set((e.clientY - rect.top) / rect.height - 0.5);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  const showStrikethrough = calcPrice > basePrice;

  return (
    <section
      className="relative overflow-hidden border-b border-border/60 min-h-[60vh] sm:min-h-[70vh] flex flex-col"
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      aria-label={`${title} — заголовок`}
    >
      {/* Фоновое изображение (parallax layer 1) */}
      <motion.div
        aria-hidden
        style={parallaxOn ? { x: bgX, y: bgY } : undefined}
        className="absolute inset-0 -z-10 will-change-transform"
      >
        <Image
          src={image}
          alt={title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
          style={{ transform: `scale(${bgScale})` }}
        />
        {/* Градиентный оверлей — тёмный снизу для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
        {/* Дополнительная виньетка по краям */}
        <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-transparent to-background/60" />
      </motion.div>

      {/* Декоративный золотой блик */}
      <div className="absolute -top-20 right-1/4 w-72 h-72 rounded-full bg-gold/15 blur-3xl -z-10" aria-hidden />

      {/* Контент (parallax layer 2) */}
      <motion.div
        style={parallaxOn ? { x: contentX, y: contentY } : undefined}
        className="container mx-auto max-w-7xl px-4 pt-6 pb-10 flex-1 flex flex-col will-change-transform"
      >
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-auto">
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
              <BreadcrumbPage>{title}</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Заголовок + бейджи + цена */}
        <div className="mt-auto pt-12 sm:pt-16">
          <div className="flex flex-wrap gap-2 mb-4">
            {badge && (
              <Badge className="bg-gold text-primary-foreground border-0">
                {badge === 'HIT' ? 'Хит' : badge === 'NEW' ? 'Новинка' : badge}
              </Badge>
            )}
            <Badge variant="outline" className="border-gold/40 text-gold bg-background/40 backdrop-blur">
              {categoryLabel}
            </Badge>
            {occasionLabels.slice(0, 3).map((o) => (
              <Badge key={o} variant="outline" className="bg-background/40 backdrop-blur">
                {o}
              </Badge>
            ))}
          </div>

          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-tight tracking-tight max-w-3xl text-foreground drop-shadow-sm">
            {title}
          </h1>

          {/* Цена + размер */}
          <div className="mt-6 flex flex-wrap items-baseline gap-x-4 gap-y-3">
            <span className="font-display text-4xl sm:text-5xl text-gold leading-none font-nums drop-shadow">
              {formatPrice(basePrice)}
            </span>
            {showStrikethrough && (
              <s className="font-medium text-lg sm:text-xl text-muted-foreground/80 leading-none">
                {formatPrice(calcPrice)}
              </s>
            )}
            {showStrikethrough && (
              <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20 whitespace-nowrap">
                −15% при заказе готовой
              </Badge>
            )}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
            {sizeW && sizeH && (
              <span className="flex items-center gap-1.5">
                <Ruler className="w-4 h-4 text-gold" /> {sizeW} × {sizeH} м
              </span>
            )}
            {showStrikethrough && (
              <span className="text-xs text-muted-foreground/80">
                Зачёркнутая цена — сборка в калькуляторе · готовая фотозона на 15% дешевле
              </span>
            )}
            <Link
              href={`/katalog/${slug}`}
              className="text-xs text-gold hover:text-gold/80 underline-offset-4 hover:underline"
            >
              галерея ↓
            </Link>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
