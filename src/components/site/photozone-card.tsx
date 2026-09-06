'use client';

import * as React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Play } from 'lucide-react';
import { formatPriceFrom } from '@/lib/format';
import { useQuickOrder } from './quick-order-store';
import { CATEGORIES } from '@/lib/constants';
import type { PhotoZone } from '@prisma/client';

const catLabel = (c: string) => CATEGORIES.find((x) => x.value === c)?.label ?? c;

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as string[]) : [];
}

export function PhotozoneCard({ pz, index = 0 }: { pz: PhotoZone; index?: number }) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const images = asStringArray(pz.images);
  const videos = asStringArray(pz.videos).filter(Boolean);
  const img = images[0] || '/images/photozones/love.jpg';
  const badge = pz.badge === 'HIT' ? 'Хит' : pz.badge === 'NEW' ? 'Новинка' : null;

  // Видео-автоплей при наведении. Если видео несколько — ротация каждые 4 сек.
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [hovered, setHovered] = React.useState(false);
  const [currentVideo, setCurrentVideo] = React.useState(0);

  // Ротация видео
  React.useEffect(() => {
    if (!hovered || videos.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentVideo((i) => (i + 1) % videos.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [hovered, videos.length]);

  // Управление play/pause при наведении
  React.useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (hovered) {
      v.currentTime = 0;
      v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [hovered, currentVideo]);

  const hasVideo = videos.length > 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3) }}
      className="group card-hover relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link href={`/katalog/${pz.slug}`} className="relative block aspect-[4/3] overflow-hidden" aria-label={pz.title}>
        {/* Картинка (всегда — как poster) */}
        <Image
          src={img}
          alt={pz.title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition-transform duration-700 group-hover:scale-110"
        />
        {/* Видео поверх картинки при наведении */}
        {hasVideo && hovered && (
          <video
            ref={videoRef}
            key={currentVideo}
            src={videos[currentVideo]}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            autoPlay
            preload="metadata"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-80" />
        {/* Индикатор видео */}
        {hasVideo && (
          <div className="absolute top-3 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/50 backdrop-blur text-[10px] text-white font-medium">
            <Play className="w-2.5 h-2.5" /> {videos.length} {videos.length === 1 ? 'видео' : 'видео'}
          </div>
        )}
        <div className="absolute top-3 left-3 flex gap-2">
          {badge && <Badge className="bg-gold text-primary-foreground border-0">{badge}</Badge>}
          <Badge variant="outline" className="bg-black/40 text-white border-white/20 backdrop-blur">
            {catLabel(pz.category)}
          </Badge>
        </div>
        <div className="absolute bottom-3 left-3 right-3 flex items-end justify-between gap-2">
          <h3 className="font-display text-lg sm:text-xl text-white drop-shadow leading-tight">{pz.title}</h3>
          <span className="text-gold font-semibold font-nums text-sm whitespace-nowrap drop-shadow">
            {formatPriceFrom(pz.basePrice)}
          </span>
        </div>
      </Link>

      <div className="p-4 flex flex-col gap-3 flex-1">
        <p className="text-sm text-muted-foreground line-clamp-2 flex-1">{pz.description}</p>
        {pz.sizeW && pz.sizeH && (
          <p className="text-xs text-muted-foreground">Размер: {pz.sizeW} × {pz.sizeH} м</p>
        )}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            onClick={() => openOrder({
              photozoneId: pz.id,
              photozoneTitle: pz.title,
              photozoneImage: img,
              photozonePrice: pz.basePrice,
              source: 'catalog-card',
              sourcePage: `/katalog/${pz.slug}`,
            })}
            className="h-12 sm:h-9 sm:flex-1 bg-gold text-primary-foreground hover:bg-gold/90 text-base sm:text-sm"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
          </Button>
          <Button asChild variant="outline" className="h-12 sm:h-9 sm:px-3 hidden sm:inline-flex">
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
