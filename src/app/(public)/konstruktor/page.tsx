import type { Metadata } from 'next';
import { ConstructorBuilder } from './constructor-builder';
import { TrustBadges } from '@/components/site/photozone-card';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Sparkles, Clock, ShieldCheck, Star, Wand2 } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Конструктор фотозоны в Красноярске — соберите конфигурацию и узнайте цену',
  description:
    'Интерактивный конструктор фотозоны: выберите основу, стиль, доп. элементы и логистику — увидите живую цену сразу. Зафиксируйте расчёт и закажите за 20 секунд.',
  alternates: { canonical: '/konstruktor' },
};

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

      {/* ===== Hero ===== */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-coral/10 blur-3xl pointer-events-none" />
        <div className="relative container mx-auto max-w-5xl px-4 py-12 sm:py-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs font-semibold text-gold mb-4">
            <Wand2 className="w-3.5 h-3.5" /> Соберите фотозону за 2 минуты
          </div>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 max-w-3xl">
            Конструктор <span className="text-gradient-gold">фотозоны</span> в Красноярске
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mb-6">
            Выберите основу, стиль и доп. элементы — цена пересчитывается в реальном времени.
            Зафиксируйте расчёт и менеджер перезвонит за {SITE.workTimeMin} минут, чтобы подтвердить дату.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-gold" /> Живая цена
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-gold" /> 30+ меропр./мес
            </span>
            <span className="flex items-center gap-1.5">
              <Star className="w-4 h-4 fill-gold text-gold" /> 4.9 / 5 — средняя оценка
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-gold" /> Без обязательств
            </span>
          </div>
        </div>
      </section>

      {/* ===== Constructor ===== */}
      <section className="container mx-auto max-w-6xl px-4 py-10 sm:py-14">
        <ConstructorBuilder />
      </section>

      {/* ===== Trust ===== */}
      <section className="container mx-auto max-w-4xl px-4 pb-14">
        <TrustBadges />
      </section>

      {/* ===== CTA ===== */}
      <section className="container mx-auto max-w-7xl px-4 pb-20">
        <CtaBand
          title="Хотите консультацию до заявки?"
          subtitle="Опишите задачу словами — менеджер соберёт конфигурацию под ваш повод и бюджет. Перезвоним за 15 минут."
          prefill={{ source: 'konstruktor-cta', sourcePage: '/konstruktor' }}
        />
      </section>
    </>
  );
}
