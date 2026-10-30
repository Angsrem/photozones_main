'use client';

import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

/**
 * Отслеживание просмотров страниц — отправляет pageview при каждом переходе.
 * Использует sessionId из cookie (генерируется при первом визите).
 */
export function PageViewTracker() {
  const pathname = usePathname();

  useEffect(() => {
    // Получаем или создаём sessionId
    let sessionId = sessionStorage.getItem('fotoarka_session_id');
    if (!sessionId) {
      sessionId = crypto.randomUUID();
      sessionStorage.setItem('fotoarka_session_id', sessionId);
    }

    // Отправляем pageview (fire-and-forget, не блокируем рендер)
    fetch('/api/track', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: pathname,
        referer: document.referrer || null,
        sessionId,
      }),
    }).catch(() => {
      // silent fail — аналитика не должна ломать сайт
    });
  }, [pathname]);

  return null; // невидимый компонент
}
