'use client';

import * as React from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Sparkles, Clock, ShieldCheck, Phone, Lightbulb, Package, Wand2, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useQuickOrder, type QuickOrderPrefill } from '@/components/site/quick-order-store';
import { formatPrice, formatPriceFrom } from '@/lib/format';
import { SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';

export type Option = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category: string; // letter | decor | prop | lighting | service
};

const CATEGORY_LABELS: Record<string, string> = {
  letter: 'Буквы и цифры',
  decor: 'Декор',
  prop: 'Реквизит',
  lighting: 'Освещение',
  service: 'Доп. услуги',
};

const CATEGORY_ICONS: Record<string, any> = {
  letter: Wand2,
  decor: Package,
  prop: Package,
  lighting: Lightbulb,
  service: Clock,
};

export function OptionsSelector({
  options,
  basePrice,
  baseTitle,
  orderPrefill,
  _controlledSelected,
  _controlledToggle,
}: {
  options: Option[];
  basePrice: number;
  baseTitle: string;
  orderPrefill: QuickOrderPrefill;
  // Контролируемый state (из OptionsWithStickyBar)
  _controlledSelected?: Set<string>;
  _controlledToggle?: (id: string) => void;
}) {
  const [internalSelected, setInternalSelected] = React.useState<Set<string>>(new Set());
  const selected = _controlledSelected ?? internalSelected;
  const toggle = _controlledToggle ?? ((id: string) => {
    setInternalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  });
  const openOrder = useQuickOrder((s) => s.openOrder);

  // Группируем опции по category
  const grouped = React.useMemo(() => {
    const map = new Map<string, Option[]>();
    for (const o of options) {
      const arr = map.get(o.category) || [];
      arr.push(o);
      map.set(o.category, arr);
    }
    return Array.from(map.entries());
  }, [options]);

  const selectedOptions = options.filter((o) => selected.has(o.id));
  const totalAddons = selectedOptions.reduce((s, o) => s + o.price, 0);
  const totalPrice = basePrice + totalAddons;

  const handleOrder = () => {
    openOrder({
      ...orderPrefill,
      photozonePrice: totalPrice,
      priceEstimate: totalPrice,
      config: {
        ...(orderPrefill.config || {}),
        selectedOptions: selectedOptions.map((o) => ({ id: o.id, name: o.name, price: o.price, category: o.category })),
        totalAddons,
        totalPrice,
      },
    });
  };

  if (options.length === 0) return null;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-lg mb-1">Дополнительные опции</h2>
        <p className="text-sm text-muted-foreground">Отметьте нужное — цена пересчитается автоматически</p>
      </div>

      {grouped.map(([category, items]) => {
        const Icon = CATEGORY_ICONS[category] || Package;
        return (
          <div key={category}>
            <div className="flex items-center gap-2 mb-2.5">
              <Icon className="w-4 h-4 text-gold" />
              <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
                {CATEGORY_LABELS[category] || category}
              </h3>
            </div>
            <div className="space-y-2">
              {items.map((o) => {
                const checked = selected.has(o.id);
                return (
                  <label
                    key={o.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all',
                      checked ? 'border-gold bg-gold/5' : 'border-border bg-card/40 hover:border-gold/40'
                    )}
                  >
                    <Checkbox
                      checked={checked}
                      onCheckedChange={() => toggle(o.id)}
                      className="mt-0.5 data-[state=checked]:bg-gold data-[state=checked]:border-gold"
                    />
                    {o.image && (
                      <div className="relative w-14 h-14 rounded-lg overflow-hidden shrink-0 border border-border">
                        <Image src={o.image} alt={o.name} fill sizes="56px" className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-medium leading-tight">{o.name}</span>
                        <span className="text-gold font-semibold whitespace-nowrap text-sm">+{formatPrice(o.price)}</span>
                      </div>
                      {o.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 leading-snug">{o.description}</p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Итоговая цена + кнопка заказа */}
      <div className="rounded-xl border-2 border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-4 sticky top-4">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm text-muted-foreground">Базовая стоимость</span>
          <span className="text-sm">{formatPrice(basePrice)}</span>
        </div>
        {totalAddons > 0 && (
          <>
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-muted-foreground">Доп. опции ({selectedOptions.length})</span>
              <span className="text-sm text-gold">+{formatPrice(totalAddons)}</span>
            </div>
            <Separator className="my-2" />
          </>
        )}
        <div className="flex items-center justify-between mb-3">
          <span className="font-display text-lg">Итого</span>
          <span className="font-display text-2xl text-gold">{formatPrice(totalPrice)}</span>
        </div>
        <Button
          onClick={handleOrder}
          className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
        </Button>
        <div className="flex items-center justify-center gap-3 mt-2 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3 text-gold" /> Перезвон за {SITE.workTimeMin} мин</span>
          <span className="flex items-center gap-1"><ShieldCheck className="w-3 h-3 text-gold" /> Гарантия</span>
        </div>
        <p className="text-xs text-muted-foreground text-center mt-2">
          Доставка и монтаж включены в стоимость
        </p>
      </div>
    </div>
  );
}

// Sticky-панель заказа (всегда видна на десктопе — снизу экрана)
export function StickyOrderBar({
  basePrice,
  baseTitle,
  orderPrefill,
  selectedOptions,
  totalAddons,
}: {
  basePrice: number;
  baseTitle: string;
  orderPrefill: QuickOrderPrefill;
  selectedOptions?: { id: string; name: string; price: number }[];
  totalAddons?: number;
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const total = basePrice + (totalAddons || 0);

  const handleOrder = () => {
    openOrder({
      ...orderPrefill,
      photozonePrice: total,
      priceEstimate: total,
      config: { ...(orderPrefill.config || {}), selectedOptions, totalAddons, totalPrice: total },
    });
  };

  return (
    <div className="hidden lg:flex fixed bottom-0 left-0 right-0 z-30 border-t border-border glass px-4 py-3 items-center gap-4">
      <div className="container mx-auto max-w-7xl flex items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{baseTitle}</div>
          <div className="flex items-baseline gap-2">
            <span className="font-display text-xl text-gold">{formatPrice(total)}</span>
            {totalAddons ? (
              <span className="text-xs text-muted-foreground">база {formatPrice(basePrice)} + опции {formatPrice(totalAddons)}</span>
            ) : (
              <span className="text-xs text-muted-foreground">{formatPriceFrom(basePrice)}</span>
            )}
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="h-11">
          <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-1.5" /> {SITE.phone}</a>
        </Button>
        <Button
          onClick={handleOrder}
          className="h-11 px-8 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
        >
          <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
        </Button>
      </div>
    </div>
  );
}
