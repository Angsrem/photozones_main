import type { Metadata } from 'next';
import Link from 'next/link';
import { CtaBand } from '@/components/site/cta-band';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { SectionHeading } from '@/components/site/photozone-card';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, faqLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Phone, Clock, Truck, Wrench, ShieldCheck, MapPin, Building2, ArrowRight, Sparkles } from 'lucide-react';
import { PageBreadcrumbs, PageHero } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'О компании Fotoarka — аренда фотозон в Красноярске',
  description:
    'Fotoarka — аренда фотозон в Красноярске и пригороде. 30+ мероприятий в месяц, доставка, монтаж и демонтаж включены. Гарантия, договор, опыт 5+ лет. Районы и пригороды доставки.',
  alternates: { canonical: '/o-kompanii' },
};

const guarantees = [
  { icon: ShieldCheck, title: 'Договор и гарантия', text: 'Работаем официально. Заключаем договор, предоставляем закрывающие документы для юр. лиц и ИП.' },
  { icon: Clock, title: 'Перезвон за 15 минут', text: 'Менеджер связывается в среднем за 7 минут. Заявки, оставленные ночью, обрабатываем утром первыми.' },
  { icon: Wrench, title: 'Монтаж за 1 час', text: 'Собираем фотозону до начала мероприятия, демонтируем после. Вам не нужно ничего делать.' },
  { icon: Truck, title: 'Доставка включена', text: 'Доставка по Красноярску включена в стоимость. Пригород — надбавка 1500 ₽.' },
];

const steps = [
  { icon: Phone, title: 'Заявка', text: 'Оставляете заявку на сайте или звоните. Укажите повод и дату — остальное берём на себя.' },
  { icon: Clock, title: 'Перезвон', text: 'Менеджер перезванивает за 15 минут, подтверждает наличие на дату или предлагает аналог.' },
  { icon: Truck, title: 'Доставка', text: 'Привозим фотозону в ресторан, лофт, офис или на природу — в любую точку Красноярска и пригорода.' },
  { icon: Wrench, title: 'Монтаж', text: 'Собираем фотозону за 1 час до начала мероприятия, демонтируем после. Вам ничего делать не нужно.' },
];

const faq = [
  {
    q: 'Сколько лет Fotoarka на рынке Красноярска?',
    a: 'Fotoarka работает в Красноярске более 5 лет. За это время провели 30+ мероприятий в месяц — свадьбы, дни рождения, корпоративы, выпускные, сезонные праздники. В нашем каталоге более 15 готовых решений под любой повод.',
  },
  {
    q: 'Работаете ли вы по договору?',
    a: 'Да, мы работаем по официальному договору с физическими и юридическими лицами. Предоставляем полный пакет закрывающих документов для бухгалтерии. Менеджер согласует условия оплаты под ваши требования.',
  },
  {
    q: 'В какие районы Красноярска вы доставляете?',
    a: 'Доставляем во все районы Красноярска: Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский. Также возможна доставка в пригород — Солнечный, Подгорный, Емельяново, Бердск, Манский (надбавка 1500 ₽).',
  },
  {
    q: 'Что входит в стоимость аренды фотозоны?',
    a: 'В стоимость входят: доставка по Красноярску, монтаж за 1 час, демонтаж после мероприятия, аренда на срок до 5–6 часов, базовая подсветка. Дополнительно можно заказать световые буквы, флористику, реквизит, печать логотипа.',
  },
  {
    q: 'Что если фотозона занята на мою дату?',
    a: 'Менеджер предложит аналогичные свободные варианты под ваш повод и бюджет — обычно находим 2–3 подходящих замены. Подбираем по категории и цене ±20%.',
  },
  {
    q: 'Можно ли брендировать фотозону логотипом?',
    a: 'Да, для корпоративов и конференций мы печатаем логотип на баннере пресс-волла. Стоимость печати — от 4 500 ₽. Менеджер согласует макет с вашим дизайнером.',
  },
];

export default function OKompaniiPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'О компании', url: '/o-kompanii' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'О компании' }]} />

      <PageHero
        eyebrow="О компании"
        title={
          <>
            О компании <span className="text-gradient-gold">Fotoarka</span>
          </>
        }
        intro={
          <>
            Fotoarka — сервис аренды фотозон в Красноярске и пригороде. 30+ мероприятий в месяц,
            доставка, монтаж и демонтаж включены в стоимость. Работаем по договору с гарантией.
            Свадьбы, дни рождения, корпоративы, выпускные, сезонные праздники.
          </>
        }
      />

      {/* Гарантии */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading eyebrow="Гарантии" title="Что вы получаете, работая с нами" />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {guarantees.map((g) => (
            <div key={g.title} className="rounded-2xl border border-border bg-card/50 p-5">
              <g.icon className="w-7 h-7 text-gold mb-3" />
              <h3 className="font-display text-lg mb-1">{g.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{g.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Как мы работаем */}
      <section className="bg-card/30 border-y border-border/60 py-14">
        <div className="container mx-auto max-w-7xl px-4">
          <SectionHeading eyebrow="Как мы работаем" title="Заявка → перезвон → монтаж за 1 час" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {steps.map((s, i) => (
              <div key={s.title} className="relative rounded-2xl border border-border bg-background p-6">
                <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold text-sm">
                  {i + 1}
                </div>
                <s.icon className="w-7 h-7 text-gold mb-3 mt-2" />
                <h3 className="font-display text-lg mb-1">{s.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Районы доставки */}
      <section className="container mx-auto max-w-7xl px-4 py-14">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="w-5 h-5 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">Районы Красноярска</span>
            </div>
            <h2 className="font-display text-3xl mb-4">Доставка во все районы города</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Доставка по Красноярску включена в стоимость аренды. Привозим в рестораны, лофты, офисы,
              школы, детские сады, бизнес-центры — в любой точке города.
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {SITE.districts.map((d) => (
                <li key={d} className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-gold shrink-0" />
                  <span>{d} район</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Truck className="w-5 h-5 text-gold" />
              <span className="text-xs font-semibold uppercase tracking-widest text-gold">Пригороды</span>
            </div>
            <h2 className="font-display text-3xl mb-4">Доставка в пригород</h2>
            <p className="text-muted-foreground mb-5 leading-relaxed">
              Доставляем фотозоны в пригороды Красноярска. Надбавка за пригород — {SITE.suburbSurcharge.toLocaleString('ru-RU')} ₽
              к стоимости аренды. Согласуем время заезда под вашу площадку.
            </p>
            <ul className="grid grid-cols-2 gap-2">
              {SITE.suburbs.map((s) => (
                <li key={s} className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-coral shrink-0" />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Цифры / факты */}
      <section className="container mx-auto max-w-7xl px-4 pb-14">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <div className="font-display text-3xl text-gold">{SITE.monthlyEvents}+</div>
            <div className="text-xs text-muted-foreground mt-1">мероприятий в месяц</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <div className="font-display text-3xl text-gold">{SITE.mountTimeMin}</div>
            <div className="text-xs text-muted-foreground mt-1">минут — монтаж фотозоны</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <div className="font-display text-3xl text-gold">{SITE.workTimeMin}</div>
            <div className="text-xs text-muted-foreground mt-1">минут — перезвон менеджера</div>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-5 text-center">
            <div className="font-display text-3xl text-gold">4.9★</div>
            <div className="text-xs text-muted-foreground mt-1">средняя оценка</div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о компании" />
        <FaqAccordion items={faq} />
        <div className="text-center mt-8 flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="outline" className="h-12">
            <Link href="/kontakty"><Phone className="w-4 h-4 mr-2" /> Связаться с нами</Link>
          </Button>
          <Button asChild className="h-12 bg-gold text-primary-foreground hover:bg-gold/90">
            <Link href="/katalog"><Sparkles className="w-4 h-4 mr-2" /> Смотреть каталог <ArrowRight className="w-4 h-4 ml-1" /></Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Готовы сделать событие незабываемым?"
          subtitle="Оставьте заявку — перезвоним за 15 минут, подтвердим дату или подберём аналог. Без обязательств."
          prefill={{ source: 'o-kompanii-cta', sourcePage: '/o-kompanii' }}
        />
      </section>
    </>
  );
}
