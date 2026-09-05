import Link from 'next/link';
import type { Metadata } from 'next';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderButton } from '@/components/site/quick-order-modal';
import { CtaBand } from '@/components/site/cta-band';
import { PromoStrip } from '@/components/site/promo-strip';
import { WhyCheaperBlock, ComparisonTable } from '@/components/site/transparent-pricing';
import { QuizStrip } from '@/components/site/quiz-button';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd, faqLd } from '@/lib/seo';
import { formatPrice } from '@/lib/format';
import {
  Sparkles,
  Check,
  X,
  Crown,
  Star,
  Wallet,
  Calculator,
  Phone,
  Truck,
  Wrench,
  Clock,
  Lightbulb,
  MapPin,
  Printer,
  ArrowRight,
} from 'lucide-react';

export const metadata: Metadata = {
  title: 'Цены на аренду фотозон в Красноярске — тарифы Эконом/Стандарт/Премиум',
  description:
    'Цены на аренду фотозон в Красноярске: тарифы Эконом от 8 900 ₽, Стандарт от 12 900 ₽, Премиум от 19 900 ₽. Доставка, монтаж и демонтаж включены. Калькулятор стоимости за 1 минуту.',
  alternates: { canonical: '/ceny' },
};

type Tier = {
  id: 'econom' | 'standart' | 'premium';
  name: string;
  priceFrom: number;
  tagline: string;
  description: string;
  includes: string[];
  forWhom: string;
  popular?: boolean;
  icon: typeof Wallet;
  prefill: {
    source: string;
    sourcePage: string;
    priceEstimate: number;
  };
};

const TIERS: Tier[] = [
  {
    id: 'econom',
    name: 'Эконом',
    priceFrom: 8900,
    tagline: 'Базовые решения',
    description: 'Светящиеся буквы и цифры, базовая текстильная фотозона для частных праздников.',
    includes: [
      'Световые буквы / цифры (до 6 символов)',
      'Базовая текстильная фотозона 2.5 × 2 м',
      'Доставка по городу',
      'Монтаж и демонтаж',
      'Аренда до 5 часов',
    ],
    forWhom: 'Дни рождения, небольшие семейные праздники, школьные вечера',
    icon: Wallet,
    prefill: { source: 'ceny-econom', sourcePage: '/ceny', priceEstimate: 8900 },
  },
  {
    id: 'standart',
    name: 'Стандарт',
    priceFrom: 12900,
    tagline: 'Самое популярное',
    description: 'Тематические фотозоны: мишура, стиляги, neon party — эффектные решения для любого повода.',
    includes: [
      'Тематическая фотозона 3 × 2.4 м',
      'Декор и реквизит под повод',
      'Подсветка и гирлянда',
      'Доставка по городу',
      'Монтаж и демонтаж',
      'Аренда до 5 часов',
    ],
    forWhom: 'Свадьбы, юбилеи, корпоративы до 80 человек, выпускные',
    popular: true,
    icon: Star,
    prefill: { source: 'ceny-standart', sourcePage: '/ceny', priceEstimate: 12900 },
  },
  {
    id: 'premium',
    name: 'Премиум',
    priceFrom: 19900,
    tagline: 'Максимум впечатлений',
    description: 'Пресс-волл с брендом, свадебная флора, LOVE-инсталляция — статусные решения для крупных событий.',
    includes: [
      'Пресс-волл / флористика / LOVE-инсталляция',
      'Печать логотипа или имени',
      'Живая флористика',
      'Доставка по городу',
      'Монтаж и демонтаж',
      'Аренда до 6 часов',
      'Подсветка и реквизит',
    ],
    forWhom: 'Корпоративы от 100 человек, свадьбы, конференции, юбилеи компаний',
    icon: Crown,
    prefill: { source: 'ceny-premium', sourcePage: '/ceny', priceEstimate: 19900 },
  },
];

const INCLUDED_ROWS: { label: string; icon: typeof Truck; econom: boolean; standart: boolean; premium: boolean }[] = [
  { label: 'Доставка по городу Красноярску', icon: Truck, econom: true, standart: true, premium: true },
  { label: 'Монтаж фотозоны', icon: Wrench, econom: true, standart: true, premium: true },
  { label: 'Демонтаж фотозоны', icon: Wrench, econom: true, standart: true, premium: true },
  { label: 'Аренда до 5 часов', icon: Clock, econom: true, standart: true, premium: false },
  { label: 'Аренда до 6 часов', icon: Clock, econom: false, standart: false, premium: true },
  { label: 'Подсветка и гирлянда', icon: Lightbulb, econom: false, standart: true, premium: true },
  { label: 'Печать логотипа / брендирование', icon: Printer, econom: false, standart: false, premium: true },
];

const ADDONS: { name: string; price: string; icon: typeof MapPin; note?: string }[] = [
  {
    name: 'Доставка в пригород',
    price: '+ 1 500 ₽',
    icon: MapPin,
    note: 'Солнечный, Подгорный, Емельяново',
  },
  {
    name: 'Дополнительный час аренды',
    price: '+ 800 ₽',
    icon: Clock,
    note: 'Сверх включённого времени',
  },
  {
    name: 'Печать логотипа на баннере',
    price: '+ 4 500 ₽',
    icon: Printer,
    note: 'Макет согласует менеджер',
  },
];

const FAQ = [
  {
    q: 'Сколько стоит аренда фотозоны в Красноярске?',
    a: 'Аренда фотозоны начинается от 8 900 ₽ (тариф Эконом). Тариф Стандарт — от 12 900 ₽, Премиум — от 19 900 ₽. В стоимость уже включены доставка по городу, монтаж и демонтаж. Точную цену под ваш повод рассчитает менеджер за 15 минут.',
  },
  {
    q: 'Что входит в стоимость аренды фотозоны?',
    a: 'В цену включены: доставка по Красноярску, монтаж за 1 час, демонтаж после мероприятия, аренда от 5 до 6 часов (зависит от тарифа), базовая подсветка на тарифах Стандарт и Премиум. Дополнительно оплачивается доставка в пригород и печать логотипа.',
  },
  {
    q: 'Сколько стоит доставка фотозоны в пригород?',
    a: 'Доставка в пригород (Солнечный, Подгорный, Емельяново) — доплата 1 500 ₽. По городу Красноярску доставка бесплатна и уже включена в стоимость любого тарифа.',
  },
  {
    q: 'Можно ли арендовать фотозону дешевле, чем в тарифе?',
    a: 'Минимальная цена — 8 900 ₽ за светящиеся буквы и цифры. Если бюджет ограничен, менеджер подберёт вариант из наличия: например, только буквы имени или упрощённую текстильную фотозону. Опишите задачу в заявке — предложим решение.',
  },
  {
    q: 'Как рассчитать точную стоимость под моё мероприятие?',
    a: 'Используйте калькулятор на странице — за 1 минуту получите ориентир. Для точной сметы оставьте заявку: менеджер учтёт повод, дату, количество гостей, адрес и дополнительные элементы, пришлёт финальную цену и договор.',
  },
];

export default function CenyPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Цены', url: '/ceny' },
          ]),
          faqLd(FAQ),
        ]}
      />

      <PromoStrip page="/ceny" />

      <QuizStrip />

      {/* HERO + ХЛЕБНЫЕ КРОШКИ */}
      <section className="container mx-auto max-w-7xl px-4 pt-6 pb-8">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Главная</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Цены</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="max-w-3xl">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            Цены · от 8 900 ₽
          </span>
          <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">
            Цены на аренду фотозон <span className="text-gradient-gold">в Красноярске</span>
          </h1>
          <p className="text-muted-foreground text-base sm:text-lg leading-relaxed">
            Три тарифа под любой бюджет и повод. В стоимость включены доставка по городу,
            монтаж за 1 час и демонтаж после мероприятия. Цены актуальны для Красноярска
            и пригорода — без скрытых доплат.
          </p>
        </div>
      </section>

      {/* ТАРИФЫ */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 lg:gap-6 items-stretch">
          {TIERS.map((tier) => (
            <Card
              key={tier.id}
              className={`relative flex flex-col ${
                tier.popular
                  ? 'border-2 border-gold shadow-[0_24px_60px_-20px_rgba(0,0,0,0.6)] lg:-mt-4 lg:mb-0'
                  : 'border-border'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-gold text-primary-foreground border-0 px-3 py-1 text-xs">
                    <Star className="w-3 h-3 mr-1 fill-primary-foreground" /> Самое популярное
                  </Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <div className="flex items-center gap-3 mb-1">
                  <span
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      tier.popular ? 'bg-gold/15 text-gold' : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    <tier.icon className="w-5 h-5" />
                  </span>
                  <div>
                    <CardTitle className="font-display text-2xl">{tier.name}</CardTitle>
                    <CardDescription className="text-gold text-xs font-medium">
                      {tier.tagline}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="flex-1 flex flex-col gap-4">
                <div>
                  <div className="font-display text-3xl text-gold">
                    {formatPrice(tier.priceFrom)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">от этой цены</p>
                </div>

                <p className="text-sm text-muted-foreground leading-relaxed">{tier.description}</p>

                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                    Что входит
                  </div>
                  <ul className="space-y-1.5">
                    {tier.includes.map((inc) => (
                      <li key={inc} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                        <span>{inc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="text-sm">
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                    Для кого подходит
                  </div>
                  <p className="text-foreground/90 leading-relaxed">{tier.forWhom}</p>
                </div>
              </CardContent>

              <CardFooter className="pt-2">
                <OrderButton
                  prefill={tier.prefill}
                  className={`w-full h-12 font-semibold ${
                    tier.popular
                      ? 'bg-gold text-primary-foreground hover:bg-gold/90'
                      : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                  }`}
                >
                  <Sparkles className="w-4 h-4 mr-2" /> Заказать {tier.name}
                </OrderButton>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* ЧТО ВХОДИТ В СТОИМОСТЬ — ТАБЛИЦА */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Прозрачные цены
          </span>
          <h2 className="font-display text-3xl sm:text-4xl">Что входит в стоимость</h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Сравните, что уже включено в каждый тариф — без скрытых доплат
          </p>
        </div>

        <div className="rounded-2xl border border-border bg-card/50 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="h-12 px-4 text-sm font-semibold">Услуга</TableHead>
                <TableHead className="h-12 px-4 text-center text-sm font-semibold">Эконом</TableHead>
                <TableHead className="h-12 px-4 text-center text-sm font-semibold text-gold">
                  Стандарт
                </TableHead>
                <TableHead className="h-12 px-4 text-center text-sm font-semibold">Премиум</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {INCLUDED_ROWS.map((row) => (
                <TableRow key={row.label} className="border-border">
                  <TableCell className="px-4 py-3">
                    <span className="flex items-center gap-2 text-sm">
                      <row.icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      {row.label}
                    </span>
                  </TableCell>
                  {[row.econom, row.standart, row.premium].map((on, i) => (
                    <TableCell key={i} className="px-4 py-3 text-center">
                      {on ? (
                        <Check className="w-5 h-5 text-gold mx-auto" aria-label="Включено" />
                      ) : (
                        <X className="w-4 h-4 text-muted-foreground/40 mx-auto" aria-label="Не включено" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>

      {/* ДОПЛАТЫ */}
      <section className="container mx-auto max-w-5xl px-4 py-8">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Доплаты
          </span>
          <h2 className="font-display text-3xl sm:text-4xl">Дополнительные опции</h2>
          <p className="text-muted-foreground mt-2">
            Оплачиваются только при необходимости — фиксируются в договоре заранее
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {ADDONS.map((addon) => (
            <div
              key={addon.name}
              className="rounded-xl border border-border bg-card/50 p-5 flex flex-col"
            >
              <addon.icon className="w-6 h-6 text-gold mb-3" />
              <h3 className="font-medium mb-1">{addon.name}</h3>
              {addon.note && (
                <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{addon.note}</p>
              )}
              <span className="mt-auto font-display text-xl text-gold">{addon.price}</span>
            </div>
          ))}
        </div>
      </section>

      {/* CTA — КАЛЬКУЛЯТОР */}
      <section className="container mx-auto max-w-7xl px-4 py-12">
        <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-10">
          <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-6 items-center">
            <div>
              <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">
                Калькулятор
              </span>
              <h2 className="font-display text-2xl sm:text-3xl mb-2">
                Рассчитайте точную стоимость за 1 минуту
              </h2>
              <p className="text-muted-foreground max-w-xl">
                Укажите повод, дату и адрес — калькулятор покажет цену под ваш сценарий
                с учётом доставки, доп. часов и элементов. Без обязательств.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:justify-self-end w-full lg:w-auto">
              <Button asChild className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
                <Link href="/kalkulyator">
                  <Calculator className="w-5 h-5 mr-2" /> Открыть калькулятор
                </Link>
              </Button>
              <Button asChild variant="outline" className="h-12 px-8">
                <a href="tel:+73912190024">
                  <Phone className="w-4 h-4 mr-2" /> Позвонить
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* ПОЧЕМУ У НАС ДЕШЕВЛЕ */}
      <section className="container mx-auto max-w-5xl px-4 py-12">
        <WhyCheaperBlock />
      </section>

      {/* МЫ vs КОНКУРЕНТЫ */}
      <section className="container mx-auto max-w-4xl px-4 py-8">
        <div className="text-center mb-6">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Честное сравнение</span>
          <h2 className="font-display text-3xl sm:text-4xl mb-2">Мы vs типичные конкуренты</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Прозрачная цена «всё включено» против низкой базы со скрытыми доплатами
          </p>
        </div>
        <ComparisonTable />
      </section>

      {/* CTA-BAND */}
      <section className="container mx-auto max-w-7xl px-4 pb-12">
        <CtaBand
          title="Не определились с тарифом?"
          subtitle="Опишите повод и бюджет — менеджер подберёт оптимальный вариант за 15 минут и пришлёт смету."
          prefill={{ source: 'ceny-cta', sourcePage: '/ceny' }}
        />
      </section>

      {/* FAQ */}
      <section className="container mx-auto max-w-3xl px-4 pb-20">
        <div className="text-center mb-8">
          <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">
            Вопросы и ответы
          </span>
          <h2 className="font-display text-3xl sm:text-4xl">Цены — частые вопросы</h2>
        </div>
        <FaqAccordion items={FAQ} />
        <div className="text-center mt-8">
          <p className="text-muted-foreground mb-3">Не нашли ответ? Посмотрите каталог или позвоните.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild variant="outline" className="h-12">
              <Link href="/katalog">
                Смотреть каталог <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild className="h-12 bg-gold text-primary-foreground hover:bg-gold/90">
              <a href="tel:+73912190024">
                <Phone className="w-4 h-4 mr-2" /> Позвонить
              </a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
