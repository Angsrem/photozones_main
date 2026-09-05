import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getArticleBySlug, getArticles, asStringArray } from '@/lib/data';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, ArrowLeft, ArrowRight, Sparkles } from 'lucide-react';
import { formatDateRu } from '@/lib/format';
import { PageBreadcrumbs } from '../../_components/landing-sections';
import { Markdown } from '../../_components/markdown';

export const revalidate = 600; // 10 минут — для свежих правок статей

type Params = { slug: string };

export async function generateStaticParams(): Promise<Params[]> {
  const articles = await getArticles();
  return articles.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<Params>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) {
    return {
      title: 'Статья не найдена',
      robots: { index: false, follow: false },
    };
  }
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      images: article.cover ? [{ url: article.cover }] : undefined,
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<Params>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const tags = asStringArray(article.tags);
  const publishedISO = article.publishedAt.toISOString();
  const coverUrl = article.cover ?? '/images/hero.png';
  const coverUrlAbsolute = coverUrl.startsWith('http') ? coverUrl : `${SITE.url}${coverUrl}`;

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: article.title,
            description: article.excerpt,
            image: [coverUrlAbsolute],
            datePublished: publishedISO,
            dateModified: article.updatedAt.toISOString(),
            author: { '@type': 'Organization', name: SITE.name },
            publisher: {
              '@type': 'Organization',
              name: SITE.name,
              logo: { '@type': 'ImageObject', url: `${SITE.url}/images/hero.png` },
            },
            mainEntityOfPage: { '@type': 'WebPage', '@id': `${SITE.url}/blog/${article.slug}` },
          },
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Блог', url: '/blog' },
            { name: article.title, url: `/blog/${article.slug}` },
          ]),
        ]}
      />

      <PageBreadcrumbs
        items={[
          { name: 'Главная', href: '/' },
          { name: 'Блог', href: '/blog' },
          { name: article.title },
        ]}
      />

      <article className="container mx-auto max-w-3xl px-4 pt-8 pb-12">
        {/* Заголовок + метаданные */}
        <header className="mb-8">
          <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
            <Calendar className="w-3.5 h-3.5" />
            <time dateTime={publishedISO}>{formatDateRu(publishedISO)}</time>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
            {article.title}
          </h1>
          <p className="text-lg text-muted-foreground leading-relaxed">{article.excerpt}</p>
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-5">
              {tags.map((t) => (
                <Badge key={t} variant="outline" className="text-xs">
                  #{t}
                </Badge>
              ))}
            </div>
          )}
        </header>

        {/* Обложка */}
        <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-border mb-8">
          <Image
            src={coverUrl}
            alt={article.title}
            fill
            priority
            sizes="(max-width: 768px) 100vw, 768px"
            className="object-cover"
          />
        </div>

        {/* Контент */}
        <Markdown>{article.content}</Markdown>

        {/* Навигация */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
          <Button asChild variant="ghost" className="px-0 text-gold hover:bg-transparent hover:text-gold/80">
            <Link href="/blog">
              <ArrowLeft className="w-4 h-4 mr-1" /> Все статьи блога
            </Link>
          </Button>
          <Button asChild className="bg-gold text-primary-foreground hover:bg-gold/90">
            <Link href="/katalog">
              <Sparkles className="w-4 h-4 mr-2" /> Смотреть каталог <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </article>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Понравилась статья? Закажите фотозону под свой повод"
          subtitle="Оставьте заявку — менеджер перезвонит за 15 минут и подберёт оптимальный вариант. Без обязательств."
          prefill={{ source: 'blog-article-cta', sourcePage: `/blog/${article.slug}` }}
        />
      </section>
    </>
  );
}
