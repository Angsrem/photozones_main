import Link from 'next/link';
import { ChevronRight, Clock, Truck, Wrench, ShieldCheck } from 'lucide-react';

/** Хлебные крошки (видимая навигация). JSON-LD рендерится отдельно через breadcrumbsLd(). */
export function PageBreadcrumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Хлебные крошки" className="container mx-auto max-w-7xl px-4 pt-6">
      <ol className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
        {items.map((it, i) => (
          <li key={i} className="flex items-center gap-1.5">
            {it.href ? (
              <Link href={it.href} className="hover:text-gold transition-colors">{it.name}</Link>
            ) : (
              <span className="text-foreground/80">{it.name}</span>
            )}
            {i < items.length - 1 && <ChevronRight className="w-3 h-3 opacity-60" />}
          </li>
        ))}
      </ol>
    </nav>
  );
}

/** Hero-секция посадочной: eyebrow + H1 + SEO-вводный текст. */
export function PageHero({
  eyebrow,
  title,
  intro,
}: {
  eyebrow?: string;
  title: React.ReactNode;
  intro?: React.ReactNode;
}) {
  return (
    <section className="container mx-auto max-w-7xl px-4 pt-8 pb-8">
      {eyebrow && (
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-3">
          {eyebrow}
        </span>
      )}
      <h1 className="font-display text-4xl sm:text-5xl leading-[1.1] max-w-4xl">{title}</h1>
      {intro && (
        <div className="mt-5 text-muted-foreground text-base sm:text-lg max-w-3xl leading-relaxed">
          {intro}
        </div>
      )}
    </section>
  );
}

const whyItems = [
  { icon: Clock, title: 'Перезвон за 15 минут', text: 'Менеджер связывается в среднем за 7 минут и подтверждает наличие на дату.' },
  { icon: Truck, title: 'Доставка по Красноярску', text: 'Привозим в любой район и пригород. Надбавка за пригород — 1500 ₽.' },
  { icon: Wrench, title: 'Монтаж за 1 час', text: 'Собираем фотозону до начала мероприятия, демонтируем после. Вам ничего делать не нужно.' },
  { icon: ShieldCheck, title: 'Договор и гарантия', text: 'Работаем официально. 100+ мероприятий в месяц в Красноярске.' },
];

/** Блок «Почему мы» — единый для всех посадочных. */
export function WhyUs({ title = 'Почему выбирают ФотоЗона24' }: { title?: string }) {
  return (
    <section className="bg-card/30 border-y border-border/60 py-14 mt-4">
      <div className="container mx-auto max-w-7xl px-4">
        <h2 className="font-display text-3xl sm:text-4xl text-center mb-8">{title}</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {whyItems.map((it) => (
            <div key={it.title} className="rounded-2xl border border-border bg-background p-5">
              <it.icon className="w-7 h-7 text-gold mb-3" />
              <h3 className="font-display text-lg mb-1">{it.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{it.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Пустое состояние, когда под фильтр нет фотозон. */
export function EmptyPhotozones({
  text = 'Сейчас нет активных фотозон под этот повод — менеджер подберёт аналог.',
}: { text?: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-card/30 p-8 text-center text-muted-foreground">
      {text}
    </div>
  );
}
