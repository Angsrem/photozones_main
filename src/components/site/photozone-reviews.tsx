import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

type Review = {
  id: string;
  author: string;
  event: string | null;
  text: string;
  photos: string[] | null;
  videos: string[] | null;
  rating: number;
  publishedAt: Date;
};

export function PhotozoneReviews({ reviews, photozoneTitle }: { reviews: Review[]; photozoneTitle: string }) {
  if (reviews.length === 0) return null;

  const avg = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '5.0';

  return (
    <section className="mt-14">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Отзывы клиентов</span>
          <h2 className="font-display text-2xl sm:text-3xl">
            {reviews.length} {pluralReviews(reviews.length)} о «{photozoneTitle}»
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex gap-0.5">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-4 h-4', i < Math.round(Number(avg)) ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">{avg} из 5</span>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reviews.map((r) => (
          <article key={r.id} className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col">
            <Quote className="w-6 h-6 text-gold/40 mb-2" />
            <div className="flex gap-0.5 mb-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} className={cn('w-3.5 h-3.5', i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30')} />
              ))}
            </div>
            <p className="text-sm text-muted-foreground flex-1 leading-relaxed line-clamp-4">«{r.text}»</p>

            {/* Фото */}
            {Array.isArray(r.photos) && (r.photos as string[]).length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {(r.photos as string[]).slice(0, 3).map((src, i) => (
                  <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-14 h-14 rounded-lg overflow-hidden border border-border">
                    <img src={src} alt={`Фото от ${r.author}`} className="w-full h-full object-cover" loading="lazy" />
                  </a>
                ))}
              </div>
            )}

            {/* Видео */}
            {Array.isArray(r.videos) && (r.videos as string[]).length > 0 && (
              <div className="mt-2 space-y-2">
                {(r.videos as string[]).slice(0, 1).map((src, i) => (
                  <video key={i} src={src} controls className="w-full h-28 rounded-lg border border-border object-cover" preload="metadata" />
                ))}
              </div>
            )}

            <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
              <span className="font-medium text-sm">{r.author}</span>
              {r.event && <Badge variant="outline" className="text-xs">{r.event}</Badge>}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function pluralReviews(n: number): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return 'отзыв';
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return 'отзыва';
  return 'отзывов';
}
