// TOTP (RFC 6238) — упрощённая 2FA для админ-панели.
// HMAC-SHA1, окно 30 секунд, 6 цифр. Секрет хранится в base32 (RFC 4648) для совместимости с Google Authenticator.
// Использует Node.js crypto (API-роуты работают на nodejs-runtime, не на Edge).

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';

const STEP = 30; // секунд
const DIGITS = 6;
const WINDOW = 1; // принимать коды из текущего и ±1 окна (всего до 3 валидных кодов)
const SECRET_BYTES = 20;

const B32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';

// ===== Base32 (RFC 4648) =====

function base32Encode(bytes: Buffer): string {
  let bits = 0;
  let value = 0;
  let out = '';
  for (const b of bytes) {
    value = (value << 8) | b;
    bits += 8;
    while (bits >= 5) {
      out += B32_ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) {
    out += B32_ALPHABET[(value << (5 - bits)) & 31];
  }
  return out;
}

function base32Decode(input: string): Buffer {
  const clean = input.toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const out: number[] = [];
  for (const ch of clean) {
    const idx = B32_ALPHABET.indexOf(ch);
    if (idx < 0) continue;
    value = (value << 5) | idx;
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(out);
}

// ===== API =====

/** Сгенерировать новый случайный секрет (base32, 32 символа = 20 байт энтропии). */
export function generateSecret(): string {
  return base32Encode(randomBytes(SECRET_BYTES));
}

/** Сгенерировать 6-значный TOTP-код для данного времени (по умолчанию сейчас). */
export function generateCode(secret: string, atTimeMs: number = Date.now()): string {
  const counter = Math.floor(atTimeMs / 1000 / STEP);
  const buf = Buffer.alloc(8);
  // 64-bit big-endian counter
  buf.writeBigUInt64BE(BigInt(counter));
  const key = base32Decode(secret);
  const hmac = createHmac('sha1', key).update(buf).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    ((hmac[offset + 1] & 0xff) << 16) |
    ((hmac[offset + 2] & 0xff) << 8) |
    (hmac[offset + 3] & 0xff);
  const code = bin % 10 ** DIGITS;
  return code.toString().padStart(DIGITS, '0');
}

/** Проверить код (±WINDOW временных окон), constant-time compare. */
export function verifyCode(secret: string, code: string, atTimeMs: number = Date.now()): boolean {
  const clean = (code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(clean)) return false;
  const counter = Math.floor(atTimeMs / 1000 / STEP);
  for (let w = -WINDOW; w <= WINDOW; w++) {
    const candidate = generateCode(secret, (counter + w) * STEP * 1000);
    const a = Buffer.from(clean);
    const b = Buffer.from(candidate);
    if (a.length === b.length && timingSafeEqual(a, b)) return true;
  }
  return false;
}

/**
 * OTP-auth URL для QR-кода (на случай если будет QR-библиотека):
 * otpauth://totp/Fotozona24:email?secret=XXX&issuer=Fotozona24&digits=6&period=30
 */
export function otpAuthUrl(secret: string, email: string): string {
  const issuer = 'Fotozona24';
  const label = encodeURIComponent(`${issuer}:${email}`);
  return `otpauth://totp/${label}?secret=${secret}&issuer=${encodeURIComponent(
    issuer,
  )}&digits=${DIGITS}&period=${STEP}`;
}
