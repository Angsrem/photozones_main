'use client';

import * as React from 'react';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * 3D-tilt обёртка для карточек каталога.
 * При наведении мышью слегка наклоняет ребёнка по оси X/Y (±2°).
 * Уважает prefers-reduced-motion и touch-устройства (pointer: coarse).
 *
 * Использование:
 *   <CatalogCardTilt>
 *     <PhotozoneCard ... />
 *   </CatalogCardTilt>
 */
export function CatalogCardTilt({
  children,
  className,
  max = 2,
}: {
  children: React.ReactNode;
  className?: string;
  max?: number;
}) {
  const reduce = useReducedMotion();
  const [enabled, setEnabled] = React.useState(false);

  React.useEffect(() => {
    if (reduce) {
      setEnabled(false);
      return;
    }
    if (typeof window === 'undefined') return;
    const mq = window.matchMedia('(pointer: fine) and (min-width: 768px)');
    setEnabled(mq.matches);
    const handler = (e: MediaQueryListEvent) => setEnabled(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, [reduce]);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const springConfig = { stiffness: 150, damping: 18, mass: 0.4 };
  const sx = useSpring(mx, springConfig);
  const sy = useSpring(my, springConfig);
  const rotateX = useTransform(sy, [-0.5, 0.5], [max, -max]);
  const rotateY = useTransform(sx, [-0.5, 0.5], [-max, max]);

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!enabled) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mx.set(x);
    my.set(y);
  };

  const handleLeave = () => {
    mx.set(0);
    my.set(0);
  };

  if (!enabled) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      className={cn('[perspective:1200px]', className)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
    >
      <motion.div
        style={{ rotateX, rotateY, transformStyle: 'preserve-3d' }}
        className="h-full will-change-transform"
      >
        {children}
      </motion.div>
    </motion.div>
  );
}
