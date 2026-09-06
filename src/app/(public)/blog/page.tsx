import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { getArticles, asStringArray } from '@/lib/data';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbsLd } from '@/lib/seo';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Calendar, Newspaper } from 'lucide-react';
import { formatDateRu } from '@/lib/format';
import { PageBreadcrumbs, PageHero } from '../_components/landing-sections';
import type { Article } from '@prisma/client';

export const metadata: Metadata = {
  title: 'Блог об аренде фотозон в Красноярске — советы и идеи',
  description:
    'Блог ФотоЗона24 об аренде фотозон в Красноярске: как выбрать фотозону на свадьбу, корпоратив, выпускной. Советы, идеи, обзоры. Свежие статьи и сезонные гайды.',
  alternates: { canonical: '/blog' },
};

export default async function BlogPage() {
  const articles = await getArticles();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Блог', url: '/blog' },
          ]),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Блог' }]} />

      <PageHero
        eyebrow="Блог"
        title={
          <>
            Блог об аренде <span className="text-gradient-gold">фотозон</span>
          </>
        }
        intro={
          <>
            Советы, идеи и гайды по выбору фотозон в Красноярске. Как подобрать фотозону на свадьбу,
            корпоратив, выпускной. Сезонные офферы и тренды 2025 года.
          </>
        }
      />

      <section className="container mx-auto max-w-7xl px-4 py-10">
        {articles.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/30 p-12 text-center text-muted-foreground">
            <Newspaper className="w-10 h-10 mx-auto mb-3 text-muted-foreground/60" />
            Пока нет опубликованных статей. Загляните позже!
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {articles.map((a: Article) => {
              const tags = asStringArray(a.tags);
              return (
                <article
                  key={a.id}
                  className="group card-hover flex flex-col overflow-hidden rounded-2xl border border-border bg-card"
                >
                  <Link href={`/blog/${a.slug}`} className="relative block aspect-[16/10] overflow-hidden" aria-label={a.title}>
                    {a.cover ? (
                      <Image
                        src={a.cover}
                        alt={a.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gradient-to-br from-gold/20 to-card" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-gold text-primary-foreground border-0">Статья</Badge>
                    </div>
                  </Link>
                  <div className="p-5 flex flex-col flex-1">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <time dateTime={a.publishedAt.toISOString()}>{formatDateRu(a.publishedAt.toISOString())}</time>
                    </div>
                    <h2 className="font-display text-lg sm:text-xl mb-2 leading-tight">
                      <Link href={`/blog/${a.slug}`} className="hover:text-gold transition-colors">
                        {a.title}
                      </Link>
                    </h2>
                    <p className="text-sm text-muted-foreground line-clamp-3 flex-1">{a.excerpt}</p>
                    {tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="mt-4 pt-4 border-t border-border/60">
                      <Button asChild variant="ghost" size="sm" className="px-0 text-gold hover:bg-transparent hover:text-gold/80">
                        <Link href={`/blog/${a.slug}`}>
                          Читать статью <ArrowRight className="w-4 h-4 ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
