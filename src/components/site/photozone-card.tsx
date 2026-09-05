'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { formatPriceFrom } from '@/lib/format';
import { useQuickOrder } from './quick-order-store';
import { CATEGORIES } from '@/lib/constants';
import type { PhotoZone } from '@prisma/client';

const catLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

export function PhotozoneCard({ pz, index = 0 }: { pz: PhotoZone; index?: number }) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const images = (pz.images as string[]) ?? [];
  const img = images[0] || '/images/photozones/love.png';
  const badge = pz.badge === 'HIT' ? 'Хит' : pz.badge === 'NEW' ? 'Новинка' : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
    >
      <Link href={`/katalog/${pz.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={pz.title}>
        <Image
          src={img}
          alt={pz.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
        <div className="absolute top-3 left-3 flex gap-2">
          {badge && <Badge className="bg-gold text-primary-foreground border-0">{badge}</Badge>}
          <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur">
            {catLabel(pz.category)}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="font-display text-lg sm:text-xl text-white drop-shadow leading-tight">{pz.title}</h3>
          <span className="text-gold font-semibold text-sm whitespace-nowrap drop-shadow">
            {formatPriceFrom(pz.basePrice)}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{pz.description}</p>
        {pz.sizeW && pz.sizeH && (
          <p className="text-xs text-muted-foreground">Размер: {pz.sizeW} × {pz.sizeH} м</p>
        )}
        <div className="flex gap-2">
          <Button
            onClick={() => openOrder({
              photozoneId: pz.id,
              photozoneTitle: pz.title,
              photozoneImage: img,
              photozonePrice: pz.basePrice,
              source: 'catalog-card',
              sourcePage: `/katalog/${pz.slug}`,
            })}
            className="flex-1 bg-gold text-primary-foreground hover:bg-gold/90"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
          </Button>
          <Button asChild variant="outline" className="px-3">
            <Link href={`/katalog/${pz.slug}`} aria-label={`Подробнее: ${pz.title}`}>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    </motion.div>
  );
}

export function TrustBadges({ className = '' }: { className?: string }) {
  const items = [
    { v: '100+', l: 'мероприятий в месяц' },
    { v: '1 час', l: 'монтаж фотозоны' },
    { v: '15 мин', l: 'перезвон менеджера' },
    { v: '4.9★', l: 'средняя оценка' },
  ];
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-4 gap-3 ${className}`}>
      {items.map((i) => (
        <div key={i.l} className="rounded-xl border border-border bg-card/50 p-4 text-center">
          <div className="font-display text-2xl text-gold">{i.v}</div>
          <div className="text-xs text-muted-foreground mt-1">{i.l}</div>
        </div>
      ))}
    </div>
  );
}

export function SectionHeading({
  eyebrow, title, subtitle, center = true,
}: { eyebrow?: string; title: string; subtitle?: string; center?: boolean }) {
  return (
    <div className={`mb-8 ${center ? 'text-center mx-auto max-w-2xl' : ''}`}>
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">{eyebrow}</span>
      )}
      <h2 className="font-display text-3xl sm:text-4xl leading-tight">{title}</h2>
      {subtitle && <p className="mt-3 text-muted-foreground">{subtitle}</p>}
    </div>
  );
}
