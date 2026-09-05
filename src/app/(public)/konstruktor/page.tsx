import type { Metadata } from 'next';
import { OrderButton } from '@/components/site/quick-order-modal';
import { CtaBand } from '@/components/site/cta-band';
import { SectionHeading } from '@/components/site/photozone-card';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Wand2, Frame, Layers, Gauge, Save, ArrowRight, Phone, Clock } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Конструктор фотозон в Красноярске — скоро',
  description:
    'Интерактивный конструктор фотозон скоро появится: выберите основу, элементы и увидите живую цену. А пока — оставьте заявку, и мы соберём конфигурацию под вас вручную за 15 минут.',
  alternates: { canonical: '/konstruktor' },
};

const features = [
  { icon: Frame, title: 'Выбор основы', text: 'Каркасная S/M/L, пресс-волл или текстильная — со сравнением размеров и цен.' },
  { icon: Layers, title: 'Добавление элементов', text: 'Световые буквы, неон, шары, гирлянды, печать логотипа — мгновенно в превью.' },
  { icon: Gauge, title: 'Живая цена', text: 'Стоимость пересчитывается в реальном времени при каждом изменении конфигурации.' },
  { icon: Save, title: 'Сохранение конфигурации', text: 'Готовую конфигурацию отправите в один клик — менеджер подтвердит наличие на дату.' },
];

export default function KonstruktorPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Конструктор', url: '/konstruktor' },
          ]),
        ]}
      />

      {/* ===== Hero / Stub ===== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-coral/10 blur-3xl pointer-events-none" />
        <div className="relative container mx-auto max-w-5xl px-4 py-14 sm:py-20">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <Badge className="mb-4 bg-coral/15 text-coral border-coral/30">
                <Sparkles className="w-3.5 h-3.5 mr-1" /> Этап 2 · в разработке
              </Badge>
              <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4">
                Конструктор фотозон — <span className="text-gradient-gold">скоро</span>
              </h1>
              <p className="text-muted-foreground text-lg mb-7 max-w-xl">
                Мы готовим интерактивный конструктор: выберете основу, элементы и увидите живую цену.
                А пока — оставьте заявку, и мы соберём конфигурацию под вас вручную за 15 минут.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <OrderButton
                  prefill={{
                    source: 'konstruktor-stub',
                    sourcePage: '/konstruktor',
                    config: { type: 'konstructor-request' },
                  }}
                  className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
                >
                  <Wand2 className="w-4 h-4 mr-1.5" /> Оставить заявку на конструктор
                </OrderButton>
                <Button asChild variant="outline" className="h-12 px-7">
                  <Link href="/kalkulyator">
                    <Sparkles className="w-4 h-4 mr-1.5" /> Открыть калькулятор <ArrowRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 mt-6 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /> Перезвон за {SITE.workTimeMin} мин</span>
                <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-gold" /> {SITE.phone}</span>
              </div>
            </div>

            {/* Иллюстрация-заглушка */}
            <div className="relative">
              <div className="relative aspect-[4/3] rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/15 overflow-hidden flex items-center justify-center">
                <div className="absolute inset-0 bg-grain opacity-40" />
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/20 blur-2xl" />
                <div className="relative text-center px-6">
                  <div className="mx-auto mb-4 w-20 h-20 rounded-2xl bg-gold/15 border border-gold/40 flex items-center justify-center">
                    <Wand2 className="w-10 h-10 text-gold" />
                  </div>
                  <div className="font-display text-xl mb-1">Здесь скоро будет конструктор</div>
                  <div className="text-sm text-muted-foreground max-w-xs mx-auto">
                    Живое превью фотозоны, цена в реальном времени и сохранение конфигурации
                  </div>
                  <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-block w-2 h-2 rounded-full bg-coral animate-pulse" />
                    В разработке
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Что будет в конструкторе ===== */}
      <section className="container mx-auto max-w-6xl px-4 py-14 sm:py-18">
        <SectionHeading
          eyebrow="Что будет в конструкторе"
          title="Возможности, которые мы готовим"
          subtitle="Полноценный self-service расчёт фотозоны — без звонка и ожидания"
        />
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {features.map((f, i) => (
            <div key={f.title} className="relative rounded-2xl border border-border bg-card/50 p-6">
              <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full bg-gold text-primary-foreground flex items-center justify-center font-bold text-sm">
                {i + 1}
              </div>
              <f.icon className="w-7 h-7 text-gold mb-3 mt-2" />
              <h3 className="font-display text-lg mb-1">{f.title}</h3>
              <p className="text-sm text-muted-foreground">{f.text}</p>
            </div>
          ))}
        </div>

        {/* Inline order card */}
        <div className="mt-10 rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-10 text-center">
          <h2 className="font-display text-2xl sm:text-3xl mb-2">Хочу конструктор — перезвоните мне</h2>
          <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
            Пока конструктор в разработке, оставьте заявку — менеджер соберёт конфигурацию под ваш повод
            и бюджет вручную. Перезвоним за 15 минут.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <OrderButton
              prefill={{
                source: 'konstruktor-stub',
                sourcePage: '/konstruktor',
                config: { type: 'konstructor-request' },
              }}
              className="h-12 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
            >
              <Wand2 className="w-5 h-5 mr-2" /> Оставить заявку на конструктор
            </OrderButton>
            <Button asChild variant="outline" className="h-12 px-8">
              <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-2" /> {SITE.phone}</a>
            </Button>
          </div>
        </div>
      </section>

      {/* ===== CTA band ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <CtaBand
          title="Не хотите ждать конструктор?"
          subtitle="Загляните в каталог — там 15 готовых фотозон под любой повод. Или посчитайте стоимость в калькуляторе за 1 минуту."
          prefill={{ source: 'konstruktor-cta', sourcePage: '/konstruktor' }}
        />
      </section>
    </>
  );
}
