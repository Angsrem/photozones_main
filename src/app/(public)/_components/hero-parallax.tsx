'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { OrderButton } from '@/components/site/quick-order-modal';
import { Sparkles, Camera, Star, Clock, ShieldCheck } from 'lucide-react';

export type HeroParallaxProps = {
  heading?: React.ReactNode;
  paragraph?: React.ReactNode;
  avgRating: string;
  reviewsCount: number;
};

/**
 * Декоративные частицы для среднего параллакс-слоя.
 * Только DOM + CSS-анимация — никаких изображений, гиф, canvas.
 * Положение в процентах от контейнера hero.
 */
const PARTICLES: Array<{
  left: string;
  top: string;
  size: number;
  delay: number;
  duration: number;
}> = [
  { left: '12%', top: '22%', size: 6, delay: 0, duration: 11 },
  { left: '78%', top: '18%', size: 4, delay: 1.2, duration: 13 },
  { left: '88%', top: '64%', size: 8, delay: 2.4, duration: 15 },
  { left: '22%', top: '72%', size: 5, delay: 0.6, duration: 12 },
  { left: '60%', top: '38%', size: 4, delay: 1.8, duration: 14 },
  { left: '40%', top: '14%', size: 3, delay: 3, duration: 16 },
  { left: '92%', top: '38%', size: 5, delay: 0.9, duration: 12.5 },
  { left: '8%', top: '50%', size: 3, delay: 2.1, duration: 13.5 },
];

/**
 * Wow-hero с псевдо-3D параллаксом при движении мыши.
 *
 * Слои (дальние двигаются медленнее, ближние — быстрее):
 *  1. Размытый фон hero.png                  — depth: -8px (самый дальний)
 *  2. Тёплые золотые блики + световая полоса  — depth: -22px
 *  3. Парящие золотые частицы                 — depth: -30px
 *  4. Передний план: текст, CTA, badge        — depth: -44px (самый ближний)
 *
 * Производительность:
 *  - transform: translate3d через GPU
 *  - will-change: transform для слоёв
 *  - частицы — CSS-анимация (а не Framer Motion), не нагружает JS-поток
 *  - на touch-устройствах mousemove не срабатывает → слои статичны
 *  - при prefers-reduced-motion — все анимации отключаются
 */
export function HeroParallax({ heading, paragraph, avgRating, reviewsCount }: HeroParallaxProps) {
  const reduceMotion = useReducedMotion();
  const [parallaxOn, setParallaxOn] = React.useState(false);

  // Активируем параллакс только на устройствах с fine pointer (мышь/трекпад) и md+.
  React.useEffect(() => {
    if (reduceMotion) {
      setParallaxOn(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    setParallaxOn(mq.matches);
    const handler = (e: MediaQueryListEvent) => setParallaxOn(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [reduceMotion]);

  // Нормализованная позиция мыши: [-1, 1] от центра секции
  const mx = useMotionValue(0);
  const my = useMotionValue(0);

  // Spring для плавного lerp
  const springConfig = { stiffness: 80, damping: 20, mass: 0.5 };
  const sx = useSpring(mx, springConfig);
  const sy = useSpring(my, springConfig);

  // Разные глубины слоёв
  const bgX = useTransform(sx, [-1, 1], [-8, 8]);
  const bgY = useTransform(sy, [-1, 1], [-6, 6]);
  const midX = useTransform(sx, [-1, 1], [-22, 22]);
  const midY = useTransform(sy, [-1, 1], [-16, 16]);
  const particleX = useTransform(sx, [-1, 1], [-30, 30]);
  const particleY = useTransform(sy, [-1, 1], [-22, 22]);
  const fgX = useTransform(sx, [-1, 1], [-44, 44]);
  const fgY = useTransform(sy, [-1, 1], [-26, 26]);

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!parallaxOn) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
    mx.set(nx);
    my.set(ny);
  }

  function handleMouseLeave() {
    mx.set(0);
    my.set(0);
  }

  const layerStyle = (x: MotionValue<number>, y: MotionValue<number>) =>
    parallaxOn ? { x, y } : undefined;

  return (
    <section
      aria-label="Hero: аренда фотозон в Красноярске"
      className="relative min-h-screen min-h-[100svh] overflow-hidden bg-background"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* ===== Слой 1: размытая фоновая фотозона (дальний, самый медленный) ===== */}
      <motion.div
        aria-hidden
        style={layerStyle(bgX, bgY)}
        className="absolute inset-[-4%] will-change-transform"
      >
        <Image
          src="/images/hero.png"
          alt="Свадебная фотозона в аренду в Красноярске"
          fill
          priority
          sizes="100vw"
          className="object-cover scale-110 blur-[3px] opacity-60"
        />
        {/* Тёмные градиенты для читабельности текста + premium dark feel */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/80 to-background" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-background/30" />
        {/* Тёплая виньетка золотом */}
        <div className="absolute inset-0 hero-vignette" />
      </motion.div>

      {/* ===== Слой 2: тёплые золотые блики + световая полоса (средний) ===== */}
      <motion.div
        aria-hidden
        style={layerStyle(midX, midY)}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        {/* Большой тёплый золотой блик верх-лево */}
        <div className="absolute -top-1/4 -left-1/4 w-[60rem] h-[60rem] rounded-full bg-gold/15 blur-[120px]" />
        {/* Коралловый блик низ-право (приглушённый акцент) */}
        <div className="absolute -bottom-1/4 -right-1/4 w-[55rem] h-[55rem] rounded-full bg-coral/10 blur-[140px]" />
        {/* Центральный мягкий подсвет */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[40rem] h-[40rem] rounded-full bg-gold/10 blur-[100px]" />
        {/* Тонкая световая полоса */}
        <div
          className="absolute top-1/4 left-0 right-0 h-px opacity-40"
          style={{ background: 'linear-gradient(to right, transparent, var(--gold), transparent)' }}
        />
      </motion.div>

      {/* ===== Слой 3: парящие золотые частицы (средний-быстрый) ===== */}
      <motion.div
        aria-hidden
        style={layerStyle(particleX, particleY)}
        className="absolute inset-0 pointer-events-none will-change-transform"
      >
        {PARTICLES.map((p, i) => (
          <span
            key={i}
            className="absolute rounded-full bg-gold/70 animate-float-hero"
            style={{
              left: p.left,
              top: p.top,
              width: p.size,
              height: p.size,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.duration}s`,
              boxShadow: '0 0 8px rgba(255, 200, 100, 0.5)',
            }}
          />
        ))}
      </motion.div>

      {/* ===== Слой 4: передний план — текст, CTA, badge (быстрый) ===== */}
      <motion.div
        style={layerStyle(fgX, fgY)}
        className="relative container mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36 will-change-transform"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="mb-5"
          >
            <Badge className="bg-gold/15 text-gold border-gold/30 backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> 30+ мероприятий в месяц в Красноярске
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.05 }}
            className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5"
          >
            {heading ?? (
              <>
                Аренда фотозон <span className="text-gradient-gold">в Красноярске</span> под любое событие
              </>
            )}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.15 }}
            className="text-lg text-muted-foreground mb-7 max-w-xl"
          >
            {paragraph ??
              'Свадебные, детские и корпоративные фотозоны с доставкой и монтажом. Перезвоним за 15 минут.'}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.25 }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <OrderButton
              prefill={{ source: 'hero', sourcePage: '/' }}
              className="h-14 px-8 text-base bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Рассчитать стоимость
            </OrderButton>
            <Button
              asChild
              variant="outline"
              className="h-14 px-8 text-base backdrop-blur-sm bg-background/40"
            >
              <Link href="/katalog">
                <Camera className="w-5 h-5 mr-2" /> Смотреть каталог
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.35 }}
            className="flex flex-wrap items-center gap-5 mt-8 text-sm text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-gold text-gold" /> {avgRating} / 5 — {reviewsCount}+ отзывов
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold" /> Монтаж за 1 час
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" /> Договор и гарантия
            </span>
          </motion.div>
        </div>
      </motion.div>

      {/* Нижний fade → плавный переход в основной фон */}
      <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-b from-transparent to-background pointer-events-none" />

      {/* Индикатор скролла (только при включённой анимации) */}
      {!reduceMotion && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 hidden sm:flex flex-col items-center gap-2 text-muted-foreground/70 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.25em]">Листайте</span>
          <span className="w-px h-10 bg-gradient-to-b from-gold/60 to-transparent animate-scroll-line" />
        </div>
      )}
    </section>
  );
}
