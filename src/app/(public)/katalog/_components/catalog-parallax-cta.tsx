'use client';

import * as React from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { CtaBand } from '@/components/site/cta-band';

/**
 * CtaBand с лёгким parallax-фоном (scroll-driven, не mouse).
 * Использует useScroll + useTransform (GPU transform, не layout).
 * Уважает prefers-reduced-motion — в этом случае рендерит обычный CtaBand.
 */
export function CatalogParallaxCta({
  title,
  subtitle,
  prefill,
}: {
  title?: string;
  subtitle?: string;
  prefill?: Record<string, unknown>;
}) {
  const reduce = useReducedMotion();
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ['start end', 'end start'],
  });

  // Лёгкий сдвиг фоновых «пятен»: ±24px (не сильный)
  const y1 = useTransform(scrollYProgress, [0, 1], [-24, 24]);
  const y2 = useTransform(scrollYProgress, [0, 1], [24, -24]);
  const opacity = useTransform(scrollYProgress, [0, 0.4, 1], [0.2, 0.4, 0.2]);

  if (reduce) {
    return (
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand title={title} subtitle={subtitle} prefill={prefill} />
      </section>
    );
  }

  return (
    <section className="container mx-auto max-w-7xl px-4 pb-16" ref={ref}>
      <div className="relative overflow-hidden rounded-2xl">
        {/* Parallax-фон: два «золотых» пятна, движутся в разные стороны */}
        <motion.div
          aria-hidden
          style={{ y: y1, opacity }}
          className="pointer-events-none absolute -top-24 -left-20 w-72 h-72 rounded-full bg-gold/15 blur-3xl"
        />
        <motion.div
          aria-hidden
          style={{ y: y2, opacity }}
          className="pointer-events-none absolute -bottom-32 -right-20 w-80 h-80 rounded-full bg-coral/10 blur-3xl"
        />
        {/* Сам CtaBand — поверх фона */}
        <div className="relative">
          <CtaBand title={title} subtitle={subtitle} prefill={prefill} />
        </div>
      </div>
    </section>
  );
}
