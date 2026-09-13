'use client';

import * as React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, ChevronRight, ZoomIn, X, Play, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type MediaItem = { type: 'image' | 'video'; src: string; alt?: string };

export function PhotozoneGallery({
  images,
  videos,
  title,
}: {
  images: string[];
  videos?: string[];
  title: string;
}) {
  const safeImages = images.length ? images : ['/images/photozones/love.jpg'];
  const safeVideos = (videos || []).filter(Boolean);

  // Собираем медиа-ленту: изображения + видео (видео в конце)
  const media: MediaItem[] = [
    ...safeImages.map((src, i) => ({ type: 'image' as const, src, alt: `${title} — фото ${i + 1}` })),
    ...safeVideos.map((src) => ({ type: 'video' as const, src, alt: `${title} — видео` })),
  ];

  const [active, setActive] = React.useState(0);
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const current = media[active] ?? media[0];
  const videoRef = React.useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = React.useState(true);

  const goNext = () => setActive((i) => (i + 1) % media.length);
  const goPrev = () => setActive((i) => (i - 1 + media.length) % media.length);

  // Управление видео при смене активного медиа
  React.useEffect(() => {
    if (current?.type === 'video' && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {});
    }
  }, [active, current?.type]);

  // Lightbox навигация клавиатурой
  React.useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setLightbox(null);
      if (e.key === 'ArrowRight') setLightbox((i) => (i === null ? i : (i + 1) % media.length));
      if (e.key === 'ArrowLeft') setLightbox((i) => (i === null ? i : (i - 1 + media.length) % media.length));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, media.length]);

  return (
    <div className="flex flex-col gap-3 w-full min-w-0">
      {/* Основное медиа */}
      <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border border-border bg-card group w-full max-w-full">
        <AnimatePresence mode="wait">
          {current.type === 'image' ? (
            <motion.div
              key={`img-${active}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0"
            >
              <Image
                src={current.src}
                alt={current.alt || title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 60vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </motion.div>
          ) : (
            <motion.video
              key={`vid-${active}`}
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              ref={videoRef}
              src={current.src}
              className="absolute inset-0 w-full h-full object-cover"
              muted={muted}
              loop
              playsInline
              autoPlay
              preload="metadata"
            />
          )}
        </AnimatePresence>

        {/* Zoom-иконка (только для изображений) */}
        {current.type === 'image' && (
          <button
            type="button"
            onClick={() => setLightbox(active)}
            aria-label="Открыть в полном размере"
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
          >
            <ZoomIn className="w-5 h-5" />
          </button>
        )}

        {/* Индикатор видео */}
        {current.type === 'video' && (
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium">
            <Play className="w-3 h-3" /> Видео
          </div>
        )}

        {/* Кнопка mute для видео */}
        {current.type === 'video' && (
          <button
            type="button"
            onClick={() => {
              const v = videoRef.current;
              if (v) { v.muted = !v.muted; setMuted(v.muted); }
            }}
            aria-label={muted ? 'Включить звук' : 'Выключить звук'}
            className="absolute top-3 right-3 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center hover:bg-background"
          >
            {muted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
          </button>
        )}

        {/* Стрелки навигации */}
        {media.length > 1 && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Предыдущее фото"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Следующее фото"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-background/80 backdrop-blur flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-background"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </>
        )}

        {/* Счётчик */}
        {media.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-background/80 backdrop-blur text-xs font-medium">
            {active + 1} / {media.length}
          </div>
        )}
      </div>

      {/* Превью-лента */}
      {media.length > 1 && (
        <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
          {media.map((m, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Показать ${m.type === 'image' ? 'фото' : 'видео'} ${i + 1}`}
              className={cn(
                'relative aspect-square rounded-lg overflow-hidden border-2 transition-all',
                i === active ? 'border-gold ring-2 ring-gold/30' : 'border-border hover:border-gold/50'
              )}
            >
              {m.type === 'image' ? (
                <Image src={m.src} alt="" fill sizes="120px" className="object-cover" />
              ) : (
                <>
                  <video src={m.src} muted className="w-full h-full object-cover" preload="metadata" />
                  <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                    <Play className="w-4 h-4 text-white" />
                  </div>
                </>
              )}
            </button>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-5xl p-0 overflow-hidden bg-black/95 border-border">
          <DialogTitle className="sr-only">{title} — просмотр</DialogTitle>
          {lightbox !== null && media[lightbox] && (
            <div className="relative w-full h-[85vh] flex items-center justify-center">
              {media[lightbox].type === 'image' ? (
                <Image
                  src={media[lightbox].src}
                  alt={media[lightbox].alt || title}
                  fill
                  sizes="100vw"
                  className="object-contain"
                />
              ) : (
                <video
                  src={media[lightbox].src}
                  className="max-w-full max-h-full"
                  controls
                  autoPlay
                />
              )}
              {/* Навигация */}
              {media.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setLightbox((i) => (i === null ? i : (i - 1 + media.length) % media.length))}
                    aria-label="Предыдущее"
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-6 h-6 text-white" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setLightbox((i) => (i === null ? i : (i + 1) % media.length))}
                    aria-label="Следующее"
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  >
                    <ChevronRight className="w-6 h-6 text-white" />
                  </button>
                </>
              )}
              <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-white/10 text-white text-sm">
                {lightbox + 1} / {media.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
