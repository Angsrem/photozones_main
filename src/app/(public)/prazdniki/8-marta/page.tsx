import type { Metadata } from 'next';
import Link from 'next/link';
import { getPhotozones } from '@/lib/data';
import { PhotozoneCard, SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, faqLd } from '@/lib/seo';
import { OrderButton } from '@/components/site/quick-order-modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Flower, Tag } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../../_components/landing-sections';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizStrip } from '@/components/site/quiz-button';

export const metadata: Metadata = {
  title: 'Фотозона на 8 марта в Красноярске — весенний оффер',
  description:
    'Фотозона на 8 марта в Красноярске: пионы, тюльпаны, пастельные шары, золотые акценты. Весенний оффер для корпоративов и девичников. Доставка и монтаж. От 13 400 ₽. Перезвоним за 15 минут.',
  alternates: { canonical: '/prazdniki/8-marta' },
};

const faq = [
  {
    q: 'Какую фотозону выбрать на 8 марта в офис?',
    a: 'Для офисного праздника к 8 марта популярна фотозона «Весна»: пионы, тюльпаны, пастельные шары и золотые акценты. Ширина 3 м — оптимальна для групповых фото сотрудниц. Доставим в любой бизнес-центр Красноярска.',
  },
  {
    q: 'Сколько стоит фотозона на 8 марта в Красноярске?',
    a: 'Аренда фотозоны на 8 марта начинается от 13 400 ₽ с доставкой, монтажом и демонтажом. Цветы — живые или качественная флористика премиум-класса. Точную цену менеджер озвучит после уточнения площадки и количества сотрудниц.',
  },
  {
    q: 'Можно ли заказать фотозону на девичник к 8 марта?',
    a: 'Да, для девичников и женских встреч подходит нежная весенняя фотозона. Доставим в ресторан, лофт или домой. Возможна доставка в пригород — Солнечный, Подгорный, Емельяново (надбавка 1500 ₽).',
  },
  {
    q: 'Доставляете ли вы фотозону в офисы и бизнес-центры?',
    a: 'Да, доставляем в офисы и бизнес-центры Красноярска — в любом районе (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский). Согласуем время заезда с охраной, смонтируем за 1 час до начала поздравлений.',
  },
  {
    q: 'Когда бронировать фотозону на 8 марта?',
    a: '8 марта — популярный праздник, даты разбирают быстро. Бронируйте за 14–21 день. При раннем бронировании (за 30+ дней) действует скидка 10% по акции «Раннее бронирование».',
  },
  {
    q: 'Какие цветы используются в весенней фотозоне?',
    a: 'В весенней фотозоне на 8 марта — пионы, тюльпаны, эвкалипт в премиальной палитре. Дополнительно: пастельные шары, золотые акценты, лёгкая ткань. Возможна замена цветов под ваши предпочтения.',
  },
  {
    q: 'Работаете ли вы с юр. лицами для корпоративного поздравления?',
    a: 'Да, работаем по договору с юр. лицами и ИП. Предоставляем полный пакет закрывающих документов. Менеджер согласует условия оплаты под вашу бухгалтерию. Возможно брендирование логотипом компании.',
  },
];

export default async function Marta8Page() {
  const zones = await getPhotozones({ occasion: 'MARCH_8' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Праздники', url: '/prazdniki' },
            { name: '8 марта', url: '/prazdniki/8-marta' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs
        items={[
          { name: 'Главная', href: '/' },
          { name: '8 марта' },
        ]}
      />

      <PageHero
        eyebrow="Весенний оффер"
        title={
          <>
            Фотозона на 8 марта <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Нежная весенняя фотозона к 8 марта: пионы, тюльпаны, пастельные шары и золотые акценты.
            Для корпоративных поздравлений и девичников. Доставка в любой офис Красноярска, монтаж
            за 1 час. От 13 400 ₽.
          </>
        }
      />

      <PromoStrip page="/prazdniki/8-marta" />

      <QuizStrip />

      {/* Промо-блок */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-coral/10 via-card to-card p-6 sm:p-8">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-coral/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-coral/15 flex items-center justify-center shrink-0">
                <Flower className="w-6 h-6 text-coral" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-coral mb-1">
                  Весенний оффер
                </div>
                <h2 className="font-display text-xl sm:text-2xl mb-1">Премиум-флористика в подарок</h2>
                <p className="text-sm text-muted-foreground">
                  При заказе весенней фотозоны до 1 марта — композиция из живых цветов в подарок
                  для коллектива.
                </p>
              </div>
            </div>
            <OrderButton
              prefill={{ source: '8-marta-promo', sourcePage: '/prazdniki/8-marta', occasion: 'MARCH_8' }}
              className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0"
            >
              <Sparkles className="w-5 h-5 mr-2" /> Заказать со скидкой
            </OrderButton>
          </div>
        </div>
      </section>

      {/* SEO-блок */}
      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Весенняя фотозона на 8 марта — это нежность, цветы и праздник для женщин. В Красноярске
            мы делаем фотозоны с пионами, тюльпанами, эвкалиптом, пастельными шарами и золотыми
            акцентами — для корпоративных поздравлений в офисе, для девичников и встреч подруг.
            Каждая фотозона собирается под площадку и стиль торжества.
          </p>
          <p>
            Доставляем в офисы, бизнес-центры, рестораны и лофты Красноярска — в любом районе
            (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский).
            Возможна доставка в пригород — Солнечный, Подгорный, Емельяново (надбавка 1500 ₽).
            Согласуем время заезда с охраной, смонтируем за 1 час до начала поздравлений.
          </p>
        </div>
      </section>

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Весенние фотозоны в аренду"
          subtitle="Цветы, пастельные шары и золотые акценты — для офисных и домашних праздников"
        />
        {zones.length === 0 ? (
          <EmptyPhotozones />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {zones.map((pz, i) => (
              <PhotozoneCard key={pz.id} pz={pz} index={i} />
            ))}
          </div>
        )}
        <div className="mt-8 text-center">
          <OrderButton
            prefill={{ source: '8-marta', sourcePage: '/prazdniki/8-marta', occasion: 'MARCH_8' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Заказать фотозону на 8 марта
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему женщины в Красноярске выбирают Fotoarka" />

      {/* Идеи для 8 марта */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Flower className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Премиум-флористика</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Пионы, тюльпаны, эвкалипт в нежной палитре. Живые цветы и качественная флористика
              премиум-класса для офисных и домашних праздников.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Tag className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Корпоративное поздравление</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Фотозона для коллектива с возможностью брендинга. Работа по договору с юр. лицами,
              полный пакет закрывающих документов.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Девичник и встреча подруг</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Нежная весенняя фотозона для девичников и встреч подруг. Доставим в ресторан, лофт или
              домой. От 13 400 ₽ с доставкой и монтажом.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о фотозонах на 8 марта" />
        <FaqAccordion items={faq} />
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-3">Не нашли ответ? Позвоните — поможем выбрать.</p>
          <Button asChild variant="outline" className="h-12">
            <Link href="/kontakty">Связаться с менеджером</Link>
          </Button>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Подарите сотрудницам весну 8 марта"
          subtitle="Оставьте заявку — менеджер перезвонит за 15 минут и подберёт весеннюю фотозону под офис или ресторан."
          prefill={{ source: '8-marta-cta', sourcePage: '/prazdniki/8-marta', occasion: 'MARCH_8' }}
        />
      </section>
    </>
  );
}
