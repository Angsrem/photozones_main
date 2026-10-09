import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasBookingConflict } from '@/lib/leads';

export const runtime = 'nodejs';

// Создание бронирования (из лида) или ручной блокировки даты
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { type } = body; // 'booking' | 'block'

  if (type === 'block') {
    const { date, photozoneId, reason } = body;
    if (!date) return NextResponse.json({ error: 'Укажите дату' }, { status: 422 });
    // уникальная блокировка на дату+фотозону
    const existing = await db.dateBlock.findFirst({ where: { date, photozoneId: photozoneId || null } });
    if (existing) return NextResponse.json({ error: 'Уже заблокировано' }, { status: 409 });
    const block = await db.dateBlock.create({
      data: { date, photozoneId: photozoneId || null, reason: reason || 'service', managerId: session.id },
    });
    return NextResponse.json({ ok: true, block });
  }

  // booking
  const { leadId, photozoneId, date, note } = body;
  if (!photozoneId || !date) return NextResponse.json({ error: 'Укажите фотозону и дату' }, { status: 422 });
  const { conflict } = await hasBookingConflict(date, photozoneId);
  if (conflict) return NextResponse.json({ error: 'Конфликт: фотозона занята или заблокирована' }, { status: 409 });

  const booking = await db.booking.create({
    data: { leadId: leadId || null, photozoneId, date, note, managerId: session.id } as any,
  });
  return NextResponse.json({ ok: true, booking });
}

export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  const type = searchParams.get('type'); // 'booking' | 'block'
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 422 });

  if (type === 'block') {
    await db.dateBlock.delete({ where: { id } }).catch(() => {});
  } else {
    await db.booking.delete({ where: { id } }).catch(() => {});
  }
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { id, status } = body;
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 422 });
  const ALLOWED_BOOKING_STATUSES = ['RESERVED', 'DONE', 'CANCELED'];
  if ('status' in body && !ALLOWED_BOOKING_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Недопустимый статус' }, { status: 422 });
  }
  const updated = await db.booking.update({ where: { id }, data: { status } as any }).catch(() => null);
  return NextResponse.json({ ok: true, booking: updated });
}
