'use client';

import { usePathname } from 'next/navigation';
import { Phone, MessageCircle, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SITE } from '@/lib/constants';
import { useQuickOrder } from './quick-order-store';

export function StickyCta() {
  const pathname = usePathname();
  const openOrder = useQuickOrder((s) => s.openOrder);

  // не показываем: админка, страница спасибо, страница квиза/подборки (там свой CTA)
  // и карточка фотозоны (там свой локальный order-bar с ценой — не дублируем)
  if (
    pathname?.startsWith('/admin') ||
    pathname === '/spasibo' ||
    pathname === '/kviz' ||
    pathname?.startsWith('/podborka/')
  ) return null;

  // На карточке фотозоны (/katalog/[slug]) — есть локальный sticky order-bar,
  // глобальный sticky-bar скрываем, но плавающие мессенджеры оставляем
  const isPhotozoneCard = !!pathname?.match(/^\/katalog\/[^/]+$/);

  return (
    <>
      {/* Плавающие кнопки мессенджеров (десктоп + моб) */}
      {/* На мобильном поднимаем выше, чтобы не перекрывать sticky-CTA-бар */}
      <div className={`fixed right-4 z-30 flex flex-col gap-2 ${isPhotozoneCard ? 'bottom-[88px] sm:bottom-6' : 'bottom-[88px] sm:bottom-6'}`}>
        <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer"
          aria-label="WhatsApp"
          className="w-12 h-12 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <MessageCircle className="w-5 h-5" />
        </a>
        <a href={`tel:${SITE.phoneRaw}`} aria-label="Позвонить"
          className="w-12 h-12 rounded-full bg-gold text-primary-foreground flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
          <Phone className="w-5 h-5" />
        </a>
      </div>

      {/* Sticky-бар CTA на мобильных — не показываем на карточке фотозоны (там свой) */}
      {!isPhotozoneCard && (
        <div className="sm:hidden fixed bottom-0 inset-x-0 z-30 border-t border-border glass px-3 py-2 flex items-center gap-2"
          style={{ paddingBottom: 'max(0.5rem, env(safe-area-inset-bottom))' }}>
          <a href={`tel:${SITE.phoneRaw}`} aria-label="Позвонить"
            className="h-12 w-12 shrink-0 rounded-lg border border-border flex items-center justify-center">
            <Phone className="w-5 h-5 text-gold" />
          </a>
          <Button
            onClick={() => openOrder({ source: 'sticky-cta', sourcePage: pathname || '/' })}
            className="flex-1 h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold"
          >
            <Sparkles className="w-4 h-4 mr-1.5" /> Заказать фотозону
          </Button>
        </div>
      )}
    </>
  );
}
