// Shared admin client helpers (типы + API-обёртки)

export type Manager = { id: string; email: string; name: string; role: string };

export type LeadStatus = 'NEW' | 'CALLED' | 'CONFIRMED' | 'DECLINED' | 'DONE';
export type BookingStatus = 'RESERVED' | 'DONE' | 'CANCELED';
export type Category = 'FRAME' | 'PRESSWALL' | 'TEXTILE' | 'THEME';

export type Lead = {
  id: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  phone: string;
  eventDate: string | null;
  email?: string | null;
  occasion?: string | null;
  comment?: string | null;
  source?: string | null;
  sourcePage?: string | null;
  photozoneId?: string | null;
  photozone?: { id?: string; title: string; slug: string; basePrice?: number } | null;
  priceEstimate?: number | null;
  status: LeadStatus;
  managerNote?: string | null;
  manager?: { name: string } | null;
  bookings?: any[];
};

export type PhotoZone = {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: Category;
  occasions: string[];
  basePrice: number;
  sizeW: number | null;
  sizeH: number | null;
  images: string[];
  videos?: string[];
  includes: string[];
  badge: 'HIT' | 'NEW' | null;
  hit: boolean;
  isActive: boolean;
  sortOrder: number;
  _count?: { elements: number };
  elements?: { id: string; name: string; price: number; description?: string | null; image?: string | null; category?: string }[];
  // состав фотозоны из глобальных элементов калькулятора: [{ elementId, qty }]
  composition?: { elementId: string; qty: number }[] | null;
};

export type Booking = {
  id: string;
  date: string;
  status: BookingStatus;
  note?: string | null;
  photozoneId: string | null;
  photozone?: { id: string; title: string } | null;
  lead?: { id: string; name: string; phone: string } | null;
};

export type DateBlock = {
  id: string;
  date: string;
  reason: string | null;
  photozoneId: string | null;
  photozone?: { id: string; title: string } | null;
};

export async function api<T = any>(
  url: string,
  opts: RequestInit = {}
): Promise<T> {
  const res = await fetch(url, {
    ...opts,
    headers: {
      'Content-Type': 'application/json',
      ...(opts.headers || {}),
    },
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const err = new Error((data && (data.error || data.message)) || `HTTP ${res.status}`) as any;
    err.status = res.status;
    err.body = data;
    throw err;
  }
  return data as T;
}

// вытащить только цифры из телефона для wa.me / tel:
export function phoneDigits(phone: string): string {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  return d;
}

export function waLink(phone: string, text?: string): string {
  const d = phoneDigits(phone);
  const t = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${d}${t}`;
}

export function telLink(phone: string): string {
  return `tel:+${phoneDigits(phone)}`;
}

// статус-цвета (для светлой темы — более насыщенные, чем в публичной)
export const LEAD_STATUS_STYLES: Record<LeadStatus, string> = {
  NEW: 'bg-amber-100 text-amber-800 border-amber-300',
  CALLED: 'bg-sky-100 text-sky-800 border-sky-300',
  CONFIRMED: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  DECLINED: 'bg-rose-100 text-rose-800 border-rose-300',
  DONE: 'bg-violet-100 text-violet-800 border-violet-300',
};

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  NEW: 'Новая',
  CALLED: 'Перезвонили',
  CONFIRMED: 'Подтверждена',
  DECLINED: 'Отказ',
  DONE: 'Выполнена',
};

export const CATEGORY_LABEL: Record<Category, string> = {
  FRAME: 'Каркасная',
  PRESSWALL: 'Пресс-волл',
  TEXTILE: 'Текстильная',
  THEME: 'Тематическая',
};

export const BOOKING_STATUS_LABEL: Record<BookingStatus, string> = {
  RESERVED: 'Забронировано',
  DONE: 'Выполнено',
  CANCELED: 'Отменено',
};
