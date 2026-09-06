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
import { Sparkles, GraduationCap, School } from 'lucide-react';
import { PageBreadcrumbs, PageHero, WhyUs, EmptyPhotozones } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Фотозоны на выпускной в Красноярске — 9 и 11 класс, детсад',
  description:
    'Фотозоны на выпускной в Красноярске: 9 и 11 класс, детский сад. Золотые звёзды, шары в цветах школы, светящиеся цифры года выпуска. Доставка и монтаж. От 10 400 ₽. Перезвоним за 15 минут.',
  alternates: { canonical: '/vypusknie' },
};

const faq = [
  {
    q: 'Какую фотозону выбрать на выпускной 11 класса?',
    a: 'Для выпускного 11 класса в Красноярске популярна фотозона «Выпускной — звёзды»: золотые звёзды, шары в цветах школы, светящиеся цифры года выпуска. Дополнительно можно заказать буквы и цифры с названием класса. Ширина 3 м — оптимально для групповых фото.',
  },
  {
    q: 'Делаете ли вы фотозоны на выпускной 9 класса?',
    a: 'Да, на выпускной 9 класса подходят те же решения, что и на 11 класс. Можно уменьшить размер до 2,5 м, если бюджет ограничен. Стоимость — от 10 400 ₽ с доставкой и монтажом.',
  },
  {
    q: 'Можно ли заказать фотозону на выпускной в детском саду?',
    a: 'Да, для детсада используем более яркие и детские тематики: арки из шаров, тематические фотозоны с любимыми персонажами. Светящиеся цифры возраста (7 лет) — дополнение. Доставляем в любые детские сады Красноярска.',
  },
  {
    q: 'Сколько стоит фотозона на выпускной в Красноярске?',
    a: 'Аренда фотозоны на выпускной начинается от 10 400 ₽ с доставкой, монтажом и демонтажом. Дополнительно: цифры года — от 1 900 ₽, буквы класса — от 2 900 ₽. Точную цену менеджер озвучит после уточнения количества выпускников и площадки.',
  },
  {
    q: 'Доставляете ли вы фотозоны в школы Красноярска?',
    a: 'Да, доставляем в школы, детские сады, актовые залы и рестораны Красноярска — в любом районе города. Согласуем время заезда с администрацией школы, смонтируем за 1 час до начала торжественной части.',
  },
  {
    q: 'Можно ли напечатать логотип или название школы?',
    a: 'Да, для выпускных мы предлагаем брендированные пресс-воллы с логотипом школы или названием класса. Печать баннера — от 4 500 ₽. Укажите это в комментарии к заявке — менеджер согласует макет.',
  },
  {
    q: 'За сколько дней до выпускного бронировать фотозону?',
    a: 'Выпускные проходят в мае–июне, этот период — самый загруженный. Бронируйте за 30–45 дней до даты. При раннем бронировании (за 30+ дней) действует скидка 10%.',
  },
];

export default async function VypuskniePage() {
  const zones = await getPhotozones({ occasion: 'GRADUATION' });

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Выпускные фотозоны', url: '/vypusknie' },
          ]),
          faqLd(faq),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Выпускные фотозоны' }]} />

      <PageHero
        eyebrow="Выпускные"
        title={
          <>
            Фотозоны на выпускной <span className="text-gradient-gold">в Красноярске</span>
          </>
        }
        intro={
          <>
            Фотозоны на выпускной 9 и 11 класса, детского сада: золотые звёзды, шары в цветах школы,
            светящиеся цифры года выпуска. Эффектное завершение учебного года. Доставка в школы
            Красноярска, монтаж за 1 час. От 10 400 ₽.
          </>
        }
      />

      {/* SEO-блок */}
      <section className="container mx-auto max-w-3xl px-4 pb-6">
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Выпускная фотозона — главный фон для прощальных фотографий, которые останутся с выпускником
            на всю жизнь. В Красноярске мы делаем фотозоны на выпускной 9 и 11 класса, а также на
            выпускной в детском саду: золотые звёзды, шары в цветах школы, светящиеся цифры года выпуска,
            буквы с названием класса. Каждая фотозона собирается под конкретный возраст и площадку.
          </p>
          <p>
            Доставляем в актовые залы школ, детские сады и рестораны Красноярска — в Центральном,
            Советском, Свердловском, Октябрьском, Железнодорожном, Ленинском и Кировском районах.
            Возможна доставка в пригород (Солнечный, Подгорный, Емельяново). Согласуем время заезда с
            администрацией школы, смонтируем за 1 час до начала торжественной части.
          </p>
        </div>
      </section>

      <QuizStrip />

      {/* Сетка фотозон */}
      <section className="container mx-auto max-w-7xl px-4 py-10">
        <SectionHeading
          eyebrow="Каталог"
          title="Фотозоны на выпускной в аренду"
          subtitle="Эффектные решения для 9 и 11 класса, детсада — с цифрами года и звёздами"
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
            prefill={{ source: 'vypusknie', sourcePage: '/vypusknie', occasion: 'GRADUATION' }}
            className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Заказать фотозону на выпускной
          </OrderButton>
        </div>
      </section>

      <WhyUs title="Почему школы и родители в Красноярске выбирают ФотоЗона24" />

      {/* Типы выпускных */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid lg:grid-cols-3 gap-5">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <GraduationCap className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Выпускной 11 класс</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Золотые звёзды, шары в цветах школы, светящиеся цифры года выпуска. Возможна печать
              логотипа или названия класса. Оптимальная ширина — 3 м.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <School className="w-6 h-6 text-gold mb-3" />
            <h3 className="font-display text-lg mb-2">Выпускной 9 класс</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Те же решения, что и для 11 класса, в более компактном формате. Бюджетный вариант —
              от 10 400 ₽ с доставкой и монтажом по Красноярску.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <Sparkles className="w-6 h-6 text-coral mb-3" />
            <h3 className="font-display text-lg mb-2">Выпускной в детсаду</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Яркие арки из шаров, тематические фотозоны с любимыми персонажами, цифры возраста (7 лет).
              Доставляем в любые детские сады Красноярска и пригорода.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 py-12">
        <SectionHeading eyebrow="Вопросы и ответы" title="Частые вопросы о выпускных фотозонах" />
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
          title="Сделаем выпускной ярким и запоминающимся"
          subtitle="Подберём фотозону под возраст выпускников и площадку. Бронируйте заранее — май и июнь разбирают быстро."
          prefill={{ source: 'vypusknie-cta', sourcePage: '/vypusknie', occasion: 'GRADUATION' }}
        />
      </section>
    </>
  );
}
