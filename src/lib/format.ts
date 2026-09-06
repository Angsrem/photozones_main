// Утилиты форматирования
export function formatPrice(n: number | null | undefined): string {
  if (n == null) return '—';
  return new Intl.NumberFormat('ru-RU').format(n) + ' ₽';
}

export function formatPriceFrom(n: number | null | undefined): string {
  if (n == null) return 'Цена по запросу';
  return 'от ' + formatPrice(n);
}

// Маска +7 (XXX) XXX-XX-XX
export function formatPhoneInput(raw: string): string {
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('8')) digits = '7' + digits.slice(1);
  if (!digits.startsWith('7')) digits = '7' + digits;
  digits = digits.slice(0, 11);
  const p = digits.slice(1);
  let out = '+7';
  if (p.length > 0) out += ' (' + p.slice(0, 3);
  if (p.length >= 3) out += ') ' + p.slice(3, 6);
  if (p.length >= 6) out += '-' + p.slice(6, 8);
  if (p.length >= 8) out += '-' + p.slice(8, 10);
  return out;
}

export function isPhoneValid(formatted: string): boolean {
  return formatted.replace(/\D/g, '').length === 11;
}

export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

export function addDaysISO(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export function formatDateRu(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });
}

export function formatDateShort(iso: string | undefined | null): string {
  if (!iso) return '—';
  const d = new Date(iso + (iso.length === 10 ? 'T00:00:00' : ''));
  if (isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function pluralize(n: number, forms: [string, string, string]): string {
  const n10 = n % 10;
  const n100 = n % 100;
  if (n10 === 1 && n100 !== 11) return forms[0];
  if (n10 >= 2 && n10 <= 4 && (n100 < 10 || n100 >= 20)) return forms[1];
  return forms[2];
}
