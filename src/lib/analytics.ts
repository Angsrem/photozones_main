// Аналитика — отправка событий в dataLayer (Яндекс.Метрика/GTM/VK Pixel)
// Все события идут через window.dataLayer — менеджер тегов сам решает, куда отправлять.
// Без GTM события просто логируются в консоли (dev-режим).

export type AnalyticsEvent =
  | { event: 'quiz_start'; source: string }
  | { event: 'quiz_step'; step: number; source: string }
  | { event: 'quiz_result_viewed'; sessionId: string; source: string }
  | { event: 'quiz_card_click'; cardId: string; role: 'economy' | 'hit' | 'premium'; sessionId: string }
  | { event: 'quiz_saved'; sessionId: string; channel: 'email' | 'whatsapp' | 'telegram' | 'link' }
  | { event: 'quiz_abandoned'; step: number; source: string }
  | { event: 'calculator_completed'; priceEstimate: number }
  | { event: 'card_viewed'; slug: string }
  | { event: 'order_opened'; source: string }
  | { event: 'order_submitted'; source: string; photozoneId?: string }
  | { event: 'promo_viewed'; title: string; page: string };

export function track(event: AnalyticsEvent): void {
  if (typeof window === 'undefined') return;
  const w = window as any;
  w.dataLayer = w.dataLayer || [];
  w.dataLayer.push(event);
  // Яндекс.Метрика (если установлен)
  if (typeof w.ym === 'function' && process.env.NEXT_PUBLIC_YM_ID) {
    try {
      w.ym(Number(process.env.NEXT_PUBLIC_YM_ID), 'reachGoal', event.event, event as any);
    } catch {}
  }
  // dev-лог
  if (process.env.NODE_ENV !== 'production') {
    console.log('[analytics]', event);
  }
}
