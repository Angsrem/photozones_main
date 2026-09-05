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
import { Sparkles, Baby, Gift } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Детские фотозоны на день рождения в Красноярске — аренда',
  description:
    'Детские фотозоны на день рождения в Красноярске: единорог, стиляги, неон-вечеринка, арки из шаров. Тематические фотозоны для детей от 1 до 16 лет. Доставка и монтаж. От 9 900 ₽. Перезвоним за 15 минут.',
  alternates: { canonical: '/detskie-prazdniki' },
};

const faq = [
  {
    q: 'Какую детскую фотозону выбрать на день рождения?',
    a: 'Для детей 1–6 лет подойдут тематические фотозоны: «Волшебный единорог», арка из шаров в пастельной гамме. Для детей 7–12 лет — «Стиляги», Neon Party. Для подростков 13–16 лет — неон и современные решения. Менеджер поможет выбрать под возраст и интересы ребёнка.',
  },
  {
    q: 'Сколько стоит детская фотозона на день рождения в Красноярске?',
    a: 'Аренда детской фотозоны начинается от 9 900 ₽ с доставкой, монтажом и демонтажом. Тематические фотозоны с реквизитом — от 12 900 ₽. Финальная цена зависит от размера и дополнительных элементов (шары, подсветка, реквизит).',
  },
  {
    q: 'Можно ли заказать фотозону для мальчика и девочки одновременно?',
    a: 'Да. Универсальные решения — арка из шаров в палитре заказчика, фотозона «Буквы и цифры» с именем ребёнка. Можно сочетать две темы (например, единорог и машинки) при заказе двух фотозон — действует скидка.',
  },
  {
    q: 'Доставляете ли вы фотозоны в детские кафе и игровые центры?',
    a: 'Да, доставляем в любые детские кафе, игровые центры и лофты Красноярска. Согласуем время заезда с площадкой, смонтируем за 1 час до начала праздника. Возможна доставка в пригород — Солнечный, Подгорный, Емельяново.',
  },
  {
    q: 'Можно ли добавить возраст — цифру года?',
    a: 'Да, светящиеся цифры возраста (1, 5, 16 и т. д.) — популярное дополнение к детской фотозоне. Стоимость комплекта цифр — от 1 900 ₽. Укажите возраст в комментарии к заявке.',
  },
  {
    q: 'Входит ли реквизит в стоимость?',
    a: 'Базовый реквизит входит в стоимость тематических фотозон («Стиляги», «Единорог»). Дополнительный реквизит для фотосессии — от 900 ₽. Полный список включённого и доп. услуг — в карточке фотозоны.',
  },
  {
    q: 'Как быстро перезванивает менеджер?',
    a: 'В среднем 7 минут, максимум — 15 минут в рабочее время (9:00–21:00). Заявки, оставленные ночью, обрабатываем утром первыми.',
  },
];

export default async function DetskiePrazdnikiPage() {
  const zones = await getPhotozones({ occasion: 'BIRTHDAY' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Детские фотозоны', url: '/detskie-prazdniki' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Детские фотозоны' }]} />

      <PageHero
        eyebrow="Детские праздники"
        title={
          <>
            Детские фотозоны на день рождения <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Тематические фотозоны для детей от 1 до 16 лет: «Волшебный единорог», «Стиляги», Neon Party,
            арки из шаров и светящиеся цифры возраста. Делаем день рождения ребёнка настоящим событием.
            Доставка по Красноярску, монтаж за 1 час. От 9 900 ₽.
          </>
        }
      />

      {/* SEO-блок */}
      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Детская фотозона на день рождения — главный фон для фотографий и сердце праздничного зала.
            В Красноярске мы помогаем родителям организовать тематический праздник под возраст и интересы
            ребёнка: для малышей 1–6 лет — «Волшебный единорог» и нежные арки из шаров, для школьников
            7–12 лет — «Стиляги» и ретро-темы, для подростков 13–16 лет — Neon Party и неоновые надписи.
          </p>
          <p>
            Доставляем в детские кафе, игровые центры, лофты и домой — в любой район Красноярска:
            Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский.
            Возможна доставка в пригород (Солнечный, Подгорный, Емельяново, надбавка 1500 ₽).
            Монтируем за 1 час до начала праздника, демонтируем после — родителям ничего делать не нужно.
          </p>
        </div>
      </section>

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Детские фотозоны в аренду"
          subtitle="Тематические и универсальные решения под возраст и интересы ребёнка"
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
            prefill={{ source: 'detskie', sourcePage: '/detskie-prazdniki', occasion: 'BIRTHDAY' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Подобрать фотозону на день рождения
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему родители в Красноярске выбирают ФотоЗона24" />

      {/* Тематические направления */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Baby className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Для малышей 1–6 лет</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              «Волшебный единорог», арки из шаров, нежные пастельные фотозоны. Светящиеся цифры возраста
              (1, 2, 3, 5) — отдельным дополнением.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Gift className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Для школьников 7–12 лет</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              «Стиляги», ретро-фотозона, тематические решения по интересам — супергерои, космос,
              принцессы. С реквизитом для фотосессии.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Для подростков 13–16 лет</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Neon Party, неоновые надписи, современные минималистичные фотозоны. Эффектно смотрятся
              на фото и видео, делают праздник стильным.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о детских фотозонах" />
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
          title="Сделаем день рождения ребёнка незабываемым"
          subtitle="Опишите возраст и интересы ребёнка — подберём тематику и цветовую гамму. Перезвоним за 15 минут."
          prefill={{ source: 'detskie-cta', sourcePage: '/detskie-prazdniki', occasion: 'BIRTHDAY' }}
        />
      </section>
    </>
  );
}
