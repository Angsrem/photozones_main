import type { Metadata } from 'next';
import Link from 'next/link';
import { getPhotozones } from '@/lib/data';
import { PhotozoneCard, SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { QuizStrip } from '@/components/site/quiz-button';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, faqLd, serviceLd } from '@/lib/seo';
import { OrderButton } from '@/components/site/quick-order-modal';
import { Button } from '@/components/ui/button';
import { Sparkles, ArrowRight, Heart } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../_components/landing-sections';
import { LeadMagnetBlock } from '@/components/site/lead-magnet-block';

export const metadata: Metadata = {
  title: 'Фотозоны на свадьбу в Красноярске — аренда свадебных фотозон',
  description:
    'Аренда фотозон на свадьбу в Красноярске: LOVE-инсталляция, свадебная флора, текстильные и пресс-воллы. Доставка в любой район и ресторан, монтаж за 1 час. Районы: Центральный, Советский, Свердловский, Октябрьский. 14 900 ₽. Перезвоним за 15 минут.',
  keywords: [
    'фотозона на свадьбу Красноярск',
    'свадебная фотозона Красноярск',
    'аренда фотозоны на свадьбу',
    'LOVE инсталляция свадьба',
    'свадебная флора Красноярск',
    'пресс-волл на свадьбу',
    'фотозона для свадьбы Красноярск',
    'арка из роз свадьба',
  ],
  alternates: { canonical: '/svadby' },
  openGraph: {
    title: 'Фотозоны на свадьбу в Красноярске — аренда от 14 900 ₽',
    description: 'Свадебные фотозоны с доставкой и монтажом по Красноярску. LOVE-инсталляции, флора, текстиль. Районы: Центральный, Советский, Свердловский.',
    url: 'https://fotoarka.ru/svadby',
    siteName: 'Fotoarka',
    locale: 'ru_RU',
    type: 'website',
  },
};

const faq = [
  {
    q: 'Сколько стоит аренда свадебной фотозоны в Красноярске?',
    a: 'Аренда свадебной фотозоны начинается от 14 900 ₽ с доставкой, монтажом и демонтажом. Премиальные варианты с живой флористикой — от 24 900 ₽. Точную цену менеджер озвучит после уточнения площадки и даты.',
  },
  {
    q: 'Доставляете ли вы фотозону в рестораны Красноярска?',
    a: 'Да, мы доставляем свадебные фотозоны во все рестораны и лофты Красноярска — в Центральном, Советском, Свердловском, Октябрьском, Железнодорожном, Ленинском и Кировском районах. Доставка по городу включена в стоимость.',
  },
  {
    q: 'Можно ли заказать фотозону на выездную регистрацию?',
    a: 'Да. Для выездных регистраций на природе подойдут арки из флористики и фотозоны в стиле рустик. Привозим и монтируем на любой площадке в черте города и пригорода (Солнечный, Подгорный, Емельяново).',
  },
  {
    q: 'Какой размер свадебной фотозоны выбрать?',
    a: 'Оптимальная ширина фотозоны для свадьбы — 3 метра: на фото помещается группа из 4–6 человек. Для больших банкетов на 100+ гостей рекомендуем фотозоны шириной 3,5–4 метра.',
  },
  {
    q: 'За сколько дней до свадьбы бронировать фотозону?',
    a: 'Бронировать свадебную фотозону в Красноярске рекомендуем за 30–60 дней до даты, особенно в сезон с мая по сентябрь. При заказе за 30+ дней действует скидка 10% по акции «Раннее бронирование».',
  },
  {
    q: 'Что входит в стоимость аренды свадебной фотозоны?',
    a: 'В стоимость входят: доставка по Красноярску, монтаж за 1 час, демонтаж после мероприятия, аренда на срок до 5–6 часов, базовая подсветка. Дополнительно можно заказать световые буквы, флористику, реквизит.',
  },
  {
    q: 'Что если фотозона занята на дату свадьбы?',
    a: 'Менеджер предложит аналогичные свободные варианты под ваш стиль и бюджет — обычно находим 2–3 подходящих замены. Подбираем по категории и цене ±20%.',
  },
];

export default async function SvadbyPage() {
  const zones = await getPhotozones({ occasion: 'WEDDING' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          serviceLd({
            name: 'Аренда свадебных фотозон в Красноярске',
            description: 'LOVE-инсталляции, свадебная флора, текстильные фотозоны и пресс-воллы для свадеб в Красноярске. Доставка, монтаж и демонтаж включены.',
            slug: 'svadby',
          }),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Свадебные фотозоны', url: '/svadby' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Свадебные фотозоны' }]} />

      <PageHero
        eyebrow="Свадебные фотозоны"
        title={
          <>
            Фотозоны на свадьбу <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Свадебная фотозона — смысловом центр зала и главный фон для фотографий вечера. В аренду входят
            доставка по любому району Красноярска, монтаж за 1 час и демонтаж после банкета. От 14 900 ₽.
            Оставьте заявку — менеджер перезвонит за 15 минут и подтвердит дату.
          </>
        }
      />

      {/* SEO-блок с гео-ключами */}
      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Свадебные фотозоны в Красноярске мы подбираем под площадку и стиль торжества. Для ресторанов
            Центрального и Советского районов подойдут классические текстильные фотозоны и пресс-воллы
            высотой 2,4–2,6 м. Для выездных регистраций на природе — арки с живой флористикой. В каталоге
            представлены LOVE-инсталляции, свадебная флора, текстиль «Шампань» и пресс-воллы с брендингом.
          </p>
          <p>
            Доставляем в любой район Красноярска: Центральный, Советский, Свердловский, Октябрьский,
            Железнодорожный, Ленинский, Кировский. Возможна доставка в пригород — Солнечный, Подгорный,
            Емельяново (надбавка 1500 ₽). Монтируем фотозону до начала банкета, демонтируем после —
            молодожёнам ничего делать не нужно.
          </p>
        </div>
      </section>

      <QuizStrip />

      {/* Лид-магнит: 47 пунктов оформления свадьбы */}
      <LeadMagnetBlock slug="svadba-47-punktov" sourcePage="/svadby" />

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Свадебные фотозоны в аренду"
          subtitle="Все варианты с доставкой и монтажом по Красноярску. Нажмите «Заказать» — менеджер перезвонит за 15 минут."
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
            prefill={{ source: 'svadby', sourcePage: '/svadby', occasion: 'WEDDING' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Подобрать фотозону под свадьбу
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему невесты в Красноярске выбирают Fotoarka" />

      {/* Доп. SEO + перелинковка */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Heart className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Свадебные рестораны Красноярска</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Доставляем фотозоны в рестораны «Гранд», «Сибирь», «KFC Hall», «Амакс», лофты и
              загородные площадки. Менеджер согласует время заезда и логистику под расписание банкета.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Стили свадебных фотозон</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Классика — LOVE-инсталляция и свадебная флора. Современные — текстиль «Шампань» и
              неон. Для рустик-свадеб — деревянные паллеты и полевые цветы.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <ArrowRight className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Полезные ссылки</h3>
            <ul className="text-sm space-y-1.5">
              <li><Link href="/katalog" className="text-gold hover:underline">Весь каталог фотозон</Link></li>
              <li><Link href="/ceny" className="text-gold hover:underline">Цены и тарифы</Link></li>
              <li><Link href="/kalkulyator" className="text-gold hover:underline">Калькулятор стоимости</Link></li>
              <li><Link href="/otzyvy" className="text-gold hover:underline">Отзывы молодожёнов</Link></li>
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о свадебных фотозонах" />
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
          title="Подберём свадебную фотозону под вашу дату"
          subtitle="Оставьте заявку — менеджер перезвонит за 15 минут, подтвердим наличие или предложим аналог. Без обязательств."
          prefill={{ source: 'svadby-cta', sourcePage: '/svadby', occasion: 'WEDDING' }}
        />
      </section>
    </>
  );
}
