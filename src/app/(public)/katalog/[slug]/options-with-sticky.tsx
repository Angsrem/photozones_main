'use client';

import * as React from 'react';
import { Sparkles, Phone, SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { OptionsSelector, type Option } from './options-selector';
import { useQuickOrder, type QuickOrderPrefill } from '@/components/site/quick-order-store';
import { formatPrice } from '@/lib/format';
import { SITE } from '@/lib/constants';

/**
 * Единый компонент: хранит выбранные опции, рендерит селектор + sticky-бары.
 *
 * Layout:
 *  - Desktop: OptionsSelector в sticky-сайдбаре (top-20) — всегда виден.
 *  - Mobile: OptionsSelector скрыт в Sheet (открывается кнопкой "Показать опции"
 *    из sticky-bar'а снизу).
 *  - Mobile sticky-bar снизу: цена + "Показать опции" + "Заказать".
 *
 * Используется в server-странице карточки фотозоны.
 */
export function OptionsWithStickyBar({
  options,
  basePrice,
  baseTitle,
  orderPrefill,
}: {
  options: Option[];
  basePrice: number;
  baseTitle: string;
  orderPrefill: QuickOrderPrefill;
}) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set());
  const [mobileSheetOpen, setMobileSheetOpen] = React.useState(false);

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

  const handleOrder = () => {
    useQuickOrder.getState().openOrder({
      ...orderPrefill,
      photozonePrice: total,
      priceEstimate: total,
      config: {
        ...(orderPrefill.config || {}),
        selectedOptions: selectedOptions.map((o) => ({
          id: o.id, name: o.name, price: o.price, category: o.category,
        })),
        totalAddons,
        totalPrice: total,
      },
    });
  };

  if (options.length === 0) return null;

  return (
    <>
      {/* ===== Desktop: sticky sidebar с опциями ===== */}
      <div className="hidden lg:block sticky top-20 h-fit">
        <div className="rounded-2xl border border-gold/30 bg-card/60 backdrop-blur supports-[backdrop-filter]:bg-card/50 shadow-xl shadow-black/20 p-5">
          <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border/60">
            <SlidersHorizontal className="w-4 h-4 text-gold" />
            <h2 className="font-display text-lg">Опции</h2>
          </div>
          <OptionsSelector
            options={options}
            basePrice={basePrice}
            baseTitle={baseTitle}
            orderPrefill={orderPrefill}
            _controlledSelected={selectedIds}
            _controlledToggle={toggle}
          />
        </div>
      </div>

      {/* ===== Mobile: sticky-bar снизу + Sheet с опциями ===== */}
      <div className="lg:hidden">
        {/* Sheet с опциями (OptionsSelector имеет собственную кнопку "Заказать" внутри) */}
        <Sheet open={mobileSheetOpen} onOpenChange={setMobileSheetOpen}>
          <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto p-0">
            <SheetHeader className="px-5 pt-5 pb-3 border-b border-border/60">
              <SheetTitle className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-gold" /> Опции
                {selectedIds.size > 0 && (
                  <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1.5 rounded-full bg-gold text-primary-foreground text-xs font-medium">
                    {selectedIds.size}
                  </span>
                )}
              </SheetTitle>
            </SheetHeader>
            <div className="px-5 py-4 pb-8">
              <OptionsSelector
                options={options}
                basePrice={basePrice}
                baseTitle={baseTitle}
                orderPrefill={orderPrefill}
                _controlledSelected={selectedIds}
                _controlledToggle={toggle}
              />
            </div>
          </SheetContent>
        </Sheet>

        {/* Sticky-bar внизу экрана: цена + "Показать опции" + "Заказать" */}
        <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 px-4 py-2.5 pb-[calc(0.625rem+env(safe-area-inset-bottom))]">
          <div className="flex items-center gap-2 max-w-7xl mx-auto">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-muted-foreground truncate">{baseTitle}</div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-display text-lg text-gold font-nums">{formatPrice(total)}</span>
                {totalAddons > 0 && (
                  <span className="text-[10px] text-muted-foreground">+{formatPrice(totalAddons)}</span>
                )}
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="h-12 px-3 shrink-0"
              onClick={() => setMobileSheetOpen(true)}
            >
              <SlidersHorizontal className="w-4 h-4 mr-1.5 text-gold" /> Опции
              {selectedIds.size > 0 && (
                <span className="ml-1 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full bg-gold text-primary-foreground text-xs font-medium">
                  {selectedIds.size}
                </span>
              )}
            </Button>
            <Button
              onClick={handleOrder}
              className="h-12 px-5 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0"
            >
              <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
