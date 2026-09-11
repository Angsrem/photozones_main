'use client';

import * as React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, ChevronLeft, ChevronRight, Play, MessageSquare, Camera } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { motion, AnimatePresence } from 'framer-motion';

type Review = {
  id: string;
  author: string;
  event: string | null;
  text: string;
  photos: string[] | null;
  videos: string[] | null;
  rating: number;
  publishedAt: string;
};

function pluralReviews(n: number): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return 'отзыв';
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return 'отзыва';
  return 'отзывов';
}

export function PhotozoneReviewsCarousel({ reviews, photozoneTitle }: { reviews: Review[]; photozoneTitle: string }) {
  const [scrollRef, setScrollRef] = React.useState<HTMLDivElement | null>(null);
  const [lightbox, setLightbox] = React.useState<number | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const reviewsRef = React.useRef<HTMLDivElement | null>(null);

  // Собираем все медиа из всех отзывов для lightbox
  const allMedia: { src: string; type: 'image' | 'video'; reviewId: string }[] = React.useMemo(() => {
    const arr: { src: string; type: 'image' | 'video'; reviewId: string }[] = [];
    reviews.forEach((r) => {
      (r.photos || []).forEach((src) => arr.push({ src, type: 'image', reviewId: r.id }));
      (r.videos || []).forEach((src) => arr.push({ src, type: 'video', reviewId: r.id }));
    });
    return arr;
  }, [reviews]);

  if (reviews.length === 0) {
    return (
      <div ref={reviewsRef} className="mt-6">
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="gap-2"
        >
          <MessageSquare className="w-4 h-4" /> Оставить отзыв
        </Button>
        {showForm && <ReviewFormInline onClose={() => setShowForm(false)} photozoneTitle={photozoneTitle} />}
      </div>
    );
  }

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';
  const withMedia = reviews.filter((r) => (Array.isArray(r.photos) && r.photos.length) || (Array.isArray(r.videos) && r.videos.length));

  const scroll = (dir: -1 | 1) => {
    if (!scrollRef) return;
    scrollRef.scrollBy({ left: dir * 290, behavior: 'smooth' });
  };

  return (
    <div ref={reviewsRef} className="mt-4">
      {/* Заголовок секции отзывов */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg sm:text-xl">Отзывы</h2>
        <div className="flex items-center gap-1.5">
          <span className="font-display text-base text-gold">{avg}</span>
          <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className={cn('w-3 h-3', i < Math.round(Number(avg)) ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
            ))}
          </div>
          <span className="text-xs text-muted-foreground">· {reviews.length} {pluralReviews(reviews.length)}</span>
        </div>
      </div>

      {/* Карусель отзывов */}
      <div className="relative">
        {/* Стрелки навигации */}
        <div className="flex gap-1 absolute -top-12 right-0">
          <button onClick={() => scroll(-1)} aria-label="Назад" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => scroll(1)} aria-label="Вперёд" className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div ref={setScrollRef} className="flex gap-3 overflow-x-auto pb-2 no-scrollbar snap-x snap-mandatory">
          {/* Карточки отзывов */}
          {reviews.map((r) => {
            const photos = (r.photos || []) as string[];
            const videos = (r.videos || []) as string[];
            const reviewMedia: { src: string; type: 'image' | 'video' }[] = [
              ...photos.map((src) => ({ src, type: 'image' as const })),
              ...videos.map((src) => ({ src, type: 'video' as const })),
            ];
            return (
              <article key={r.id} className="shrink-0 w-[260px] sm:w-[280px] snap-start rounded-xl border border-border bg-card/50 p-3 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={cn('w-3 h-3', i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
                    ))}
                  </div>
                  {r.event && <Badge variant="outline" className="text-[10px]">{r.event}</Badge>}
                </div>
                <p className="text-xs text-muted-foreground flex-1 leading-relaxed line-clamp-4 mb-2">«{r.text}»</p>

                {/* Медиа — только миниатюры, клик → lightbox */}
                {reviewMedia.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {reviewMedia.slice(0, 4).map((m, i) => {
                      const globalIndex = allMedia.findIndex((am) => am.src === m.src && am.reviewId === r.id);
                      return (
                        <motion.button
                          key={i}
                          onClick={() => setLightbox(globalIndex >= 0 ? globalIndex : 0)}
                          whileHover={{ y: -3, scale: 1.1 }}
                          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                          className="relative w-14 h-14 rounded-lg overflow-hidden border border-border shadow-sm cursor-pointer"
                        >
                          {m.type === 'image' ? (
                            <Image src={m.src} alt={`Фото из отзыва ${r.author}`} fill sizes="56px" className="object-cover" />
                          ) : (
                            <>
                              <video src={m.src} className="w-full h-full object-cover" preload="metadata" muted />
                              <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                <Play className="w-3.5 h-3.5 text-white" />
                              </div>
                            </>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-border/60">
                  <span className="font-medium text-sm truncate">{r.author}</span>
                  <span className="text-xs text-muted-foreground shrink-0">{new Date(r.publishedAt).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })}</span>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Кнопка "Оставить отзыв" после всех отзывов */}
      <div className="mt-6 flex justify-center">
        <Button
          onClick={() => setShowForm(true)}
          variant="outline"
          className="gap-2 h-12 px-8 border-gold/30 hover:border-gold hover:bg-gold/5"
        >
          <MessageSquare className="w-4 h-4 text-gold" /> Оставить отзыв
        </Button>
      </div>

      {/* Форма отзыва (inline) */}
      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden mt-4"
          >
            <ReviewFormInline onClose={() => setShowForm(false)} photozoneTitle={photozoneTitle} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lightbox — на той же странице, не в новой вкладке */}
      <Dialog open={lightbox !== null} onOpenChange={(o) => !o && setLightbox(null)}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden bg-black/95 border-border">
          <DialogTitle className="sr-only">Просмотр фото/видео из отзывов</DialogTitle>
          {lightbox !== null && allMedia[lightbox] && (
            <div className="relative w-full h-[80vh] flex items-center justify-center">
              {allMedia[lightbox].type === 'image' ? (
                <Image src={allMedia[lightbox].src} alt="Фото из отзыва" fill sizes="100vw" className="object-contain" />
              ) : (
                <video src={allMedia[lightbox].src} controls autoPlay className="max-w-full max-h-full" />
              )}
              {allMedia.length > 1 && (
                <>
                  <button
                    onClick={() => setLightbox((lightbox - 1 + allMedia.length) % allMedia.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  >
                    <ChevronLeft className="w-5 h-5 text-white" />
                  </button>
                  <button
                    onClick={() => setLightbox((lightbox + 1) % allMedia.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center"
                  >
                    <ChevronRight className="w-5 h-5 text-white" />
                  </button>
                </>
              )}
              <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full bg-white/10 text-white text-xs">
                {lightbox + 1} / {allMedia.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ===== Inline-форма отзыва с антиспамом =====
function ReviewFormInline({ onClose, photozoneTitle }: { onClose: () => void; photozoneTitle: string }) {
  const [author, setAuthor] = React.useState('');
  const [event, setEvent] = React.useState('');
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [videos, setVideos] = React.useState<File[]>([]);
  const [photoPreviews, setPhotoPreviews] = React.useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = React.useState<string[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  // Антиспам: простой математический вопрос
  const [spamAnswer, setSpamAnswer] = React.useState('');
  const spamQuestion = React.useMemo(() => {
    const a = Math.floor(Math.random() * 5) + 2;
    const b = Math.floor(Math.random() * 4) + 1;
    return { a, b, answer: a + b };
  }, []);

  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    setPhotos((p) => [...p, ...files]);
    setPhotoPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };
  const onVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 2 - videos.length);
    setVideos((v) => [...v, ...files]);
    setVideoPreviews((v) => [...v, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };
  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPhotoPreviews((p) => p.filter((_, idx) => idx !== i));
  };
  const removeVideo = (i: number) => {
    setVideos((v) => v.filter((_, idx) => idx !== i));
    setVideoPreviews((v) => v.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Антиспам проверка
    if (Number(spamAnswer) !== spamQuestion.answer) {
      return; // тихо игнорируем ботов
    }
    if (!author.trim()) return;
    if (text.trim().length < 10) return;
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('author', author.trim());
      fd.append('text', text.trim());
      fd.append('event', event);
      fd.append('rating', String(rating));
      fd.append('photozoneTitle', photozoneTitle);
      photos.forEach((f) => fd.append('photos', f));
      videos.forEach((f) => fd.append('videos', f));
      const res = await fetch('/api/reviews', { method: 'POST', body: fd });
      if (res.ok) setSubmitted(true);
    } catch {
      // тихо
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6 text-center">
        <p className="font-display text-lg mb-1">Спасибо за отзыв!</p>
        <p className="text-sm text-muted-foreground">Он появится на сайте после модерации.</p>
        <Button variant="outline" size="sm" className="mt-3" onClick={onClose}>Закрыть</Button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card/50 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-lg">Оставить отзыв</h3>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">✕</button>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <input
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Ваше имя *"
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        />
        <select
          value={event}
          onChange={(e) => setEvent(e.target.value)}
          className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
        >
          <option value="">Повод</option>
          <option>Свадьба</option>
          <option>День рождения</option>
          <option>Выпускной</option>
          <option>Корпоратив</option>
          <option>Новый год</option>
          <option>Другое</option>
        </select>
      </div>

      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button key={n} type="button" onClick={() => setRating(n)}>
            <Star className={cn('w-7 h-7 transition-colors', n <= rating ? 'fill-gold text-gold' : 'text-muted-foreground/40 hover:text-gold/50')} />
          </button>
        ))}
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={4}
        placeholder="Расскажите о фотозоне, качестве работы, впечатлениях..."
        className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm resize-none"
      />

      {/* Загрузка фото */}
      <div className="flex flex-wrap gap-2">
        {photoPreviews.map((src, i) => (
          <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden border border-border group">
            <img src={src} alt="" className="w-full h-full object-cover" />
            <button type="button" onClick={() => removePhoto(i)} className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <span className="text-white text-xs">✕</span>
            </button>
          </div>
        ))}
        {photos.length < 5 && (
          <label className="w-16 h-16 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-gold/50">
            <Camera className="w-4 h-4 text-muted-foreground" />
            <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onPhotosChange} />
          </label>
        )}
      </div>

      {/* Антиспам */}
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Антиспам: {spamQuestion.a} + {spamQuestion.b} =</span>
        <input
          value={spamAnswer}
          onChange={(e) => setSpamAnswer(e.target.value)}
          type="number"
          className="w-16 h-9 rounded-md border border-input bg-background px-2 text-sm"
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
        {loading ? 'Отправка...' : 'Отправить отзыв'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">Отзыв появится после модерации</p>
    </form>
  );
}
