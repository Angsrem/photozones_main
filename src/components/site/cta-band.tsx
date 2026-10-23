'use client';

import { motion } from 'framer-motion';
import { Sparkles, Phone, Clock, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuickOrder } from './quick-order-store';
import { SITE } from '@/lib/constants';

// Тонкая полоса-CTA между секциями
export function CtaBand({
  title = 'Не нашли подходящую фотозону?',
  subtitle = 'Опишите задачу — подберём вариант под ваш повод и бюджет за 15 минут.',
  prefill,
}: {
  title?: string;
  subtitle?: string;
  prefill?: Record<string, unknown>;
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-10 text-center"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
      <div className="relative">
        <h2 className="font-display text-2xl sm:text-3xl mb-2">{title}</h2>
        <p className="text-muted-foreground mb-6 max-w-xl mx-auto">{subtitle}</p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button
            onClick={() => openOrder({ source: 'cta-band', ...(prefill as any) })}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Рассчитать стоимость
          </Button>
          <Button asChild variant="outline" className="h-12 px-8">
            <a href={`tel:${SITE.phoneRaw}`}>
              <Phone className="w-4 h-4 mr-2" /> {SITE.phone}
            </a>
          </Button>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4 mt-5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> Перезвон за {SITE.workTimeMin} мин</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-gold" /> 30+ меропр./мес</span>
        </div>
      </div>
    </motion.section>
  );
}
