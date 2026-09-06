'use client';

import * as React from 'react';
import { Sparkles, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { OptionsSelector, StickyOrderBar, type Option } from './options-selector';
import { useQuickOrder, type QuickOrderPrefill } from '@/components/site/quick-order-store';
import { formatPrice } from '@/lib/format';
import { SITE } from '@/lib/constants';

// Контекст для разделения state между OptionsSelector и sticky-барами
const OptionsContext = React.createContext<{
  selectedIds: Set<string>;
  toggle: (id: string) => void;
} | null>(null);

export function useOptionsState() {
  const ctx = React.useContext(OptionsContext);
  if (!ctx) throw new Error('useOptionsState must be used within OptionsProvider');
  return ctx;
}

// Единый компонент: хранит выбранные опции, рендерит селектор + оба sticky-бара
export function OptionsWithStickyBar({
  options,
  basePrice,
  baseTitle,
  orderPrefill,
  children,
}: {
  options: Option[];
  basePrice: number;
  baseTitle: string;
  orderPrefill: QuickOrderPrefill;
  children?: React.ReactNode; // контент страницы между селектором и мобильным sticky
}) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());

  const toggle = React.useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const selectedOptions = options.filter((o) => selectedIds.has(o.id));
  const totalAddons = selectedOptions.reduce((s, o) => s + o.price, 0);
  const total = basePrice + totalAddons;
  const slimSelected = selectedOptions.map((o) => ({ id: o.id, name: o.name, price: o.price }));

  return (
    <OptionsContext.Provider value={{ selectedIds, toggle }}>
      <OptionsSelector
        options={options}
        basePrice={basePrice}
        baseTitle={baseTitle}
        orderPrefill={orderPrefill}
        _controlledSelected={selectedIds}
        _controlledToggle={toggle}
      />
      {children}
      {/* Десктопный sticky-бар (снизу экрана) */}
      <StickyOrderBar
        basePrice={basePrice}
        baseTitle={baseTitle}
        orderPrefill={orderPrefill}
        selectedOptions={slimSelected}
        totalAddons={totalAddons}
      />
      {/* Мобильный sticky-бар (снизу экрана) */}
      <MobileStickyOrderBar
        total={total}
        basePrice={basePrice}
        totalAddons={totalAddons}
        baseTitle={baseTitle}
        orderPrefill={orderPrefill}
        selectedOptions={selectedOptions}
      />
    </OptionsContext.Provider>
  );
}

function MobileStickyOrderBar({
  total,
  basePrice,
  totalAddons,
  baseTitle,
  orderPrefill,
  selectedOptions,
}: {
  total: number;
  basePrice: number;
  totalAddons: number;
  baseTitle: string;
  orderPrefill: QuickOrderPrefill;
  selectedOptions: Option[];
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const handleOrder = () => {
    openOrder({
      ...orderPrefill,
      photozonePrice: total,
      priceEstimate: total,
      config: {
        ...(orderPrefill.config || {}),
        selectedOptions: selectedOptions.map((o) => ({ id: o.id, name: o.name, price: o.price, category: o.category })),
        totalAddons,
        totalPrice: total,
      },
    });
  };

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
      <div className="flex items-center gap-3 max-w-7xl mx-auto">
        <div className="flex-1 min-w-0">
          <div className="text-xs text-muted-foreground truncate">{baseTitle}</div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-display text-lg text-gold">{formatPrice(total)}</span>
            {totalAddons > 0 && <span className="text-[10px] text-muted-foreground">+{formatPrice(totalAddons)}</span>}
          </div>
        </div>
        <Button
          onClick={handleOrder}
          className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0"
        >
          <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
        </Button>
      </div>
    </div>
  );
}
