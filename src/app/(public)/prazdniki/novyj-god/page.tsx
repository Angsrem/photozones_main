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
import { Sparkles, Snowflake, Gift, Tag } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Новогодняя фотозона в Красноярске — аренда на корпоратив',
  description:
    'Новогодняя фотозона в Красноярске: мишура, шары, брендированные пресс-воллы для корпоративов и семейных праздников. Доставка и монтаж. Акция — 2 фотозоны по цене одной. От 11 900 ₽.',
  alternates: { canonical: '/prazdniki/novyj-god' },
};

const faq = [
  {
    q: 'Когда бронировать новогоднюю фотозону в Красноярске?',
    a: 'Новогодний сезон — самый загруженный, даты в декабре разбирают быстро. Бронируйте новогоднюю фотозону до середины ноября. При раннем бронировании (за 30+ дней) действует скидка 10%.',
  },
  {
    q: 'Сколько стоит новогодняя фотозона?',
    a: 'Аренда новогодней фотозоны в Красноярске начинается от 11 900 ₽ с доставкой, монтажом и демонтажом. Брендированные пресс-воллы с логотипом — от 19 900 ₽. При заказе двух фотозон вторая со скидкой 50%.',
  },
  {
    q: 'Можно ли заказать фотозону на новогодний корпоратив?',
    a: 'Да, новогодние корпоративы — наш главный сезон. Сочетаем новогоднюю атрибутику (мишура, шары) с брендированием логотипом. Печать баннера включена в стоимость или оплачивается отдельно. Работаем по договору с юр. лицами.',
  },
  {
    q: 'Доставляете ли вы новогодние фотозоны в рестораны Красноярска?',
    a: 'Да, доставляем в рестораны, лофты, офисы и бизнес-центры Красноярска — в любом районе. Согласуем время заезда с площадкой, смонтируем за 1 час до начала банкета. Возможна доставка в пригород — Солнечный, Подгорный, Емельяново.',
  },
  {
    q: 'Какие цвета новогодних фотозон доступны?',
    a: 'Новогодняя мишура доступна в золотом, серебряном и красном исполнении. Можно заказать шары в фирменных цветах компании или в классической новогодней гамме (красный + золотой, белый + серебро).',
  },
  {
    q: 'Делаете ли вы фотозоны для домашних новогодних праздников?',
    a: 'Да, для семейных праздников подойдут компактные фотозоны шириной 2,5–3 м. Доставим домой или в арендованную квартиру. Минимальная стоимость — от 11 900 ₽ с монтажом.',
  },
  {
    q: 'Можно ли объединить новогоднюю тематику с брендом компании?',
    a: 'Да, это популярное решение для корпоративов: брендированный пресс-волл с новогодней атрибутикой (шары, мишура, гирлянды). Логотип печатаем на баннере, новогодний декор — по бокам.',
  },
];

export default async function NovyjGodPage() {
  const zones = await getPhotozones({ occasion: 'NEW_YEAR' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Праздники', url: '/prazdniki' },
            { name: 'Новый год', url: '/prazdniki/novyj-god' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs
        items={[
          { name: 'Главная', href: '/' },
          { name: 'Новый год' },
        ]}
      />

      <PageHero
        eyebrow="Сезонный оффер"
        title={
          <>
            Новогодняя фотозона <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Новогодние фотозоны для корпоративов и семейных праздников: мерцающая мишура, шары,
            брендированные пресс-воллы. Доставка в любой район Красноярска, монтаж за 1 час.
            От 11 900 ₽. Сезонная акция — 2 фотозоны по цене одной.
          </>
        }
      />

      {/* Промо-блок (захардкоженный сезонный оффер) */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-6 sm:p-8">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <Tag className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
                  Сезонная акция
                </div>
                <h2 className="font-display text-xl sm:text-2xl mb-1">2 фотозоны по цене одной</h2>
                <p className="text-sm text-muted-foreground">
                  При заказе двух новогодних фотозон — вторая со скидкой 50%. Действует до 31 декабря.
                </p>
              </div>
            </div>
            <OrderButton
              prefill={{ source: 'novyj-god-promo', sourcePage: '/prazdniki/novyj-god', occasion: 'NEW_YEAR' }}
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
            Новогодняя фотозона — главный атрибут корпоратива или семейного праздника в декабре и
            январе. В Красноярске мы делаем новогодние фотозоны с мерцающей мишурой, шарами и
            брендированными пресс-воллами: для корпоративов на 100+ сотрудников, для офисных
            новогодних вечеринок, для домашних праздников. Доступны три цветовых решения — золото,
            серебро, красный.
          </p>
          <p>
            Доставляем в рестораны, лофты, офисы и бизнес-центры Красноярска — в любом районе
            (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский).
            Возможна доставка в пригород — Солнечный, Подгорный, Емельяново (надбавка 1500 ₽).
            Монтируем за 1 час до начала банкета, демонтируем после.
          </p>
        </div>
      </section>

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Новогодние фотозоны в аренду"
          subtitle="Мишура, шары и брендированные решения — для корпоративов и домашних праздников"
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
            prefill={{ source: 'novyj-god', sourcePage: '/prazdniki/novyj-god', occasion: 'NEW_YEAR' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Заказать новогоднюю фотозону
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему в Красноярске выбирают ФотоЗона24 на Новый год" />

      {/* Идеи для новогодних корпоративов */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Snowflake className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Мишура и шары</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Плотная стена из мерцающей мишуры — новогодняя классика, которая всегда работает. Доступна
              в золотом, серебряном и красном исполнении.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Gift className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">С семейным праздником</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Компактные новогодние фотозоны для дома и арендованной квартиры. Ширина 2,5–3 м, монтаж
              за 1 час. От 11 900 ₽ с доставкой по Красноярску.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Бренд + Новый год</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сочетание корпоративного брендинга и новогодней атрибутики — для корпоративов. Печать
              логотипа на баннере, мишура по бокам. Работа по договору.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о новогодних фотозонах" />
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
          title="Бронируйте новогоднюю фотозону заранее"
          subtitle="Декабрь — самый загруженный месяц. Оставьте заявку сейчас — менеджер перезвонит за 15 минут и подтвердит дату."
          prefill={{ source: 'novyj-god-cta', sourcePage: '/prazdniki/novyj-god', occasion: 'NEW_YEAR' }}
        />
      </section>
    </>
  );
}
