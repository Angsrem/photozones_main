import Link from 'next/link';
import { getPhotozones, getReviews } from '@/lib/data';
import { getPageBlocks, extractFaq } from '@/components/site/page-blocks';
import { PhotozoneCard, TrustBadges, SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, reviewsLd, faqLd, breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Truck, Wrench, Phone, Star, ArrowRight, Clock } from 'lucide-react';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizButton } from '@/components/site/quiz-button';
import { WhyCheaperBlock, ComparisonTable } from '@/components/site/transparent-pricing';
import { HeroParallax } from './_components/hero-parallax';
import { HomeScrollCta } from './_components/home-scroll-cta';
import { Reveal, StaggerGroup, StaggerItem } from './_components/home-reveal';

export const metadata = {
  title: 'Аренда фотозон в Красноярске — свадебные, детские, корпоративные | Fotoarka',
  description: 'Аренда фотозон в Красноярске и пригороде: свадебные, детские, корпоративные, новогодние. Доставка, монтаж и демонтаж включены. 30+ мероприятий в месяц. Районы: Центральный, Советский, Свердловский, Октябрьский. Перезвоним за 15 минут.',
  keywords: [
    'аренда фотозоны Красноярск',
    'фотозона на свадьбу Красноярск',
    'детские фотозоны Красноярск',
    'новогодняя фотозона Красноярск',
    'фотозона на выпускной Красноярск',
    'корпоративная фотозона Красноярск',
    'пресс-волл Красноярск',
    'фотозона в аренду Красноярск',
    'аренда фотозоны на день рождения',
    'фотозона для корпоратива',
    'LOVE инсталляция Красноярск',
    'арка из шаров Красноярск',
  ],
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Аренда фотозон в Красноярске — Fotoarka',
    description: 'Свадебные, детские, корпоративные и сезонные фотозоны. Доставка и монтаж включены. 30+ мероприятий в месяц.',
    url: 'https://fotoarka.ru',
    siteName: 'Fotoarka',
    locale: 'ru_RU',
    type: 'website',
    images: [{ url: '/images/hero.jpg', width: 1344, height: 768, alt: 'Аренда фотозон в Красноярске' }],
  },
};

const steps = [
  { icon: Phone, title: 'Оставляете заявку', text: 'На сайте или по телефону. Укажите повод и дату — остальное берём на себя.' },
  { icon: Clock, title: 'Менеджер перезванивает', text: 'За 15 минут подтверждаем наличие на вашу дату или подбираем аналог из свободных.' },
  { icon: Truck, title: 'Доставка по Красноярску', text: 'Привозим фотозону в ресторан, лофт или на природу — в любую точку города и пригорода.' },
  { icon: Wrench, title: 'Монтаж за 1 час', text: 'Собираем фотозону до начала мероприятия, демонтируем после. Вам не нужно ничего делать.' },
];

const fallbackFaq = [
  { q: 'Сколько стоит аренда фотозоны в Красноярске?', a: 'Аренда фотозоны начинается от 8 900 ₽ с доставкой, монтажом и демонтажом. Итоговая цена зависит от типа фотозоны, размера и дополнительных элементов. Рассчитать стоимость можно в калькуляторе за 1 минуту.' },
  { q: 'Входит ли доставка и монтаж в стоимость?', a: 'Да, доставка по Красноярску, монтаж и демонтаж включены в цену. При доставке в пригород (Солнечный, Подгорный, Емельяново) действует надбавка 1 500 ₽.' },
  { q: 'Как быстро перезванивает менеджер?', a: 'В среднем 7 минут, максимум — 15 минут в рабочее время (9:00–21:00). Заявки, оставленные ночью, обрабатываем утром первыми.' },
  { q: 'Можно ли брендировать фотозону логотипом?', a: 'Да, для корпоративов мы печатаем ваш логотип на пресс-волле. Это указывается в заявке — менеджер согласует макет.' },
  { q: 'Что если фотозона занята на мою дату?', a: 'Менеджер предложит аналогичные свободные варианты под ваш повод и бюджет. Подбираем по категории и цене ±20%.' },
];

export default async function HomePage() {
  const [zones, reviews, heroBlocks, howBlocks, faqBlocks, ctaBlocks] = await Promise.all([
    getPhotozones({ sort: 'hit', limit: 6 }),
    getReviews(6),
    getPageBlocks('home-hero'),
    getPageBlocks('home-how-we-work'),
    getPageBlocks('home-faq'),
    getPageBlocks('home-cta-text'),
  ]);
  const avgRating = '4.9';

  // FAQ из БД (если есть) — иначе fallback на захардкоженный
  const dbFaq = faqBlocks ? extractFaq(faqBlocks) : [];
  const faq = dbFaq.length > 0 ? dbFaq : fallbackFaq;

  // Извлечь hero-заголовок и подзаголовок из блоков (если есть)
  const heroHeading = heroBlocks?.find((b) => b.type === 'heading') as { type: 'heading'; text: string } | undefined;
  const heroParagraph = heroBlocks?.find((b) => b.type === 'paragraph') as { type: 'paragraph'; text: string } | undefined;
  const heroHeadingNode = heroHeading ? (
    <span>{heroHeading.text}</span>
  ) : (
    <>
      Аренда фотозон <span className="text-gradient-gold">в Красноярске</span> под любое событие
    </>
  );
  const heroParagraphNode = heroParagraph ? heroParagraph.text : undefined;

  // Извлечь шаги из howBlocks (список)
  const howHeading = howBlocks?.find((b) => b.type === 'heading') as { type: 'heading'; text: string } | undefined;
  const howSubtitle = howBlocks?.find((b) => b.type === 'paragraph') as { type: 'paragraph'; text: string } | undefined;
  const howList = howBlocks?.find((b) => b.type === 'list') as { type: 'list'; items: string[] } | undefined;
  const howSteps = howList?.items || steps.map((s) => s.text);

  // CTA-текст
  const ctaHeading = ctaBlocks?.find((b) => b.type === 'heading') as { type: 'heading'; text: string } | undefined;
  const ctaParagraph = ctaBlocks?.find((b) => b.type === 'paragraph') as { type: 'paragraph'; text: string } | undefined;

  return (
    <>
      <JsonLd data={[localBusinessLd(), breadcrumbsLd([{ name: 'Главная', url: '/' }]), reviewsLd(reviews.map(r => ({ author: r.author, text: r.text, rating: r.rating }))), faqLd(faq)]} />

      {/* ===== HERO (parallax 3D, клиентский) ===== */}
      <HeroParallax
        heading={heroHeadingNode}
        paragraph={heroParagraphNode}
        avgRating={avgRating}
        reviewsCount={160}
      />

      {/* ===== TRUST (компактно) ===== */}
      <section className="container mx-auto max-w-7xl px-4 -mt-8 relative z-10">
        <Reveal>
          <TrustBadges />
        </Reveal>
      </section>

      {/* ===== PROMO ===== */}
      <PromoStrip page="/" />

      {/* ===== BEST PHOTOZONES (сразу после promo) ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <Reveal>
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Хиты сезона</span>
              <h2 className="font-display text-3xl sm:text-4xl">Лучшие фотозоны</h2>
            </div>
            <Button asChild variant="ghost" className="shrink-0">
              <Link href="/katalog">Весь каталог <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </Reveal>
        {/* PhotozoneCard уже содержит собственную stagger-анимацию по index */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((pz, i) => <PhotozoneCard key={pz.id} pz={pz} index={i} />)}
        </div>
      </section>

      {/* ===== QUIZ CTA (после карточек) ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
            <div className="relative flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <Sparkles className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">Не знаете, что выбрать?</div>
                <h2 className="font-display text-xl sm:text-2xl mb-1">Подберём фотозону за 60 секунд</h2>
                <p className="text-sm text-muted-foreground">Ответьте на 5 вопросов — покажем 3 варианта под ваш повод и бюджет. Бонус: промокод на скидку 5%.</p>
              </div>
            </div>
            <QuizButton className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0" />
          </div>
        </Reveal>
      </section>

      {/* ===== HOW WE WORK ===== */}
      <section className="bg-card/30 border-y border-border/60 py-16 mt-12">
        <div className="container mx-auto max-w-7xl px-4">
          <Reveal>
            <SectionHeading
              eyebrow="Как мы работаем"
              title={howHeading?.text || 'Заявка → перезвон → монтаж за 1 час'}
              subtitle={howSubtitle?.text || 'Весь процесс занимает от заявки до готовой фотозоны — несколько часов'}
            />
          </Reveal>
          <StaggerGroup className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5" stagger={0.08}>
            {steps.map((s, i) => (
              <StaggerItem key={s.title}>
                <div className="relative rounded-2xl border border-border bg-background p-6 h-full">
                  <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold text-sm">{i + 1}</div>
                  <s.icon className="w-7 h-7 text-gold mb-3 mt-2" />
                  <h3 className="font-display text-lg mb-1">{s.title}</h3>
                  <p className="text-sm text-muted-foreground">{howSteps[i] || s.text}</p>
                </div>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ===== WHY CHEAPER ===== */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <Reveal>
          <WhyCheaperBlock />
        </Reveal>
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="container mx-auto max-w-4xl px-4 pb-12">
        <Reveal>
          <ComparisonTable />
        </Reveal>
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <Reveal>
          <div className="flex items-end justify-between mb-8 gap-4">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Отзывы</span>
              <h2 className="font-display text-3xl sm:text-4xl">Нам доверяют в Красноярске</h2>
            </div>
            <Button asChild variant="ghost" className="shrink-0">
              <Link href="/otzyvy">Все отзывы <ArrowRight className="w-4 h-4 ml-1" /></Link>
            </Button>
          </div>
        </Reveal>
        <StaggerGroup className="grid gap-4 md:grid-cols-2 lg:grid-cols-3" stagger={0.07}>
          {reviews.slice(0, 6).map((r) => (
            <StaggerItem key={r.id}>
              <div className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col h-full">
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/40'}`} />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground flex-1 leading-relaxed line-clamp-4">«{r.text}»</p>
                <div className="mt-4 pt-4 border-t border-border/60 flex items-center justify-between">
                  <span className="font-medium">{r.author}</span>
                  {r.event && <Badge variant="outline" className="text-xs">{r.event}</Badge>}
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </section>

      {/* ===== FAQ ===== */}
      <section className="container mx-auto max-w-3xl px-4 pb-16">
        <Reveal>
          <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы об аренде фотозон" />
        </Reveal>
        <Reveal delay={0.05}>
          <FaqAccordion items={faq} />
        </Reveal>
        <Reveal delay={0.1}>
          <div className="text-center mt-8">
            <p className="text-muted-foreground mb-3">Не нашли ответ? Позвоните — поможем.</p>
            <Button asChild variant="outline" className="h-12">
              <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-2" /> {SITE.phone}</a>
            </Button>
          </div>
        </Reveal>
      </section>

      {/* ===== CTA (финальный) ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title={ctaHeading?.text || 'Готовы сделать событие незабываемым?'}
          subtitle={ctaParagraph?.text || 'Оставьте заявку — перезвоним за 15 минут, подтвердим дату или подберём аналог. Без обязательств.'}
          prefill={{ source: 'home-cta', sourcePage: '/' }}
        />
      </section>

      {/* ===== STICKY SCROLL CTA (появляется после 800px скролла, десктоп) ===== */}
      <HomeScrollCta />
    </>
  );
}
