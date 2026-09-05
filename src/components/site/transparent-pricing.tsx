import { Check, X, AlertTriangle, ShieldCheck } from 'lucide-react';
import { SITE } from '@/lib/constants';

// Блок прозрачного ценообразования для карточки фотозоны
// ✅ Что входит · ❌ Мы НЕ берём доплату за · ⚠️ Обратите внимание
export function TransparentPricing({
  includes,
  basePrice,
  className = '',
}: {
  includes: string[];
  basePrice: number;
  className?: string;
}) {
  const notCharged = [
    'Монтаж и демонтаж',
    'Доставка по Красноярску',
    'Использование своих инструментов',
  ];
  const attention = [
    { label: 'Доп. сутки хранения', value: '1 500 ₽/день' },
    { label: 'Срочный заказ (за 48 ч)', value: '+15% к пакету' },
    { label: 'Выезд в пригород', value: '+1 000 ₽' },
  ];

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <ShieldCheck className="w-5 h-5 text-gold" />
        <h3 className="font-display text-lg">Прозрачная цена — {basePrice.toLocaleString('ru-RU')} ₽</h3>
      </div>
      <p className="text-sm text-muted-foreground -mt-2">
        Фиксированная стоимость «всё включено». Цена не изменится после звонка — никаких сюрпризов.
      </p>

      {/* ✅ Входит */}
      <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Check className="w-4 h-4 text-emerald-400" />
          <span className="text-sm font-semibold">В стоимость уже включено:</span>
        </div>
        <ul className="space-y-1.5">
          {includes.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <Check className="w-3.5 h-3.5 text-emerald-400 mt-0.5 shrink-0" />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* ❌ Не берём доплату */}
      <div className="rounded-xl border border-border bg-card/50 p-4">
        <div className="flex items-center gap-2 mb-3">
          <X className="w-4 h-4 text-coral" />
          <span className="text-sm font-semibold">Мы НЕ берём доплату за:</span>
        </div>
        <ul className="space-y-1.5">
          {notCharged.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
              <X className="w-3.5 h-3.5 text-coral mt-0.5 shrink-0" />
              <span>{item} <span className="text-xs text-muted-foreground/60">(у конкурентов +2 000–5 000 ₽)</span></span>
            </li>
          ))}
        </ul>
      </div>

      {/* ⚠️ Обратите внимание */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-amber-400" />
          <span className="text-sm font-semibold">Дополнительные опции (прозрачно):</span>
        </div>
        <ul className="space-y-1.5">
          {attention.map((item, i) => (
            <li key={i} className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">{item.label}</span>
              <span className="font-medium text-foreground">{item.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

// Блок "Почему у нас дешевле" — ответ на "на чём я сэкономил"
export function WhyCheaperBlock({ className = '' }: { className?: string }) {
  const reasons = [
    {
      title: 'Нет посредников',
      text: 'Мы сами производим и сами сдаём фотозоны. Вы не платите агентской наценке 20–30%, которую конкуренты закладывают в цену.',
    },
    {
      title: 'Не платим комиссию площадкам',
      text: 'Клиенты приходят к нам напрямую с сайта. На биржах исполнители закладывают комиссию 10–25% в цену — мы нет.',
    },
    {
      title: 'Монтаж — не отдельная платная услуга',
      text: 'Наши конструкции собирает один специалист за 30–40 минут. Это наш процесс, а не повод для доплаты +2 000–3 000 ₽.',
    },
    {
      title: 'Цена не изменится после звонка',
      text: 'Никаких «+2 000 за монтаж» и «+1 500 за доставку» в последний момент. Назвали цену — она финальная.',
    },
  ];

  return (
    <div className={className}>
      <div className="text-center mb-6">
        <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-2">Без подвоха</span>
        <h2 className="font-display text-3xl sm:text-4xl mb-2">Почему у нас дешевле — и за счёт чего</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Разница в цене — это не «более дешёвая фотозона», а снятые комиссии, наценки и скрытые доплаты.
          Вы платите за фотозону, а не за чужие каналы привлечения.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {reasons.map((r, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card/50 p-5">
            <div className="flex items-start gap-3">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-gold/15 shrink-0 font-bold text-gold text-sm">
                {i + 1}
              </div>
              <div>
                <h3 className="font-medium mb-1">{r.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{r.text}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Сравнительная таблица "Мы vs конкуренты"
export function ComparisonTable({ className = '' }: { className?: string }) {
  const rows = [
    { label: 'Цена за пакет', we: 'Фиксированная, «всё включено»', they: 'Низкая базовая + доплаты' },
    { label: 'Монтаж и демонтаж', we: 'Включён в цену', they: 'Доп. плата 2 000–5 000 ₽' },
    { label: 'Доставка по городу', we: 'Включена в цену', they: 'Зависит от расстояния' },
    { label: 'Скрытые платежи', we: 'Нет', they: 'Часто есть' },
    { label: 'Время на согласование', we: 'Минимум — всё понятно сразу', they: 'Часы уточнений и доплат' },
    { label: 'Цена после звонка', we: 'Не меняется', they: 'Может вырасти' },
  ];

  return (
    <div className={`rounded-2xl border border-border overflow-hidden ${className}`}>
      <div className="grid grid-cols-3 bg-card/50 border-b border-border">
        <div className="p-4 text-sm font-semibold text-muted-foreground">Что сравниваем</div>
        <div className="p-4 text-sm font-semibold text-gold flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4" /> ФотоЗона24
        </div>
        <div className="p-4 text-sm font-semibold text-muted-foreground">Типичные конкуренты</div>
      </div>
      {rows.map((row, i) => (
        <div key={i} className={`grid grid-cols-3 border-b border-border/50 ${i % 2 ? 'bg-card/20' : ''}`}>
          <div className="p-4 text-sm text-muted-foreground">{row.label}</div>
          <div className="p-4 text-sm flex items-start gap-1.5">
            <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{row.we}</span>
          </div>
          <div className="p-4 text-sm flex items-start gap-1.5">
            <X className="w-4 h-4 text-coral/70 shrink-0 mt-0.5" />
            <span className="text-muted-foreground">{row.they}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
