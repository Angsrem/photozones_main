import Link from 'next/link';
import Image from 'next/image';
import { getPhotozones, getReviews } from '@/lib/data';
import { PhotozoneCard, TrustBadges, SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, reviewsLd, faqLd, breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Camera, Truck, Wrench, Phone, Star, ArrowRight, Clock, ShieldCheck, Heart, Gift, Baby, GraduationCap, Building2, Snowflake } from 'lucide-react';
import { OrderButton } from '@/components/site/quick-order-modal';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizButton } from '@/components/site/quiz-button';
import { WhyCheaperBlock, ComparisonTable } from '@/components/site/transparent-pricing';

export const metadata = {
  title: 'Аренда фотозон в Красноярске — свадебные, детские, корпоративные | ФотоЗона24',
  description: 'Аренда фотозон в Красноярске и пригороде: свадебные, детские, корпоративные, новогодние. Доставка, монтаж и демонтаж включены. 100+ мероприятий в месяц. Заявка — перезвоним за 15 минут.',
  alternates: { canonical: '/' },
};

const occasions = [
  { href: '/svadby', icon: Heart, label: 'Свадьбы', color: 'from-rose-500/20' },
  { href: '/detskie-prazdniki', icon: Baby, label: 'Детские', color: 'from-sky-500/20' },
  { href: '/vypusknie', icon: GraduationCap, label: 'Выпускные', color: 'from-amber-500/20' },
  { href: '/korporativy', icon: Building2, label: 'Корпоративы', color: 'from-emerald-500/20' },
  { href: '/prazdniki/novyj-god', icon: Snowflake, label: 'Новый год', color: 'from-cyan-500/20' },
  { href: '/prazdniki/8-marta', icon: Gift, label: '8 марта', color: 'from-pink-500/20' },
];

const steps = [
  { icon: Phone, title: 'Оставляете заявку', text: 'На сайте или по телефону. Укажите повод и дату — остальное берём на себя.' },
  { icon: Clock, title: 'Менеджер перезванивает', text: 'За 15 минут подтверждаем наличие на вашу дату или подбираем аналог из свободных.' },
  { icon: Truck, title: 'Доставка по Красноярску', text: 'Привозим фотозону в ресторан, лофт или на природу — в любую точку города и пригорода.' },
  { icon: Wrench, title: 'Монтаж за 1 час', text: 'Собираем фотозону до начала мероприятия, демонтируем после. Вам не нужно ничего делать.' },
];

const faq = [
  { q: 'Сколько стоит аренда фотозоны в Красноярске?', a: 'Аренда фотозоны начинается от 8 900 ₽ с доставкой, монтажом и демонтажом. Итоговая цена зависит от типа фотозоны, размера и дополнительных элементов. Рассчитать стоимость можно в калькуляторе за 1 минуту.' },
  { q: 'Входит ли доставка и монтаж в стоимость?', a: 'Да, доставка по Красноярску, монтаж и демонтаж включены в цену. При доставке в пригород (Солнечный, Подгорный, Емельяново) действует надбавка 1500 ₽.' },
  { q: 'Как быстро перезванивает менеджер?', a: 'В среднем 7 минут, максимум — 15 минут в рабочее время (9:00–21:00). Заявки, оставленные ночью, обрабатываем утром первыми.' },
  { q: 'Можно ли брендировать фотозону логотипом?', a: 'Да, для корпоративов мы печатаем ваш логотип на пресс-волле. Это указывается в заявке — менеджер согласует макет.' },
  { q: 'Что если фотозона занята на мою дату?', a: 'Менеджер предложит аналогичные свободные варианты под ваш повод и бюджет. Подбираем по категории и цене ±20%.' },
];

export default async function HomePage() {
  const [zones, reviews] = await Promise.all([
    getPhotozones({ sort: 'hit', limit: 6 }),
    getReviews(6),
  ]);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : '4.9';

  return (
    <>
      <JsonLd data={[localBusinessLd(), breadcrumbsLd([{ name: 'Главная', url: '/' }]), reviewsLd(reviews.map(r => ({ author: r.author, text: r.text, rating: r.rating }))), faqLd(faq)]} />

      {/* ===== HERO ===== */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/hero.jpg" alt="Аренда фотозон в Красноярске" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/60 to-background" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        </div>
        <div className="relative container mx-auto max-w-7xl px-4 py-20 sm:py-28 lg:py-36">
          <div className="max-w-2xl">
            <Badge className="mb-4 bg-gold/15 text-gold border-gold/30">
              <Sparkles className="w-3.5 h-3.5 mr-1" /> 100+ мероприятий в месяц в Красноярске
            </Badge>
            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5">
              Аренда фотозон <span className="text-gradient-gold">в Красноярске</span> под любое событие
            </h1>
            <p className="text-lg text-muted-foreground mb-7 max-w-xl">
              Свадьбы, дни рождения, корпоративы и сезонные праздники. Доставка, монтаж и демонтаж включены.
              Оставьте заявку — перезвоним за 15 минут и подтвердим дату.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <OrderButton prefill={{ source: 'hero', sourcePage: '/' }}
                className="h-14 px-8 text-base bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
                <Sparkles className="w-5 h-5 mr-2" /> Рассчитать стоимость
              </OrderButton>
              <Button asChild variant="outline" className="h-14 px-8 text-base">
                <Link href="/katalog"><Camera className="w-5 h-5 mr-2" /> Смотреть каталог</Link>
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-5 mt-8 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-gold text-gold" /> {avgRating} / 5 — {reviews.length}+ отзывов</span>
              <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /> Монтаж за 1 час</span>
              <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /> Договор и гарантия</span>
            </div>
          </div>
        </div>
      </section>

      {/* ===== TRUST ===== */}
      <section className="container mx-auto max-w-7xl px-4 -mt-8 relative z-10">
        <TrustBadges />
      </section>

      {/* ===== PROMO ===== */}
      <PromoStrip page="/" />

      {/* ===== QUIZ CTA ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
              <Sparkles className="w-6 h-6 text-gold" />
            </div>
            <div>
              <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">Не знаете, что выбрать?</div>
              <h2 className="font-display text-xl sm:text-2xl mb-1">Подберём фотозону за 30 секунд</h2>
              <p className="text-sm text-muted-foreground">Ответьте на 5 вопросов — покажем 3 варианта под ваш повод и бюджет. Бонус: промокод на скидку 5%.</p>
            </div>
          </div>
          <QuizButton className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0" />
        </div>
      </section>

      {/* ===== OCCASIONS ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <SectionHeading eyebrow="Поводы" title="Фотозона под любой повод" subtitle="Выберите повод — покажем подходящие фотозоны и сезонные офферы" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {occasions.map((o) => (
            <Link key={o.href} href={o.href}
              className={`group relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br ${o.color} to-card p-5 text-center card-hover`}>
              <o.icon className="w-8 h-8 mx-auto mb-2 text-gold" />
              <div className="font-medium">{o.label}</div>
              <ArrowRight className="w-4 h-4 mx-auto mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-gold" />
            </Link>
          ))}
        </div>
      </section>

      {/* ===== BEST PHOTOZONES ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Хиты сезона</span>
            <h2 className="font-display text-3xl sm:text-4xl">Лучшие фотозоны</h2>
          </div>
          <Button asChild variant="ghost" className="shrink-0">
            <Link href="/katalog">Весь каталог <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {zones.map((pz, i) => <PhotozoneCard key={pz.id} pz={pz} index={i} />)}
        </div>
      </section>

      {/* ===== HOW WE WORK ===== */}
      <section className="bg-card/30 border-y border-border/60 py-16 mt-12">
        <div className="container mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Как мы работаем" title="Заявка → перезвон → монтаж за 1 час" subtitle="Весь процесс занимает от заявки до готовой фотозоны — несколько часов" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-background p-6">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold text-sm">{i + 1}</div>
                <s.icon className="w-7 h-7 text-gold mb-3 mt-2" />
                <h3 className="font-display text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== WHY CHEAPER ===== */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <WhyCheaperBlock />
      </section>

      {/* ===== COMPARISON ===== */}
      <section className="container mx-auto max-w-4xl px-4 pb-12">
        <ComparisonTable />
      </section>

      {/* ===== REVIEWS ===== */}
      <section className="container mx-auto max-w-7xl px-4 py-16">
        <div className="flex items-end justify-between mb-8 gap-4">
          <div>
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Отзывы</span>
            <h2 className="font-display text-3xl sm:text-4xl">Нам доверяют в Красноярске</h2>
          </div>
          <Button asChild variant="ghost" className="shrink-0">
            <Link href="/otzyvy">Все отзывы <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {reviews.slice(0, 6).map((r) => (
            <div key={r.id} className="rounded-2xl border border-border bg-card/50 p-5 flex flex-col">
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
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Готовы сделать событие незабываемым?"
          subtitle="Оставьте заявку — перезвоним за 15 минут, подтвердим дату или подберём аналог. Без обязательств."
          prefill={{ source: 'home-cta', sourcePage: '/' }}
        />
      </section>

      {/* ===== FAQ ===== */}
      <section className="container mx-auto max-w-3xl px-4 pb-20">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы об аренде фотозон" />
        <FaqAccordion items={faq} />
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-3">Не нашли ответ? Позвоните — поможем.</p>
          <Button asChild variant="outline" className="h-12">
            <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-2" /> {SITE.phone}</a>
          </Button>
        </div>
      </section>
    </>
  );
}
