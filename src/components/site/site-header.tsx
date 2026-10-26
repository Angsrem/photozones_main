'use client';

import Link from 'next/link';
import { useState } from 'react';
import { usePathname } from 'next/navigation';
import { Sheet, SheetContent, SheetTrigger, SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Menu, Phone, MessageCircle, Send, Camera } from 'lucide-react';
import { NAV_LINKS, SITE } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { OrderButton } from './quick-order-modal';

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto max-w-7xl px-4">
        <div className="flex h-16 items-center justify-between gap-4">
          {/* Лого */}
          <Link href="/" className="flex items-center gap-2 shrink-0">
            <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gold text-primary-foreground">
              <Camera className="w-5 h-5" />
            </span>
            <span className="font-display text-xl leading-none">
              Foto<span className="text-gold">arka</span>
            </span>
          </Link>

          {/* Десктоп-навигация */}
          <nav className="hidden lg:flex items-center gap-0.5 text-sm">
            {NAV_LINKS.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className={cn(
                  'px-2.5 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors whitespace-nowrap',
                  pathname === l.href && 'text-foreground bg-accent',
                  (l as any).highlight && 'text-gold font-semibold hover:text-gold'
                )}
              >
                {l.label}
              </Link>
            ))}
          </nav>

          {/* Правый блок: телефон + CTA */}
          <div className="flex items-center gap-2 ml-auto">
            <a
              href={`tel:${SITE.phoneRaw}`}
              className="hidden md:flex items-center gap-2 text-sm font-medium hover:text-gold transition-colors whitespace-nowrap"
            >
              <Phone className="w-4 h-4 text-gold shrink-0" />
              <span className="whitespace-nowrap">{SITE.phone}</span>
            </a>
            <OrderButton
              prefill={{ source: 'header', sourcePage: '/' }}
              className="hidden sm:inline-flex bg-gold text-primary-foreground hover:bg-gold/90"
            >
              Заказать
            </OrderButton>

            {/* Мобильное меню */}
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Меню">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[360px]">
                <SheetHeader>
                  <SheetTitle className="font-display text-xl">Меню</SheetTitle>
                </SheetHeader>
                <nav className="flex flex-col gap-1 mt-4">
                  {NAV_LINKS.map((l) => (
                    <SheetClose asChild key={l.href}>
                      <Link
                        href={l.href}
                        className={cn(
                          'px-3 py-3 rounded-md text-base hover:bg-accent transition-colors min-h-[44px] flex items-center',
                          pathname === l.href && 'bg-accent text-foreground',
                          (l as any).highlight && 'text-gold font-semibold'
                        )}
                      >
                        {l.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-6 space-y-3">
                  <a href={`tel:${SITE.phoneRaw}`} className="flex items-center gap-2 px-3 py-2 text-base">
                    <Phone className="w-5 h-5 text-gold" /> {SITE.phone}
                  </a>
                  <div className="flex gap-2 px-3">
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
                        <MessageCircle className="w-4 h-4 mr-1" /> WhatsApp
                      </a>
                    </Button>
                    <Button asChild variant="outline" size="sm" className="flex-1">
                      <a href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener noreferrer">
                        <Send className="w-4 h-4 mr-1" /> Telegram
                      </a>
                    </Button>
                  </div>
                  <OrderButton
                    prefill={{ source: 'mobile-menu' }}
                    className="w-full bg-gold text-primary-foreground hover:bg-gold/90"
                  >
                    Заказать фотозону
                  </OrderButton>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
