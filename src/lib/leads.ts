import { db } from './db';
import { notifyNewLead } from './notify';
import { SITE } from './constants';

export type CreateLeadInput = {
  name: string;
  phone: string;
  eventDate: string;
  occasion?: string | null;
  comment?: string | null;
  photozoneId?: string | null;
  source?: string | null;
  sourcePage?: string | null;
  utm?: Record<string, string> | null;
  referrer?: string | null;
  config?: Record<string, unknown> | null;
  priceEstimate?: number | null;
  promoCode?: string | null;
  promoDiscount?: number | null;
};

export async function createLead(input: CreateLeadInput) {
  // если есть промокод — добавляем в config для сохранения
  const config = input.promoCode
    ? { ...(input.config || {}), promoCode: input.promoCode, promoDiscount: input.promoDiscount }
    : input.config;

  const lead = await db.lead.create({
    data: {
      name: input.name,
      phone: input.phone,
      eventDate: input.eventDate,
      occasion: input.occasion ?? null,
      comment: input.comment ?? null,
      photozoneId: input.photozoneId ?? null,
      source: input.source ?? null,
      sourcePage: input.sourcePage ?? null,
      utm: (input.utm ?? null) as any,
      referrer: input.referrer ?? null,
      config: (config ?? null) as any,
      priceEstimate: input.priceEstimate ?? null,
      status: 'NEW',
    },
  });

  // уведомляем менеджера (не блокируем ответ, но ждём — ок для демо)
  const pz = input.photozoneId
    ? await db.photoZone.findUnique({ where: { id: input.photozoneId }, select: { title: true } })
    : null;
  notifyNewLead({
    id: lead.id,
    name: input.name,
    phone: input.phone,
    eventDate: input.eventDate,
    occasion: input.occasion,
    photozoneTitle: pz?.title ?? null,
    comment: input.comment,
    source: input.source,
    priceEstimate: input.priceEstimate,
  }).catch((e) => console.error('notify error', e));

  return lead;
}

// Подбор свободных аналогов для менеджера (по категории/поводу/цене ±20%)
export async function findAlternives(date: string, photozoneId: string) {
  const original = await db.photoZone.findUnique({ where: { id: photozoneId } });
  if (!original) return [];
  const low = Math.round(original.basePrice * 0.8);
  const high = Math.round(original.basePrice * 1.2);

  // занятые на эту дату фотозоны (бронирования + блокировки)
  const [bookings, blocks] = await Promise.all([
    db.booking.findMany({ where: { date, status: 'RESERVED', photozoneId: { not: null } }, select: { photozoneId: true } }),
    db.dateBlock.findMany({ where: { date, photozoneId: { not: null } }, select: { photozoneId: true } }),
  ]);
  const busy = new Set<string>([...bookings.map((b) => b.photozoneId!), ...blocks.map((b) => b.photozoneId!)]);

  const candidates = await db.photoZone.findMany({
    where: {
      isActive: true,
      id: { not: photozoneId },
      OR: [{ category: original.category }, { occasions: { string_contains: JSON.stringify(original.occasions?.[0] ?? '') } }],
      basePrice: { gte: low, lte: high },
    },
    orderBy: { sortOrder: 'asc' },
  });
  return candidates.filter((c) => !busy.has(c.id));
}

// Проверка конфликта бронирования (для админа при CONFIRMED)
export async function hasBookingConflict(date: string, photozoneId: string, excludeBookingId?: string) {
  const where: any = { date, photozoneId, status: 'RESERVED' };
  if (excludeBookingId) where.id = { not: excludeBookingId };
  const booking = await db.booking.findFirst({ where });
  const block = await db.dateBlock.findFirst({ where: { date, photozoneId } });
  return { conflict: !!booking || !!block, booking, block };
}

export { SITE };
