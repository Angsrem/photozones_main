import { NextRequest, NextResponse } from 'next/server';

// Edge-runtime middleware для SSR-защиты /admin/*.
// Повторяет проверку подписанного cookie fz_admin_token (HMAC-SHA256) из src/lib/auth.ts,
// но через Web Crypto API (Edge runtime не поддерживает Node.js crypto).
// Дублирует секрет-резолвер, чтобы не импортировать src/lib/auth.ts (там Node.js crypto).

const COOKIE_NAME = 'fz_admin_token';
const LOGIN_PATH = '/admin/login';
const DEV_FALLBACK_SECRET = 'dev-secret-fotozona24-krsk-sandbox-fallback-32-chars-min';

function resolveSecret(): string | null {
  const raw =
    process.env.ADMIN_JWT_SECRET ||
    (process.env.NODE_ENV === 'production' ? null : DEV_FALLBACK_SECRET);
  if (!raw || raw.length < 32) return null;
  return raw;
}

// ===== Base64url helpers (Edge-safe, без Buffer) =====

function bufToB64url(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let bin = '';
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlToUtf8(str: string): string {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4);
  const bin = atob(padded);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

// ===== Constant-time string compare (Edge не имеет timingSafeEqual) =====

function timingSafeEqualStr(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// ===== Token verification (HMAC-SHA256) =====

async function verifyToken(token: string, secret: string): Promise<boolean> {
  const dot = token.indexOf('.');
  if (dot < 0) return false;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  if (!body || !sig) return false;

  const enc = new TextEncoder();
  let key: CryptoKey;
  let sigBuf: ArrayBuffer;
  try {
    key = await crypto.subtle.importKey(
      'raw',
      enc.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    sigBuf = await crypto.subtle.sign('HMAC', key, enc.encode(body));
  } catch {
    return false;
  }

  const expectedSig = bufToB64url(sigBuf);
  if (!timingSafeEqualStr(expectedSig, sig)) return false;

  // Проверяем exp из тела токена
  try {
    const payload = JSON.parse(b64urlToUtf8(body)) as { exp?: unknown };
    if (typeof payload.exp !== 'number') return false;
    if (payload.exp < Math.floor(Date.now() / 1000)) return false;
  } catch {
    return false;
  }

  return true;
}

// ===== Middleware =====

export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname;

  // Защищаем только /admin/*. Логин-страница свободная.
  if (!path.startsWith('/admin')) return NextResponse.next();
  if (path === LOGIN_PATH) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL(LOGIN_PATH, req.url));

  const secret = resolveSecret();
  if (!secret) {
    // В prod без ADMIN_JWT_SECRET — отказываем в доступе (всегда редирект на логин).
    return NextResponse.redirect(new URL(LOGIN_PATH, req.url));
  }

  const ok = await verifyToken(token, secret);
  if (!ok) return NextResponse.redirect(new URL(LOGIN_PATH, req.url));

  return NextResponse.next();
}

export const config = {
  // Срабатывает на /admin и /admin/**, но middleware-логика сама фильтрует /admin/login.
  matcher: ['/admin/:path*'],
};
