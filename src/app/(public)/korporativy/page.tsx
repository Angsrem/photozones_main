import type { Metadata } from 'next';
import Link from 'next/link';
import { getPhotozones } from '@/lib/data';
import { PhotozoneCard, SectionHeading } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { QuizStrip } from '@/components/site/quiz-button';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, faqLd } from '@/lib/seo';
import { OrderButton } from '@/components/site/quick-order-modal';
import { Button } from '@/components/ui/button';
import { Sparkles, Building2, Briefcase } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Корпоративные фотозоны в Красноярске — брендирование, пресс-воллы',
  description:
    'Корпоративные фотозоны в Красноярске: пресс-воллы с логотипом, брендированные фотозоны для конференций и юбилеев. Печать баннера, монтаж за 1 час. От 19 900 ₽. Перезвоним за 15 минут.',
  alternates: { canonical: '/korporativy' },
};

const faq = [
  {
    q: 'Можно ли напечатать логотип компании на фотозоне?',
    a: 'Да, брендирование логотипом — ключевая услуга для корпоративов. Печать логотипа на баннере пресс-волла включена в стоимость или оплачивается отдельно (от 4 500 ₽). Менеджер согласует макет с вашим дизайнером.',
  },
  {
    q: 'Какую фотозону выбрать для корпоратива на 100+ человек?',
    a: 'Для крупных корпоративов рекомендуем пресс-воллы шириной 4 м — на фото помещается группа из 6–8 человек. Оптимальны «Пресс-волл Премиум» и «Корпоратив с брендом». Можно заказать две фотозоны для разных зон зала.',
  },
  {
    q: 'Делаете ли вы фотозоны для конференций и форумов?',
    a: 'Да, для конференций, форумов и презентаций в Красноярске мы делаем пресс-воллы с брендингом — фон для спикеров и фотозона для участников. Монтируем за 1 час до начала, демонтируем после мероприятия.',
  },
  {
    q: 'Сколько стоит корпоративная фотозона в Красноярске?',
    a: 'Аренда корпоративной фотозоны с брендированием начинается от 19 900 ₽ с доставкой, монтажом и демонтажом. Печать логотипа — от 4 500 ₽. Точную цену менеджер озвучит после уточнения даты, площадки и количества сотрудников.',
  },
  {
    q: 'Доставляете ли вы фотозоны в офисы и бизнес-центры Красноярска?',
    a: 'Да, доставляем в офисы, бизнес-центры, рестораны и лофты для корпоративов — в любом районе Красноярска. Согласуем время заезда с охраной и администрацией, смонтируем в удобное для вас время, в т.ч. рано утром или вечером.',
  },
  {
    q: 'Можно ли заказать фотозону к новогоднему корпоративу?',
    a: 'Да, новогодние корпоративы — наш главный сезон. Сочетаем брендирование с новогодней атрибутикой (мишура, шары). При заказе двух фотозон действует акция «2 фотозоны по цене одной». Подробнее — на странице /prazdniki/novyj-god.',
  },
  {
    q: 'Работаете ли вы по договору с НДС или без?',
    a: 'Работаем по официальному договору с юридическими лицами и ИП. Предоставляем полный пакет закрывающих документов. Менеджер согласует условия оплаты и документы под вашу бухгалтерию.',
  },
];

export default async function KorporativyPage() {
  const zones = await getPhotozones({ occasion: 'CORPORATE' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Корпоративные фотозоны', url: '/korporativy' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Корпоративные фотозоны' }]} />

      <PageHero
        eyebrow="Корпоративы"
        title={
          <>
            Корпоративные фотозоны <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Брендированные фотозоны и пресс-воллы для корпоративов, конференций и юбилеев компаний.
            Печатаем ваш логотип, монтируем за 1 час, доставляем в любой бизнес-центр Красноярска.
            От 19 900 ₽. Работа по договору с закрывающими документами.
          </>
        }
      />

      {/* SEO-блок */}
      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Корпоративная фотозона — это не только фон для фотографий сотрудников, но и инструмент
            брендинга. В Красноярске мы делаем пресс-воллы с печатью логотипа, брендированные фотозоны
            в цветах компании для конференций, форумов, юбилеев и новогодних корпоративов. На баннер
            можно вынести хештег мероприятия, дату, название продукта или слоган.
          </p>
          <p>
            Доставляем в офисы, бизнес-центры, рестораны и лофты Красноярска — в Центральном, Советском,
            Свердловском, Октябрьском, Железнодорожном, Ленинском, Кировском районах. Согласуем время
            заезда с охраной, смонтируем за 1 час до начала. Работаем по договору с юр. лицами и ИП,
            предоставляем полный пакет закрывающих документов.
          </p>
        </div>
      </section>

      <QuizStrip />

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Корпоративные фотозоны в аренду"
          subtitle="Пресс-воллы и брендированные решения для бизнеса — с печатью логотипа"
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
            prefill={{ source: 'korporativy', sourcePage: '/korporativy', occasion: 'CORPORATE' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Рассчитать корпоративную фотозону
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему компании в Красноярске выбирают ФотоЗона24" />

      {/* Типы корпоративных задач */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Building2 className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Корпоративы и юбилеи</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Брендированные фотозоны для корпоративных праздников, юбилеев компании, дней рождения
              фирмы. Печать логотипа и фирменных цветов — на баннере.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Briefcase className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Конференции и форумы</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Пресс-воллы для спикеров, фотозоны для участников. Брендинг партнёров и спонсоров на
              баннере. Монтируем до начала регистрации участников.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Новогодние корпоративы</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Сезонное решение — сочетание брендинга с новогодней атрибутикой. При заказе двух фотозон
              действует акция «2 фотозоны по цене одной». Подробнее — на странице Нового года.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о корпоративных фотозонах" />
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
          title="Подберём корпоративную фотозону под бренд и площадку"
          subtitle="Опишите задачу — согласуем макет, логотип, цветовую гамму. Работа по договору с закрывающими документами."
          prefill={{ source: 'korporativy-cta', sourcePage: '/korporativy', occasion: 'CORPORATE' }}
        />
      </section>
    </>
  );
}
