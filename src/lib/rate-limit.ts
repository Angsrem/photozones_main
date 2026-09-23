// In-memory rate limiter (one bucket per key, обычно — IP клиента).
// Не использует внешних зависимостей и подходит для single-instance sandbox/standalone.
// Для multi-instance прод-окружения лучше заменить на Redis-backed limiter.

import type { NextRequest } from 'next/server';

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

// Порог, при превышении которого делается ленивая сборка устаревших бакетов
// (защита от memory-leak при атаке с большого числа уникальных IP).
const CLEANUP_THRESHOLD = 50_000;

/**
 * Проверяет, можно ли выполнить запрос в текущем окне.
 * Возвращает true — запрос разрешён, false — лимит исчерпан.
 */
export function rateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > CLEANUP_THRESHOLD) gc(now);
    return true;
  }
  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/** Ленивая сборка протухших бакетов. */
function gc(now: number) {
  for (const [k, v] of buckets) {
    if (v.resetAt < now) buckets.delete(k);
  }
}

/** Извлекает IP клиента из заголовков прокси (Caddy/nginx). */
export function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) {
    const first = xff.split(',')[0]?.trim();
    if (first) return first;
  }
  return req.headers.get('x-real-ip') || 'unknown';
}
