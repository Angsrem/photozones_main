'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Heart, Cake, GraduationCap, Building2, Snowflake,
  Flower2, Zap, Leaf, CalendarHeart, Building,
  Frame, Layers, Shirt, Lightbulb, Type, CircleDot, Printer, Clock,
  MapPin, Calendar, ArrowLeft, ArrowRight, Check, Sparkles, RotateCcw, Info,
  ShieldCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { openQuickOrder } from '@/components/site/quick-order-store';
import { SITE } from '@/lib/constants';
import { formatPrice, todayISO } from '@/lib/format';

/* ============ Данные wizard'а ============ */

type OccasionOpt = { value: string; label: string; icon: React.ElementType; hint: string };
type StyleOpt = { value: string; label: string; icon: React.ElementType; modifier: number; hint: string };
type BaseOpt = { value: string; label: string; desc: string; price: number; icon: React.ElementType };
type AddonOpt = { value: string; label: string; price: number; icon: React.ElementType };

// Шаг 1 — Повод (значения тянутся из OCCASIONS где возможно + «Сезонный праздник»)
const OCCASION_OPTIONS: OccasionOpt[] = [
  { value: 'WEDDING', label: 'Свадьба', icon: Heart, hint: 'Торжество, банкет, выездная регистрация' },
  { value: 'BIRTHDAY', label: 'День рождения', icon: Cake, hint: 'Взрослый или детский праздник' },
  { value: 'GRADUATION', label: 'Выпускной', icon: GraduationCap, hint: 'Детский сад, школа, ВУЗ' },
  { value: 'CORPORATE', label: 'Корпоратив', icon: Building2, hint: 'Новый год, юбилей компании, тимбилдинг' },
  { value: 'SEASONAL', label: 'Сезонный праздник', icon: Snowflake, hint: 'Новый год, 8 марта, 23 февраля' },
];

// Шаг 2 — Тематика/стиль (влияет на базу цены)
const STYLE_OPTIONS: StyleOpt[] = [
  { value: 'classic-flora', label: 'Классика / Флора', icon: Flower2, modifier: 0, hint: 'Цветы, пастель, благородство' },
  { value: 'neon', label: 'Неон', icon: Zap, modifier: 2000, hint: 'Светящиеся надписи, неоновые линии' },
  { value: 'rustic-boho', label: 'Рустик / Бохо', icon: Leaf, modifier: 1500, hint: 'Дерево, текстиль, макраме' },
  { value: 'seasonal', label: 'Сезонная', icon: CalendarHeart, modifier: 1000, hint: 'Зима, весна, тематика праздника' },
  { value: 'brand', label: 'Брендовая', icon: Building, modifier: 3000, hint: 'Фирменные цвета и логотип' },
];

// Шаг 3 — Тип основы
const BASE_OPTIONS: BaseOpt[] = [
  { value: 'frame-s', label: 'Каркасная S', desc: '2 × 2 м · компактно', price: 8900, icon: Frame },
  { value: 'frame-m', label: 'Каркасная M', desc: '3 × 2.5 м · оптимально', price: 12900, icon: Frame },
  { value: 'frame-l', label: 'Каркасная L', desc: '4 × 3 м · масштаб', price: 17900, icon: Frame },
  { value: 'presswall', label: 'Пресс-волл', desc: '3 × 2.5 м · бренд', price: 15900, icon: Layers },
  { value: 'textile', label: 'Текстильная', desc: '3 × 2.5 м · мягко', price: 10900, icon: Shirt },
];

// Шаг 3 — Доп. элементы
const ADDON_OPTIONS: AddonOpt[] = [
  { value: 'light-letters', label: 'Световые буквы', price: 3900, icon: Lightbulb },
  { value: 'neon-sign', label: 'Неоновая надпись', price: 3500, icon: Type },
  { value: 'balloons-50', label: 'Шары 50 шт', price: 2500, icon: CircleDot },
  { value: 'garland', label: 'Гирлянда', price: 1500, icon: Sparkles },
  { value: 'logo-print', label: 'Печать логотипа', price: 4500, icon: Printer },
  { value: 'extra-hour', label: 'Доп. час работы', price: 800, icon: Clock },
];

const STEPS = ['Повод', 'Стиль', 'Основа', 'Дата и адрес'] as const;

/* ============ Компонент ============ */

export function CalculatorWizard() {
  const [step, setStep] = useState(0); // 0..3
  const [calculated, setCalculated] = useState(false);

  const [occasion, setOccasion] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [base, setBase] = useState<string>('');
  const [addons, setAddons] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isSuburb, setIsSuburb] = useState(false);

  // min date — считаем в рендере; добавляем suppressHydrationWarning на input,
  // чтобы избежать предупреждения о разнице SSR/CSR на границе суток.
  const minDate = todayISO();

  const occasionOpt = OCCASION_OPTIONS.find((o) => o.value === occasion);
  const styleOpt = STYLE_OPTIONS.find((s) => s.value === style);
  const baseOpt = BASE_OPTIONS.find((b) => b.value === base);
  const selectedAddons = ADDON_OPTIONS.filter((a) => addons.includes(a.value));

  const breakdown = useMemo(() => {
    const basePrice = baseOpt?.price ?? 0;
    const styleModifier = styleOpt?.modifier ?? 0;
    const addonsTotal = selectedAddons.reduce((s, a) => s + a.price, 0);
    const suburb = isSuburb ? SITE.suburbSurcharge : 0;
    const total = basePrice + styleModifier + addonsTotal + suburb;
    return { basePrice, styleModifier, addonsTotal, suburb, total };
  }, [baseOpt, styleOpt, selectedAddons, isSuburb]);

  const canNext = () => {
    if (step === 0) return !!occasion;
    if (step === 1) return !!style;
    if (step === 2) return !!base;
    if (step === 3) return !!date;
    return false;
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
    else setCalculated(true);
  };
  const back = () => {
    if (calculated) { setCalculated(false); return; }
    if (step > 0) setStep(step - 1);
  };

  const toggleAddon = (v: string) => {
    setAddons((prev) => (prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v]));
  };

  const handleOrder = () => {
    const config = {
      occasion: occasionOpt?.value ?? occasion,
      occasionLabel: occasionOpt?.label ?? occasion,
      style: styleOpt?.value ?? style,
      styleLabel: styleOpt?.label ?? style,
      base: baseOpt
        ? { value: baseOpt.value, label: baseOpt.label, desc: baseOpt.desc, price: baseOpt.price }
        : null,
      addons: selectedAddons.map((a) => ({ value: a.value, label: a.label, price: a.price })),
      date,
      address,
      isSuburb,
      suburbSurcharge: isSuburb ? SITE.suburbSurcharge : 0,
      breakdown: {
        base: breakdown.basePrice,
        style: breakdown.styleModifier,
        addons: breakdown.addonsTotal,
        suburb: breakdown.suburb,
        total: breakdown.total,
      },
    };
    openQuickOrder({
      source: 'kalkulyator',
      sourcePage: '/kalkulyator',
      occasion: occasionOpt?.value ?? occasion,
      priceEstimate: breakdown.total,
      config,
    });
  };

  const progressValue = calculated ? 100 : ((step + 1) / 4) * 100;

  return (
    <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-2xl">
      {/* ===== Stepper / Progress ===== */}
      <div className="mb-6">
        <div className="flex items-center justify-between gap-1 mb-3">
          {STEPS.map((label, i) => {
            const done = calculated || i < step;
            const active = !calculated && i === step;
            return (
              <div key={label} className="flex-1 flex items-center gap-1 min-w-0">
                <div
                  className={[
                    'flex items-center gap-2 rounded-full px-2 sm:px-3 h-9 sm:h-10 text-xs sm:text-sm transition-colors whitespace-nowrap',
                    active ? 'bg-gold text-primary-foreground font-semibold'
                      : done ? 'bg-gold/15 text-gold'
                      : 'bg-muted/50 text-muted-foreground',
                  ].join(' ')}
                >
                  <span className="flex items-center justify-center w-5 h-5 rounded-full text-[11px]">
                    {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
                  </span>
                  <span className="hidden sm:inline">{label}</span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className="flex-1 h-px bg-border hidden sm:block" />
                )}
              </div>
            );
          })}
        </div>
        <Progress value={progressValue} className="h-1.5 bg-muted/50 [&>div]:bg-gold" />
      </div>

      {/* ===== Body ===== */}
      <div className="min-h-[340px]">
        <AnimatePresence mode="wait">
          {calculated ? (
            <motion.div
              key="result"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
            >
              <ResultView
                occasionLabel={occasionOpt?.label ?? occasion}
                styleLabel={styleOpt?.label ?? style}
                baseOpt={baseOpt}
                selectedAddons={selectedAddons}
                date={date}
                address={address}
                isSuburb={isSuburb}
                breakdown={breakdown}
                onOrder={handleOrder}
                onEdit={() => setCalculated(false)}
              />
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepOccasion value={occasion} onChange={setOccasion} />
              )}
              {step === 1 && (
                <StepStyle value={style} onChange={setStyle} />
              )}
              {step === 2 && (
                <StepBaseAndAddons
                  base={base} onBase={setBase}
                  addons={addons} onToggleAddon={toggleAddon}
                />
              )}
              {step === 3 && (
                <StepDateAddress
                  date={date} onDate={setDate}
                  address={address} onAddress={setAddress}
                  isSuburb={isSuburb} onSuburb={setIsSuburb}
                  minDate={minDate}
                />
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ===== Nav buttons ===== */}
      <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-border/60">
        <Button
          variant="ghost"
          onClick={back}
          disabled={!calculated && step === 0}
          className="h-12 px-5"
        >
          <ArrowLeft className="w-4 h-4 mr-1" /> Назад
        </Button>

        {!calculated ? (
          <Button
            onClick={next}
            disabled={!canNext()}
            className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            {step === 3 ? <>Рассчитать <Sparkles className="w-4 h-4 ml-1" /></> : <>Далее <ArrowRight className="w-4 h-4 ml-1" /></>}
          </Button>
        ) : (
          <Button
            onClick={handleOrder}
            className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-1" /> Зафиксировать расчёт и заказать
          </Button>
        )}
      </div>
    </div>
  );
}

/* ============ Шаг 1 — Повод ============ */

function StepOccasion({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 1 из 4"
        title="Какой повод у мероприятия?"
        subtitle="От повода зависит подбор стилистики и сезонных предложений"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {OCCASION_OPTIONS.map((o) => {
          const active = value === o.value;
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onChange(o.value)}
              aria-pressed={active}
              className={[
                'group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all min-h-[88px]',
                active ? 'border-gold bg-gold/10 ring-2 ring-gold/40' : 'border-border bg-background hover:border-gold/50',
              ].join(' ')}
            >
              <span className={[
                'flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors',
                active ? 'bg-gold text-primary-foreground' : 'bg-muted text-gold',
              ].join(' ')}>
                <o.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="block font-display text-lg leading-tight">{o.label}</span>
                <span className="block text-sm text-muted-foreground mt-1">{o.hint}</span>
              </span>
              <span className={[
                'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                active ? 'border-gold bg-gold' : 'border-muted-foreground/40',
              ].join(' ')}>
                {active && <Check className="w-3 h-3 text-primary-foreground" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Шаг 2 — Стиль ============ */

function StepStyle({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 2 из 4"
        title="Тематика и стиль фотозоны"
        subtitle="Стиль влияет на базовую стоимость — неоновые и брендовые решения сложнее в производстве"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
        {STYLE_OPTIONS.map((s) => {
          const active = value === s.value;
          return (
            <button
              key={s.value}
              type="button"
              onClick={() => onChange(s.value)}
              aria-pressed={active}
              className={[
                'group relative flex items-start gap-3 rounded-2xl border p-4 text-left transition-all min-h-[88px]',
                active ? 'border-gold bg-gold/10 ring-2 ring-gold/40' : 'border-border bg-background hover:border-gold/50',
              ].join(' ')}
            >
              <span className={[
                'flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors',
                active ? 'bg-gold text-primary-foreground' : 'bg-muted text-gold',
              ].join(' ')}>
                <s.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg leading-tight">{s.label}</span>
                  {s.modifier > 0 && (
                    <Badge variant="outline" className="text-gold border-gold/40">+{formatPrice(s.modifier)}</Badge>
                  )}
                </span>
                <span className="block text-sm text-muted-foreground mt-1">{s.hint}</span>
              </span>
              <span className={[
                'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                active ? 'border-gold bg-gold' : 'border-muted-foreground/40',
              ].join(' ')}>
                {active && <Check className="w-3 h-3 text-primary-foreground" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Шаг 3 — Основа + доп. элементы ============ */

function StepBaseAndAddons({
  base, onBase, addons, onToggleAddon,
}: {
  base: string; onBase: (v: string) => void;
  addons: string[]; onToggleAddon: (v: string) => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 3 из 4"
        title="Размер, тип основы и доп. элементы"
        subtitle="Выберите основу — и добавьте детали, которые сделают фотозону ярче"
      />

      <h3 className="font-display text-base text-gold mt-5 mb-3 flex items-center gap-2">
        <Frame className="w-4 h-4" /> Тип основы
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BASE_OPTIONS.map((b) => {
          const active = base === b.value;
          return (
            <button
              key={b.value}
              type="button"
              onClick={() => onBase(b.value)}
              aria-pressed={active}
              className={[
                'group relative flex flex-col rounded-2xl border p-4 text-left transition-all min-h-[112px]',
                active ? 'border-gold bg-gold/10 ring-2 ring-gold/40' : 'border-border bg-background hover:border-gold/50',
              ].join(' ')}
            >
              <span className="flex items-center justify-between mb-2">
                <span className={[
                  'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                  active ? 'bg-gold text-primary-foreground' : 'bg-muted text-gold',
                ].join(' ')}>
                  <b.icon className="w-5 h-5" />
                </span>
                <span className={[
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  active ? 'border-gold bg-gold' : 'border-muted-foreground/40',
                ].join(' ')}>
                  {active && <Check className="w-3 h-3 text-primary-foreground" />}
                </span>
              </span>
              <span className="font-display text-base leading-tight">{b.label}</span>
              <span className="text-xs text-muted-foreground mt-0.5">{b.desc}</span>
              <span className="text-gold font-semibold mt-2">{formatPrice(b.price)}</span>
            </button>
          );
        })}
      </div>

      <h3 className="font-display text-base text-gold mt-7 mb-3 flex items-center gap-2">
        <Sparkles className="w-4 h-4" /> Дополнительные элементы
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {ADDON_OPTIONS.map((a) => {
          const checked = addons.includes(a.value);
          return (
            <label
              key={a.value}
              htmlFor={`addon-${a.value}`}
              className={[
                'flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all min-h-[56px]',
                checked ? 'border-gold bg-gold/10' : 'border-border bg-background hover:border-gold/50',
              ].join(' ')}
            >
              <Checkbox id={`addon-${a.value}`} checked={checked} onCheckedChange={() => onToggleAddon(a.value)} />
              <a.icon className="w-5 h-5 text-gold shrink-0" />
              <span className="flex-1 text-sm font-medium">{a.label}</span>
              <span className="text-sm text-gold font-semibold whitespace-nowrap">+{formatPrice(a.price)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Шаг 4 — Дата и адрес ============ */

function StepDateAddress({
  date, onDate, address, onAddress, isSuburb, onSuburb, minDate,
}: {
  date: string; onDate: (v: string) => void;
  address: string; onAddress: (v: string) => void;
  isSuburb: boolean; onSuburb: (v: boolean) => void;
  minDate: string;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 4 из 4"
        title="Дата и адрес мероприятия"
        subtitle="Укажем логистику и подтверждение наличия на дату"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div className="space-y-1.5">
          <Label htmlFor="calc-date" className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gold" /> Дата мероприятия <span className="text-coral">*</span>
          </Label>
          <Input
            id="calc-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="h-12"
            suppressHydrationWarning
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="calc-address" className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gold" /> Адрес (ресторан, лофт, улица)
          </Label>
          <Input
            id="calc-address"
            value={address}
            onChange={(e) => onAddress(e.target.value)}
            placeholder="г. Красноярск, ул. ..."
            className="h-12"
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <label htmlFor="calc-suburb" className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            id="calc-suburb"
            checked={isSuburb}
            onCheckedChange={(v) => onSuburb(v === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">Мероприятие в пригороде</span>
              <Badge variant="outline" className="text-gold border-gold/40">+{formatPrice(SITE.suburbSurcharge)}</Badge>
            </div>
            <div className="flex items-start gap-1.5 mt-1 text-sm text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 text-gold shrink-0" />
              <span>
                Надбавка за доставку за город: {SITE.suburbs.join(', ')}.
                По городу доставка бесплатна.
              </span>
            </div>
          </div>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
        <span>Дата и адрес нужны для расчёта логистики. Точная цена и наличие подтверждаются менеджером по телефону.</span>
      </div>
    </div>
  );
}

/* ============ Результат ============ */

function ResultView({
  occasionLabel, styleLabel, baseOpt, selectedAddons, date, address, isSuburb,
  breakdown, onOrder, onEdit,
}: {
  occasionLabel: string; styleLabel: string;
  baseOpt: BaseOpt | undefined;
  selectedAddons: AddonOpt[];
  date: string; address: string; isSuburb: boolean;
  breakdown: { basePrice: number; styleModifier: number; addonsTotal: number; suburb: number; total: number };
  onOrder: () => void; onEdit: () => void;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Готово"
        title="Ориентировочная стоимость"
        subtitle="Расчёт сложился из выбранной основы, стиля, доп. элементов и логистики"
      />

      {/* Total */}
      <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-8 text-center mt-5">
        <div className="text-sm text-muted-foreground mb-1">Примерная стоимость аренды</div>
        <div className="font-display text-4xl sm:text-5xl text-gradient-gold leading-none">
          {formatPrice(breakdown.total)}
        </div>
        <div className="text-xs text-muted-foreground mt-2">
          Доставка по городу, монтаж и демонтаж включены
        </div>
      </div>

      {/* Breakdown */}
      <div className="rounded-2xl border border-border bg-background p-5 mt-4">
        <h3 className="font-display text-base mb-3 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-gold" /> Состав расчёта
        </h3>
        <ul className="space-y-2 text-sm">
          <BreakdownRow label={`Повод: ${occasionLabel}`} />
          <BreakdownRow label={`Стиль: ${styleLabel}`} value={breakdown.styleModifier} />
          {baseOpt && (
            <BreakdownRow label={`Основа: ${baseOpt.label} (${baseOpt.desc})`} value={breakdown.basePrice} />
          )}
          {selectedAddons.map((a) => (
            <BreakdownRow key={a.value} label={`Доп.: ${a.label}`} value={a.price} />
          ))}
          {isSuburb && (
            <BreakdownRow label="Доставка в пригород" value={breakdown.suburb} />
          )}
          {date && <BreakdownRow label={`Дата: ${date}`} />}
          {address && <BreakdownRow label={`Адрес: ${address}`} />}
        </ul>
        <div className="border-t border-border mt-4 pt-3 flex items-center justify-between">
          <span className="font-medium">Итого</span>
          <span className="font-display text-2xl text-gold">{formatPrice(breakdown.total)}</span>
        </div>
      </div>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground text-center mt-4 leading-relaxed">
        Расчёт ориентировочный. Точную цену менеджер назовёт по телефону за 15 минут —
        с учётом занятости на вашу дату и нюансов площадки.
      </p>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3 mt-5">
        <Button onClick={onOrder} className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold flex-1">
          <Sparkles className="w-4 h-4 mr-1.5" /> Зафиксировать расчёт и заказать
        </Button>
        <Button onClick={onEdit} variant="outline" className="h-12 px-6">
          <RotateCcw className="w-4 h-4 mr-1.5" /> Изменить параметры
        </Button>
      </div>
    </div>
  );
}

function BreakdownRow({ label, value }: { label: string; value?: number }) {
  return (
    <li className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      {value != null && (
        <span className={value === 0 ? 'text-muted-foreground' : 'text-foreground font-medium'}>
          {value === 0 ? 'включено' : `+${formatPrice(value)}`}
        </span>
      )}
    </li>
  );
}

/* ============ Shared header для шагов ============ */

function StepHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-1.5">{eyebrow}</span>
      <h2 className="font-display text-2xl sm:text-3xl leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
