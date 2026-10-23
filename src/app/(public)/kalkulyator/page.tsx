import type { Metadata } from 'next';
import { CalculatorWizard } from './calculator-wizard';
import { TrustBadges } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { Sparkles, Clock, ShieldCheck, Star, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Калькулятор стоимости фотозоны в Красноярске',
  description:
    'Рассчитайте стоимость аренды фотозоны в Красноярске за 1 минуту: повод, стиль, размер, доп. элементы и адрес. Ориентировочная цена сразу — зафиксируйте расчёт и закажите за 20 секунд.',
  alternates: { canonical: '/kalkulyator' },
};

export default function KalkulyatorPage() {
  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Калькулятор', url: '/kalkulyator' },
          ]),
        ]}
      />

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full bg-coral/10 blur-3xl pointer-events-none" />
        <div className="relative container mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-4">
            <Sparkles className="w-3.5 h-3.5" /> Бесплатно · без обязательств
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 max-w-3xl">
            Калькулятор стоимости <span className="text-gradient-gold">фотозоны</span> в Красноярске
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">
            Ответьте на 4 вопроса — узнаете ориентировочную цену аренды за 1 минуту.
            Зафиксируйте расчёт и менеджер перезвонит за 15 минут, чтобы подтвердить дату.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gold" /> Расчёт за 1 минуту</span>
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-gold" /> 30+ меропр./мес</span>
            <span className="flex items-center gap-1.5"><Star className="w-4 h-4 fill-gold text-gold" /> 4.9 / 5 — средняя оценка</span>
          </div>
        </div>
      </section>

      {/* ===== Wizard ===== */}
      <section className="container mx-auto max-w-4xl px-4 py-10 sm:py-14">
        <CalculatorWizard />
      </section>

      {/* ===== Trust ===== */}
      <section className="container mx-auto max-w-4xl px-4 pb-14">
        <TrustBadges />
      </section>

      {/* ===== CTA ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <CtaBand
          title="Не нашли нужной конфигурации?"
          subtitle="Опишите задачу словами — менеджер соберёт конфигурацию под ваш повод и бюджет. Перезвоним за 15 минут."
          prefill={{ source: 'kalkulyator-cta', sourcePage: '/kalkulyator' }}
        />
      </section>

      {/* ===== Inline phone CTA ===== */}
      <section className="container mx-auto max-w-4xl px-4 pb-20 text-center">
        <p className="text-muted-foreground mb-3">Удобнее по телефону?</p>
        <Button asChild variant="outline" className="h-12 px-7">
          <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-2" /> {SITE.phone}</a>
        </Button>
      </section>
    </>
  );
}
