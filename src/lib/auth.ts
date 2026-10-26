import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';
import { cookies } from 'next/headers';

// В production секрет обязательно задаётся через env и должен быть >= 32 символов.
// В dev/sandbox допускается fallback, чтобы локальная разработка не падала.
function resolveSecret(): string {
  const raw =
    process.env.ADMIN_JWT_SECRET ||
    (process.env.NODE_ENV === 'production'
      ? null
      : 'dev-secret-fotoarka-krsk-sandbox-fallback-32-chars-min');
  if (!raw || raw.length < 32) {
    throw new Error('ADMIN_JWT_SECRET must be set and be at least 32 chars long');
  }
  return raw;
}
const SECRET: string = resolveSecret();

const COOKIE_NAME = 'fz_admin_token';
const TOKEN_TTL = 60 * 60 * 24; // 1 день

// ===== Хэширование паролей (scrypt) =====
export function hashPassword(plain: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(plain, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(plain: string, stored: string): boolean {
  try {
    const [scheme, salt, hash] = stored.split('$');
    if (scheme !== 'scrypt' || !salt || !hash) return false;
    const buf = scryptSync(plain, salt, 64);
    const expected = Buffer.from(hash, 'hex');
    if (buf.length !== expected.length) return false;
    return timingSafeEqual(buf, expected);
  } catch {
    return false;
  }
}

// ===== Подписанные токены (HMAC) =====
type TokenPayload = {
  id: string;
  email: string;
  name: string;
  role: string;
  // Аватар (опционально). Относительный путь, например /avatars/{id}.jpg
  avatar?: string | null;
  exp: number;
};

function b64url(s: string | Buffer): string {
  const b = typeof s === 'string' ? Buffer.from(s) : s;
  return b.toString('base64url');
}

export function createToken(payload: Omit<TokenPayload, 'exp'>): string {
  const full: TokenPayload = { ...payload, exp: Math.floor(Date.now() / 1000) + TOKEN_TTL };
  const body = b64url(JSON.stringify(full));
  const sig = createHmac('sha256', SECRET).update(body).digest('base64url');
  return `${body}.${sig}`;
}

export function verifyToken(token: string | undefined | null): TokenPayload | null {
  if (!token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = createHmac('sha256', SECRET).update(body).digest('base64url');
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as TokenPayload;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// ===== Работа с cookie =====
export async function setSessionCookie(payload: Omit<TokenPayload, 'exp'>) {
  const token = createToken(payload);
  const store = await cookies();
  store.set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: TOKEN_TTL,
  });
}

export async function clearSessionCookie() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}

export async function getSession(): Promise<TokenPayload | null> {
  const store = await cookies();
  return verifyToken(store.get(COOKIE_NAME)?.value);
}

export async function requireManager() {
  const s = await getSession();
  if (!s) throw new Error('UNAUTHORIZED');
  return s;
}
