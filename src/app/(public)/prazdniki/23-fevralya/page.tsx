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
import { Sparkles, Shield, Award } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../../_components/landing-sections';
import { PromoStrip } from '@/components/site/promo-strip';
import { QuizStrip } from '@/components/site/quiz-button';

export const metadata: Metadata = {
  title: 'Фотозона на 23 февраля в Красноярске — мужская тематика',
  description:
    'Фотозона на 23 февраля в Красноярске: хаки-золотая гамма, медали, звёзды, строгие формы. Для корпоративных поздравлений и школьных праздников. Доставка и монтаж. От 13 400 ₽.',
  alternates: { canonical: '/prazdniki/23-fevralya' },
};

const faq = [
  {
    q: 'Какую фотозону выбрать на 23 февраля в офис?',
    a: 'Для корпоративного поздравления к 23 февраля популярна фотозона «Мужской характер»: хаки-золотая гамма, медали, звёзды, строгие формы. Ширина 3 м — оптимальна для групповых фото сотрудников. Доставим в любой бизнес-центр Красноярска.',
  },
  {
    q: 'Сколько стоит фотозона на 23 февраля в Красноярске?',
    a: 'Аренда фотозоны на 23 февраля начинается от 13 400 ₽ с доставкой, монтажом и демонтажом. Точную цену менеджер озвучит после уточнения площадки и количества сотрудников. Работа по договору с юр. лицами и ИП.',
  },
  {
    q: 'Можно ли заказать фотозону на 23 февраля в школу?',
    a: 'Да, для школьных праздников к 23 февраля подходит мужская тематика — звёзды, медали, хаки-золотая гамма. Доставляем в актовые залы школ Красноярска, согласуем время заезда с администрацией.',
  },
  {
    q: 'Доставляете ли вы фотозону в офисы и бизнес-центры?',
    a: 'Да, доставляем в офисы и бизнес-центры Красноярска — в любом районе (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский). Согласуем время заезда с охраной, смонтируем за 1 час до начала поздравлений.',
  },
  {
    q: 'Когда бронировать фотозону на 23 февраля?',
    a: '23 февраля — популярный корпоративный праздник, даты разбирают быстро. Бронируйте за 14–21 день. При раннем бронировании (за 30+ дней) действует скидка 10% по акции «Раннее бронирование».',
  },
  {
    q: 'Можно ли брендировать фотозону на 23 февраля логотипом?',
    a: 'Да, для корпоративных поздравлений мы предлагаем брендированные фотозоны с логотипом компании. Печать баннера — от 4 500 ₽. Укажите это в комментарии к заявке — менеджер согласует макет.',
  },
  {
    q: 'Какие элементы включает мужская фотозона?',
    a: 'Мужская фотозона на 23 февраля включает: хаки-золотую гамму, медали, звёзды, строгие геометрические формы, подсветку. Дополнительно — реквизит для фотосессии (фуражки, грамоты, ордена).',
  },
];

export default async function Fevralya23Page() {
  const zones = await getPhotozones({ occasion: 'FEB_23' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Праздники', url: '/prazdniki' },
            { name: '23 февраля', url: '/prazdniki/23-fevralya' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs
        items={[
          { name: 'Главная', href: '/' },
          { name: '23 февраля' },
        ]}
      />

      <PageHero
        eyebrow="Мужской праздник"
        title={
          <>
            Фотозона на 23 февраля <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Фотозона к 23 февраля в хаки-золотой гамме: медали, звёзды, строгие формы. Для
            корпоративных поздравлений и школьных праздников. Доставка в любой офис Красноярска,
            монтаж за 1 час. От 13 400 ₽.
          </>
        }
      />

      <PromoStrip page="/prazdniki/23-fevralya" />

      <QuizStrip />

      {/* Промо-блок */}
      <section className="container mx-auto max-w-7xl px-4 py-6">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-6 sm:p-8">
          <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-gold" />
              </div>
              <div>
                <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
                  Сезонный оффер
                </div>
                <h2 className="font-display text-xl sm:text-2xl mb-1">Брендирование в подарок</h2>
                <p className="text-sm text-muted-foreground">
                  При заказе фотозоны на 23 февраля для корпоратива — печать логотипа на баннере
                  бесплатно. Действует до 20 февраля.
                </p>
              </div>
            </div>
            <OrderButton
              prefill={{ source: '23-fevralya-promo', sourcePage: '/prazdniki/23-fevralya', occasion: 'FEB_23' }}
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
            Фотозона на 23 февраля — мужской характер в хаки-золотой гамме. В Красноярске мы делаем
            фотозоны с медалями, звёздами, строгими геометрическими формами — для корпоративных
            поздравлений коллег, школьных праздников и встреч с друзьями. Возможна печать логотипа
            компании на баннере.
          </p>
          <p>
            Доставляем в офисы, бизнес-центры, школы и рестораны Красноярска — в любом районе
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
          title="Мужские фотозоны в аренду"
          subtitle="Хаки-золотая гамма, медали, звёзды — для офисных и школьных праздников"
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
            prefill={{ source: '23-fevralya', sourcePage: '/prazdniki/23-fevralya', occasion: 'FEB_23' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Заказать фотозону на 23 февраля
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему в Красноярске выбирают Fotoarka на 23 февраля" />

      {/* Идеи для 23 февраля */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Shield className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Корпоративное поздравление</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Фотозона для коллектива с возможностью брендинга логотипом. Работа по договору с юр.
              лицами, полный пакет закрывающих документов.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Award className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Школьный праздник</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Мужская тематика для школьных праздников к 23 февраля — звёзды, медали, хаки-золотая
              гамма. Доставляем в актовые залы школ Красноярска.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Бренд + мужской стиль</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сочетание корпоративного брендинга и мужской тематики — для офисных праздников.
              Печать логотипа на баннере, медали и звёзды по бокам.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о фотозонах на 23 февраля" />
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
          title="Поздравьте коллег с 23 февраля стильно"
          subtitle="Оставьте заявку — менеджер перезвонит за 15 минут и подберёт мужскую фотозону под офис или школу."
          prefill={{ source: '23-fevralya-cta', sourcePage: '/prazdniki/23-fevralya', occasion: 'FEB_23' }}
        />
      </section>
    </>
  );
}
