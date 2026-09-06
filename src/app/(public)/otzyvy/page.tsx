import type { Metadata } from 'next';
import Link from 'next/link';
import { getReviews } from '@/lib/data';
import { SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, reviewsLd, breadcrumbsLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Quote, ArrowRight } from 'lucide-react';
import { PageBreadcrumbs, PageHero } from '../_components/landing-sections';
import { ReviewForm } from '@/components/site/review-form';
import { ReviewForPromoBlock } from '@/components/site/review-for-promo';

export const metadata: Metadata = {
  title: 'Отзывы об аренде фотозон в Красноярске — ФотоЗона24',
  description:
    'Реальные отзывы клиентов об аренде фотозон в Красноярске: свадьбы, дни рождения, корпоративы, выпускные. Средняя оценка 4.9 из 5. Оставьте заявку — присоединяйтесь к довольным клиентам.',
  alternates: { canonical: '/otzyvy' },
};

export default async function OtzyvyPage() {
  const reviews = await getReviews(100);
  const avg = reviews.length
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 5;
  const avgFmt = avg.toFixed(1);

  // Распределение по звёздам
  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Отзывы', url: '/otzyvy' },
          ]),
          reviewsLd(reviews.map((r) => ({ author: r.author, text: r.text, rating: r.rating }))),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Отзывы' }]} />

      <PageHero
        eyebrow="Отзывы клиентов"
        title={
          <>
            Отзывы об аренде фотозон <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Реальные отзывы клиентов ФотоЗона24. Свадьбы, дни рождения, корпоративы, выпускные,
            сезонные праздники. Средняя оценка — {avgFmt} из 5 на основе {reviews.length} отзывов.
          </>
        }
      />

      {/* Рейтинг-блок */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-6 text-center">
            <div className="font-display text-6xl text-gold leading-none">{avgFmt}</div>
            <div className="flex justify-center gap-0.5 mt-3 mb-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(avg) ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
                />
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              На основе {reviews.length} {reviews.length === 1 ? 'отзыва' : 'отзывов'}
            </p>
          </div>
          <div className="lg:col-span-2 rounded-2xl border border-border bg-card/50 p-6">
            <h3 className="font-display text-lg mb-4">Распределение оценок</h3>
            <div className="space-y-2">
              {dist.map((d) => {
                const pct = reviews.length ? Math.round((d.count / reviews.length) * 100) : 0;
                return (
                  <div key={d.star} className="flex items-center gap-3">
                    <span className="flex items-center gap-1 text-sm w-12 shrink-0">
                      {d.star} <Star className="w-3 h-3 fill-gold text-gold" />
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-gold" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right shrink-0">{d.count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Сетка отзывов */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Все отзывы"
          title="Что говорят клиенты в Красноярске"
          subtitle="Свежие отзывы — сверху. Благодарим каждого клиента за доверие."
        />
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center text-muted-foreground">
            Пока нет опубликованных отзывов. Будьте первым — оставьте заявку!
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {reviews.map((r) => (
              <article
                key={r.id}
                className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col"
              >
                <Quote className="w-7 h-7 text-gold/40 mb-2" />
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed">
                  «{r.text}»
                </p>
                {/* Фото */}
                {Array.isArray(r.photos) && (r.photos as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {(r.photos as string[]).slice(0, 4).map((src, i) => (
                      <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-16 h-16 rounded-lg overflow-hidden border border-border">
                        <img src={src} alt={`Фото от ${r.author}`} className="w-full h-full object-cover" loading="lazy" />
                      </a>
                    ))}
                  </div>
                )}
                {/* Видео */}
                {Array.isArray(r.videos) && (r.videos as string[]).length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    {(r.videos as string[]).slice(0, 2).map((src, i) => (
                      <video key={i} src={src} controls className="w-full h-32 rounded-lg border border-border object-cover" preload="metadata" />
                    ))}
                  </div>
                )}
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between gap-2">
                  <span className="font-medium">{r.author}</span>
                  {r.event && (
                    <Badge variant="outline" className="text-xs">
                      {r.event}
                    </Badge>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <Button asChild className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90">
            <Link href="/katalog">
              Смотреть фотозоны <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </section>

      {/* ПРОМОКОД ЗА ОТЗЫВ */}
      <ReviewForPromoBlock />

      {/* ФОРМА ОТЗЫВА */}
      <section className="container mx-auto max-w-2xl px-4 py-12">
        <SectionHeading eyebrow="Поделитесь впечатлениями" title="Оставить отзыв" subtitle="Фото и видео с мероприятия приветствуются — появятся на сайте после модерации" />
        <ReviewForm />
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Присоединяйтесь к довольным клиентам"
          subtitle="Оставьте заявку — перезвоним за 15 минут, подтвердим дату или подберём аналог. Без обязательств."
          prefill={{ source: 'otzyvy-cta', sourcePage: '/otzyvy' }}
        />
      </section>
    </>
  );
}
