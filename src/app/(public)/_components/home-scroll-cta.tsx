'use client';

import * as React from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useQuickOrder } from '@/components/site/quick-order-store';

/**
 * Плавающий sticky-CTA "Рассчитать стоимость" для главной.
 * Появляется на десктопе после скролла 800px (внизу справа).
 * На мобильном не показывается — там уже есть sticky-бар из StickyCta.
 * Уважает prefers-reduced-motion — без анимации входа/выхода.
 *
 * Расположение: bottom-24 (96px от низа) right-5 — выше плавающих
 * мессенджер-иконок (right-4 bottom-6) из StickyCta, не перекрывает их.
 */
export function HomeScrollCta() {
  const reduce = useReducedMotion();
  const openOrder = useQuickOrder((s) => s.openOrder);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        setVisible(window.scrollY > 800);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const handleClick = () => {
    openOrder({ source: 'hero-sticky', sourcePage: '/' });
  };

  const baseClass =
    'fixed bottom-24 right-5 z-40 hidden sm:inline-flex items-center gap-2 h-12 px-6 rounded-full bg-gold text-primary-foreground font-semibold shadow-2xl shadow-gold/20 hover:bg-gold/90 hover:shadow-gold/30 transition-colors';

  if (reduce) {
    return visible ? (
      <button type="button" onClick={handleClick} className={baseClass}>
        <Sparkles className="w-4 h-4" /> Рассчитать стоимость
      </button>
    ) : null;
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.button
          type="button"
          onClick={handleClick}
          initial={{ opacity: 0, y: 24, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.95 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className={baseClass}
        >
          <Sparkles className="w-4 h-4" /> Рассчитать стоимость
        </motion.button>
      )}
    </AnimatePresence>
  );
}
