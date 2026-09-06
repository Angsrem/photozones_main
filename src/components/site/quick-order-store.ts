'use client';

import { create } from 'zustand';

export type QuickOrderPrefill = {
  photozoneId?: string;
  photozoneTitle?: string;
  photozoneImage?: string;
  photozonePrice?: number;
  occasion?: string;
  source?: string;
  sourcePage?: string;
  priceEstimate?: number;
  config?: Record<string, unknown>;
};

type QuickOrderState = {
  open: boolean;
  prefill: QuickOrderPrefill;
  openOrder: (prefill?: QuickOrderPrefill) => void;
  close: () => void;
};

export const useQuickOrder = create<QuickOrderState>((set) => ({
  open: false,
  prefill: {},
  openOrder: (prefill = {}) => set({ open: true, prefill }),
  close: () => set({ open: false }),
}));

export function openQuickOrder(prefill?: QuickOrderPrefill) {
  useQuickOrder.getState().openOrder(prefill);
}
