'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Frame, Flower2, Zap, Leaf, CalendarHeart, Building,
  Lightbulb, Sparkles, Clapperboard, Type, ConciergeBell, Tag,
  MapPin, Calendar, ArrowLeft, ArrowRight, Check, Info, ShieldCheck, Wand2,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { openQuickOrder } from '@/components/site/quick-order-store';
import { SimilarInStock } from '@/components/site/similar-in-stock';
import { SITE } from '@/lib/constants';
import { formatPrice, todayISO } from '@/lib/format';

/* ============ Типы ============ */

type StyleOpt = { value: string; label: string; modifier: number; hint: string; icon: React.ElementType };
type ExtraOpt = {
  id: string;
  name: string;
  price: number;
  category: string;
  description?: string | null;
  image?: string | null;
  isBase?: boolean;
};

type DynamicBase = { id: string; label: string; desc: string; price: number };

/* ============ Данные wizard'а ============ */

// Шаг 2 — Стиль (модификатор прибавляется к базе). Это обобщённые стили — не DB-элементы.
const STYLE_OPTIONS: StyleOpt[] = [
  { value: 'classic', label: 'Классика', modifier: 0, hint: 'Цветы, пастель, благородство', icon: Flower2 },
  { value: 'neon', label: 'Неон', modifier: 2000, hint: 'Светящиеся надписи, неоновые линии', icon: Zap },
  { value: 'rustic', label: 'Рустик', modifier: 1500, hint: 'Дерево, текстиль, макраме', icon: Leaf },
  { value: 'seasonal', label: 'Сезонная', modifier: 1000, hint: 'Зима, весна, тематика праздника', icon: CalendarHeart },
  { value: 'brand', label: 'Брендовая', modifier: 3000, hint: 'Фирменные цвета и логотип', icon: Building },
];

// Категории доп. элементов (порядок + иконка/заголовок)
const CATEGORY_META: { value: string; label: string; icon: React.ElementType }[] = [
  { value: 'lighting', label: 'Освещение', icon: Lightbulb },
  { value: 'decor', label: 'Декор', icon: Sparkles },
  { value: 'prop', label: 'Реквизит', icon: Clapperboard },
  { value: 'letter', label: 'Буквы и цифры', icon: Type },
  { value: 'service', label: 'Услуги', icon: ConciergeBell },
];

const STEPS = ['Основа', 'Стиль', 'Доп. элементы', 'Дата и адрес'] as const;

// Извлекаем размеры из названия, например "Мольберт-классика (1.6×1.2 м)" → "1.6×1.2 м"
function extractDimensions(name: string): string | null {
  const m = name.match(/\(([^)]+)\)/);
  if (!m) return null;
  return /\d/.test(m[1]) ? m[1].replace(/\s+/g, ' ').trim() : null;
}

function cleanName(name: string): string {
  return name.replace(/\s*\([^)]*\)\s*/g, '').trim();
}

/* ============ Компонент ============ */

export function ConstructorBuilder() {
  const [step, setStep] = useState(0); // 0..3

  const [baseId, setBaseId] = useState<string>('');
  const [style, setStyle] = useState<string>('');
  const [extras, setExtras] = useState<string[]>([]);
  const [date, setDate] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [isSuburb, setIsSuburb] = useState(false);

  const [elements, setElements] = useState<ExtraOpt[]>([]);
  const [loadingElements, setLoadingElements] = useState(true);
  const [elementsError, setElementsError] = useState(false);

  // Загрузка глобальных активных элементов
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoadingElements(true);
        setElementsError(false);
        const res = await fetch('/api/elements', { cache: 'no-store' });
        if (!res.ok) throw new Error('network');
        const data = (await res.json()) as { items: ExtraOpt[] };
        if (!cancelled) setElements(data.items ?? []);
      } catch {
        if (!cancelled) setElementsError(true);
      } finally {
        if (!cancelled) setLoadingElements(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // min date — считаем в рендере; suppressHydrationWarning на input,
  // чтобы избежать SSR/CSR-мисматча на границе суток.
  const minDate = todayISO();

  // Динамические базовые конструкции (отфильтрованные по isBase)
  const baseOptions: DynamicBase[] = useMemo(() => {
    return elements
      .filter((e) => e.isBase)
      .map((e) => {
        const dim = extractDimensions(e.name);
        return {
          id: e.id,
          label: cleanName(e.name),
          desc: dim || (e.description ? e.description.slice(0, 60) : 'Базовая конструкция'),
          price: e.price,
        };
      });
  }, [elements]);

  // Доп. элементы = все, кроме базовых
  const addonOptions: ExtraOpt[] = useMemo(
    () => elements.filter((e) => !e.isBase),
    [elements],
  );

  const baseOpt = baseOptions.find((b) => b.id === baseId);
  const styleOpt = STYLE_OPTIONS.find((s) => s.value === style);
  const selectedExtras = useMemo(
    () => addonOptions.filter((e) => extras.includes(e.id)),
    [addonOptions, extras],
  );

  const breakdown = useMemo(() => {
    const basePrice = baseOpt?.price ?? 0;
    const styleModifier = styleOpt?.modifier ?? 0;
    const extrasTotal = selectedExtras.reduce((s, e) => s + e.price, 0);
    const surcharge = isSuburb ? SITE.suburbSurcharge : 0;
    const total = basePrice + styleModifier + extrasTotal + surcharge;
    return { basePrice, styleModifier, extrasTotal, surcharge, total };
  }, [baseOpt, styleOpt, selectedExtras, isSuburb]);

  const canNext = () => {
    if (step === 0) return !!baseId;
    if (step === 1) return !!style;
    if (step === 2) return true; // доп. элементы необязательны
    if (step === 3) return true; // дата/адрес можно оставить для модалки
    return false;
  };

  const next = () => {
    if (step < 3) setStep(step + 1);
  };
  const back = () => {
    if (step > 0) setStep(step - 1);
  };

  const toggleExtra = (id: string) => {
    setExtras((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleOrder = () => {
    if (!baseOpt) return;
    openQuickOrder({
      source: 'constructor',
      sourcePage: '/konstruktor',
      priceEstimate: breakdown.total,
      config: {
        base: baseOpt
          ? { id: baseOpt.id, label: baseOpt.label, desc: baseOpt.desc, price: baseOpt.price }
          : null,
        style: styleOpt
          ? { value: styleOpt.value, label: styleOpt.label, modifier: styleOpt.modifier }
          : null,
        extras: selectedExtras.map((e) => ({
          id: e.id,
          name: e.name,
          price: e.price,
          category: e.category,
        })),
        date,
        address,
        surcharge: breakdown.surcharge,
        isSuburb,
        breakdown: {
          base: breakdown.basePrice,
          style: breakdown.styleModifier,
          extras: breakdown.extrasTotal,
          surcharge: breakdown.surcharge,
          total: breakdown.total,
        },
      },
    });
  };

  const progressValue = ((step + 1) / 4) * 100;

  // Группировка элементов по категории (только для аддонов — базовые исключены)
  const groupedExtras = useMemo(() => {
    const groups: { value: string; label: string; icon: React.ElementType; items: ExtraOpt[] }[] = [];
    for (const meta of CATEGORY_META) {
      const items = addonOptions.filter((e) => e.category === meta.value);
      if (items.length > 0) {
        groups.push({ value: meta.value, label: meta.label, icon: meta.icon, items });
      }
    }
    // Если есть элементы с категорией вне CATEGORY_META — покажем их в группе «Прочее»
    const known = new Set(CATEGORY_META.map((m) => m.value));
    const otherItems = addonOptions.filter((e) => !known.has(e.category));
    if (otherItems.length > 0) {
      groups.push({ value: 'other', label: 'Прочее', icon: Tag, items: otherItems });
    }
    return groups;
  }, [addonOptions]);

  return (
    <div className="grid lg:grid-cols-[1fr_360px] gap-6 items-start">
      {/* ====== Wizard ====== */}
      <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4 sm:p-6 lg:p-8 shadow-2xl">
        {/* Progress / Stepper */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-1 mb-3">
            {STEPS.map((label, i) => {
              const done = i < step;
              const active = i === step;
              return (
                <div key={label} className="flex-1 flex items-center gap-1 min-w-0">
                  <div
                    className={[
                      'flex items-center gap-2 rounded-full px-2 sm:px-3 h-9 sm:h-10 text-xs sm:text-sm transition-colors whitespace-nowrap',
                      active
                        ? 'bg-gold text-primary-foreground font-semibold'
                        : done
                        ? 'bg-gold/15 text-gold'
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

        {/* Body */}
        <div className="min-h-[340px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.25 }}
            >
              {step === 0 && (
                <StepBase
                  value={baseId}
                  onChange={setBaseId}
                  baseOptions={baseOptions}
                  loading={loadingElements}
                  error={elementsError}
                />
              )}
              {step === 1 && <StepStyle value={style} onChange={setStyle} />}
              {step === 2 && (
                <StepExtras
                  grouped={groupedExtras}
                  selected={extras}
                  onToggle={toggleExtra}
                  loading={loadingElements}
                  error={elementsError}
                />
              )}
              {step === 3 && (
                <StepDateAddress
                  date={date}
                  onDate={setDate}
                  address={address}
                  onAddress={setAddress}
                  isSuburb={isSuburb}
                  onSuburb={setIsSuburb}
                  minDate={minDate}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center justify-between gap-3 mt-6 pt-5 border-t border-border/60">
          <Button
            variant="ghost"
            onClick={back}
            disabled={step === 0}
            className="h-12 px-5"
          >
            <ArrowLeft className="w-4 h-4 mr-1" /> Назад
          </Button>

          {step < 3 ? (
            <Button
              onClick={next}
              disabled={!canNext()}
              className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
            >
              Далее <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button
              onClick={handleOrder}
              disabled={!baseOpt}
              className="h-12 px-7 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
            >
              <Sparkles className="w-4 h-4 mr-1" /> Зафиксировать и заказать
            </Button>
          )}
        </div>
      </div>

      {/* ====== Sticky sidebar (desktop) ====== */}
      <aside className="hidden lg:block sticky top-4 space-y-4">
        <PriceSummary
          baseOpt={baseOpt}
          styleOpt={styleOpt}
          selectedExtras={selectedExtras}
          isSuburb={isSuburb}
          breakdown={breakdown}
          onOrder={handleOrder}
          loadingElements={loadingElements}
        />
        {/* === Похожие из наличия ±15% === */}
        {breakdown.total > 0 && (
          <div className="rounded-3xl border border-border bg-card/60 backdrop-blur p-4 sm:p-5">
            <SimilarInStock
              calcPrice={breakdown.total}
              limit={5}
              variant="compact"
            />
          </div>
        )}
      </aside>

      {/* ====== Sticky bottom bar (mobile) ====== */}
      <div
        className="lg:hidden fixed bottom-0 inset-x-0 z-40 border-t border-border glass px-3 py-2 flex items-center gap-3"
        style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}
      >
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground leading-tight">Итого</div>
          <div className="font-display text-xl text-gold leading-tight truncate">
            {formatPrice(breakdown.total)}
          </div>
        </div>
        <Button
          onClick={handleOrder}
          disabled={!baseOpt}
          className="h-12 px-5 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0"
        >
          <Wand2 className="w-4 h-4 mr-1.5" /> Заказать
        </Button>
      </div>

      {/* ====== Mobile: Similar in stock (под wizard'ом) ====== */}
      {breakdown.total > 0 && (
        <div className="lg:hidden mt-6">
          <SimilarInStock calcPrice={breakdown.total} limit={3} variant="compact" />
        </div>
      )}
    </div>
  );
}

/* ============ Шаг 1 — Основа ============ */

function StepBase({
  value,
  onChange,
  baseOptions,
  loading,
  error,
}: {
  value: string;
  onChange: (v: string) => void;
  baseOptions: DynamicBase[];
  loading: boolean;
  error: boolean;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 1 из 4"
        title="Выберите основу фотозоны"
        subtitle="Размер и тип конструкции — отправная точка конфигурации. Цены берутся из актуальной базы."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[120px] rounded-2xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-coral/40 bg-coral/10 p-5 text-sm">
          <p className="flex items-start gap-2 text-coral">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Не удалось загрузить базовые конструкции. Проверьте соединение или продолжите — менеджер подберёт основу под ваш запрос.
            </span>
          </p>
        </div>
      ) : baseOptions.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-dashed border-border bg-background p-5 text-sm text-muted-foreground">
          Сейчас в каталоге нет базовых конструкций — менеджер подберёт основу под ваш запрос после заявки.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
          {baseOptions.map((b) => {
            const active = value === b.id;
            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange(b.id)}
                aria-pressed={active}
                className={[
                  'group relative flex flex-col rounded-2xl border p-4 text-left transition-all min-h-[120px]',
                  active ? 'border-gold bg-gold/10 ring-2 ring-gold/40' : 'border-border bg-background hover:border-gold/50',
                ].join(' ')}
              >
                <span className="flex items-center justify-between mb-2">
                  <span
                    className={[
                      'flex items-center justify-center w-10 h-10 rounded-lg transition-colors',
                      active ? 'bg-gold text-primary-foreground' : 'bg-muted text-gold',
                    ].join(' ')}
                  >
                    <Frame className="w-5 h-5" />
                  </span>
                  <span
                    className={[
                      'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                      active ? 'border-gold bg-gold' : 'border-muted-foreground/40',
                    ].join(' ')}
                  >
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
      )}
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
        subtitle="Стиль влияет на стоимость — неон и бренд сложнее в производстве"
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
              <span
                className={[
                  'flex items-center justify-center w-11 h-11 rounded-xl shrink-0 transition-colors',
                  active ? 'bg-gold text-primary-foreground' : 'bg-muted text-gold',
                ].join(' ')}
              >
                <s.icon className="w-5 h-5" />
              </span>
              <span className="flex-1 min-w-0">
                <span className="flex items-center gap-2 flex-wrap">
                  <span className="font-display text-lg leading-tight">{s.label}</span>
                  {s.modifier > 0 ? (
                    <Badge variant="outline" className="text-gold border-gold/40">
                      +{formatPrice(s.modifier)}
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-muted-foreground border-border">
                      включено
                    </Badge>
                  )}
                </span>
                <span className="block text-sm text-muted-foreground mt-1">{s.hint}</span>
              </span>
              <span
                className={[
                  'mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  active ? 'border-gold bg-gold' : 'border-muted-foreground/40',
                ].join(' ')}
              >
                {active && <Check className="w-3 h-3 text-primary-foreground" />}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============ Шаг 3 — Доп. элементы ============ */

function StepExtras({
  grouped,
  selected,
  onToggle,
  loading,
  error,
}: {
  grouped: { value: string; label: string; icon: React.ElementType; items: ExtraOpt[] }[];
  selected: string[];
  onToggle: (id: string) => void;
  loading: boolean;
  error: boolean;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 3 из 4"
        title="Дополнительные элементы"
        subtitle="Добавьте свет, декор, буквы или реквизит — цена пересчитывается мгновенно. Элементы берутся из актуальной базы."
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-[56px] rounded-xl" />
          ))}
        </div>
      ) : error ? (
        <div className="mt-5 rounded-2xl border border-coral/40 bg-coral/10 p-5 text-sm">
          <p className="flex items-start gap-2 text-coral">
            <Info className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Не удалось загрузить доп. элементы. Проверьте соединение или продолжите без них —
              менеджер подберёт элементы под ваш запрос после заявки.
            </span>
          </p>
        </div>
      ) : grouped.length === 0 ? (
        <div className="mt-5 rounded-2xl border border-border bg-background p-5 text-sm text-muted-foreground">
          Сейчас нет глобальных доп. элементов в каталоге — менеджер подберёт их под ваш запрос.
        </div>
      ) : (
        <div className="mt-5 space-y-6">
          {grouped.map((g) => (
            <div key={g.value}>
              <h3 className="font-display text-base text-gold mb-3 flex items-center gap-2">
                <g.icon className="w-4 h-4" /> {g.label}
                <Badge variant="outline" className="text-muted-foreground border-border">
                  {g.items.length}
                </Badge>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {g.items.map((e) => {
                  const checked = selected.includes(e.id);
                  return (
                    <label
                      key={e.id}
                      htmlFor={`extra-${e.id}`}
                      className={[
                        'flex items-center gap-3 rounded-xl border p-3.5 cursor-pointer transition-all min-h-[56px]',
                        checked ? 'border-gold bg-gold/10' : 'border-border bg-background hover:border-gold/50',
                      ].join(' ')}
                    >
                      <Checkbox
                        id={`extra-${e.id}`}
                        checked={checked}
                        onCheckedChange={() => onToggle(e.id)}
                      />
                      <span className="flex-1 min-w-0">
                        <span className="block text-sm font-medium leading-tight truncate">
                          {e.name}
                        </span>
                        {e.description && (
                          <span className="block text-xs text-muted-foreground mt-0.5 truncate">
                            {e.description}
                          </span>
                        )}
                      </span>
                      <span className="text-sm text-gold font-semibold whitespace-nowrap shrink-0">
                        +{formatPrice(e.price)}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Шаг 4 — Дата и адрес ============ */

function StepDateAddress({
  date,
  onDate,
  address,
  onAddress,
  isSuburb,
  onSuburb,
  minDate,
}: {
  date: string;
  onDate: (v: string) => void;
  address: string;
  onAddress: (v: string) => void;
  isSuburb: boolean;
  onSuburb: (v: boolean) => void;
  minDate: string;
}) {
  return (
    <div>
      <StepHeader
        eyebrow="Шаг 4 из 4"
        title="Дата и адрес мероприятия"
        subtitle="Логистика влияет на расчёт. Точную цену и наличие подтверждает менеджер по телефону."
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
        <div className="space-y-1.5">
          <Label htmlFor="ctor-date" className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-gold" /> Дата мероприятия
          </Label>
          <Input
            id="ctor-date"
            type="date"
            min={minDate}
            value={date}
            onChange={(e) => onDate(e.target.value)}
            className="h-12"
            suppressHydrationWarning
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="ctor-address" className="flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-gold" /> Адрес (ресторан, лофт, улица)
          </Label>
          <Input
            id="ctor-address"
            value={address}
            onChange={(e) => onAddress(e.target.value)}
            placeholder="г. Красноярск, ул. ..."
            className="h-12"
            autoComplete="street-address"
          />
        </div>
      </div>

      <div className="mt-5 rounded-2xl border border-border bg-background p-4">
        <label htmlFor="ctor-suburb" className="flex items-start gap-3 cursor-pointer">
          <Checkbox
            id="ctor-suburb"
            checked={isSuburb}
            onCheckedChange={(v) => onSuburb(v === true)}
            className="mt-0.5"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-medium">Мероприятие в пригороде</span>
              <Badge variant="outline" className="text-gold border-gold/40">
                +{formatPrice(SITE.suburbSurcharge)}
              </Badge>
            </div>
            <div className="flex items-start gap-1.5 mt-1 text-sm text-muted-foreground">
              <Info className="w-3.5 h-3.5 mt-0.5 text-gold shrink-0" />
              <span>
                Надбавка за доставку за город: {SITE.suburbs.join(', ')}. По городу доставка бесплатна.
              </span>
            </div>
          </div>
        </label>
      </div>

      <div className="mt-5 flex items-center gap-3 text-sm text-muted-foreground">
        <ShieldCheck className="w-4 h-4 text-gold shrink-0" />
        <span>Дата и адрес нужны для расчёта логистики. Точная цена и наличие подтверждаются менеджером.</span>
      </div>
    </div>
  );
}

/* ============ Sticky price summary (desktop) ============ */

function PriceSummary({
  baseOpt,
  styleOpt,
  selectedExtras,
  isSuburb,
  breakdown,
  onOrder,
  loadingElements,
}: {
  baseOpt: DynamicBase | undefined;
  styleOpt: StyleOpt | undefined;
  selectedExtras: ExtraOpt[];
  isSuburb: boolean;
  breakdown: { basePrice: number; styleModifier: number; extrasTotal: number; surcharge: number; total: number };
  onOrder: () => void;
  loadingElements: boolean;
}) {
  return (
    <div className="rounded-3xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-5 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wand2 className="w-5 h-5 text-gold" />
        <h3 className="font-display text-lg">Ваша конфигурация</h3>
      </div>

      <ul className="space-y-2.5 text-sm">
        <SummaryRow
          label="Основа"
          value={baseOpt ? `${baseOpt.label}` : loadingElements ? 'Загрузка…' : '— не выбрана'}
          price={baseOpt ? breakdown.basePrice : undefined}
          muted={!baseOpt}
        />
        <SummaryRow
          label="Стиль"
          value={styleOpt ? styleOpt.label : '— не выбран'}
          price={styleOpt ? (styleOpt.modifier > 0 ? styleOpt.modifier : undefined) : undefined}
          muted={!styleOpt}
        />
        {selectedExtras.length > 0 ? (
          selectedExtras.map((e) => (
            <SummaryRow key={e.id} label={`Доп.: ${e.name}`} price={e.price} />
          ))
        ) : (
          <SummaryRow label="Доп. элементы" value="— не выбраны" muted />
        )}
        {isSuburb && <SummaryRow label="Доставка в пригород" price={breakdown.surcharge} />}
      </ul>

      <div className="border-t border-border mt-4 pt-4 flex items-center justify-between">
        <span className="font-medium">Итого (calc_price)</span>
        <span className="font-display text-2xl text-gold">{formatPrice(breakdown.total)}</span>
      </div>

      <div className="text-xs text-muted-foreground mt-1.5">
        Доставка по городу, монтаж и демонтаж включены
      </div>

      <Button
        onClick={onOrder}
        disabled={!baseOpt}
        className="w-full h-12 mt-4 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
      >
        <Sparkles className="w-4 h-4 mr-1.5" /> Зафиксировать и заказать
      </Button>

      <p className="text-xs text-muted-foreground mt-3 leading-relaxed">
        Расчёт ориентировочный. Точную цену менеджер назовёт по телефону за {SITE.workTimeMin} минут.
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  price,
  muted,
}: {
  label: string;
  value?: string;
  price?: number;
  muted?: boolean;
}) {
  return (
    <li className="flex items-start justify-between gap-3">
      <span className={['min-w-0', muted ? 'text-muted-foreground/70' : 'text-muted-foreground'].join(' ')}>
        <span className="block leading-tight">{label}</span>
        {value && (
          <span className={['block text-xs mt-0.5 truncate', muted ? 'text-muted-foreground/60' : 'text-foreground/80'].join(' ')}>
            {value}
          </span>
        )}
      </span>
      {price != null && (
        <span className="text-foreground font-medium whitespace-nowrap shrink-0">
          +{formatPrice(price)}
        </span>
      )}
    </li>
  );
}

/* ============ Shared header для шагов ============ */

function StepHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle?: string }) {
  return (
    <div>
      <span className="inline-block text-xs font-semibold uppercase tracking-widest text-gold mb-1.5">
        {eyebrow}
      </span>
      <h2 className="font-display text-2xl sm:text-3xl leading-tight">{title}</h2>
      {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
