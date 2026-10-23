'use client';

import * as React from 'react';
import Link from 'next/link';
import { X, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

const STORAGE_KEY = 'fotoarka_cookie_consent';
const CONSENT_TTL_DAYS = 365;

/**
 * Плашка согласия на обработку персональных данных (по 152-ФЗ).
 * Показывается при первом визите, после согласия — скрывается на год.
 * Текст: "Продолжая пользоваться сайтом, вы соглашаетесь с обработкой данных
 * в соответствии с ФЗ №152-ФЗ «О персональных данных». [Политика конфиденциальности]"
 */
export function CookieConsent() {
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        // Проверяем срок действия согласия
        if (data?.acceptedAt && (Date.now() - data.acceptedAt < CONSENT_TTL_DAYS * 24 * 60 * 60 * 1000)) {
          return; // согласие ещё действительно
        }
      }
      // Показываем с небольшой задержкой, чтобы не мелькало
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    } catch {
      // localStorage может быть недоступен (приватный режим)
      const t = setTimeout(() => setVisible(true), 600);
      return () => clearTimeout(t);
    }
  }, []);

  const accept = () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ acceptedAt: Date.now() }));
    } catch {
      // игнорируем ошибки localStorage
    }
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Согласие на обработку персональных данных"
      className="fixed inset-x-0 bottom-0 z-[60] px-3 pb-3 sm:px-4 sm:pb-4 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-4xl rounded-xl border border-border/80 bg-background/95 backdrop-blur-md shadow-2xl supports-[backdrop-filter]:bg-background/85">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-3 sm:p-4">
          <div className="shrink-0 hidden sm:block">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gold/15">
              <FileText className="w-5 h-5 text-gold" />
            </div>
          </div>
          <div className="flex-1 min-w-0 text-sm leading-relaxed text-muted-foreground">
            Продолжая пользоваться сайтом, вы соглашаетесь с обработкой данных в соответствии с ФЗ №152-ФЗ «О персональных данных».{' '}
            <Link href="/privacy" className="text-foreground underline underline-offset-2 hover:text-gold transition-colors">
              Политика конфиденциальности
            </Link>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button
              onClick={accept}
              size="sm"
              className="bg-gold text-primary-foreground hover:bg-gold/90 h-9 px-4 font-medium"
            >
              Принять
            </Button>
            <Button
              onClick={() => setVisible(false)}
              size="icon"
              variant="ghost"
              className="size-9 text-muted-foreground hover:text-foreground"
              aria-label="Закрыть"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
