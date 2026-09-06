import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { hasBookingConflict } from '@/lib/leads';

export const runtime = 'nodejs';

async function guard() {
  const s = await getSession();
  if (!s) return null;
  return s;
}

export async function GET(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || undefined;
  const q = searchParams.get('q') || undefined;
  const dateFrom = searchParams.get('dateFrom') || undefined;
  const dateTo = searchParams.get('dateTo') || undefined;

  const where: any = {};
  if (status && status !== 'ALL') where.status = status;
  if (q) where.OR = [{ name: { contains: q } }, { phone: { contains: q } }, { comment: { contains: q } }];
  if (dateFrom || dateTo) {
    where.eventDate = {};
    if (dateFrom) where.eventDate.gte = dateFrom;
    if (dateTo) where.eventDate.lte = dateTo;
  }

  const leads = await db.lead.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { photozone: { select: { title: true, slug: true } } },
  });
  return NextResponse.json({ items: leads });
}

export async function PATCH(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { id, status, managerNote, photozoneId } = body;
  if (!id) return NextResponse.json({ error: 'Нет id' }, { status: 422 });

  const lead = await db.lead.findUnique({ where: { id } });
  if (!lead) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });

  const data: any = { managerId: session.id };
  if (status) data.status = status;
  if (managerNote !== undefined) data.managerNote = managerNote;
  if (photozoneId !== undefined) data.photozoneId = photozoneId || null;

  // При подтверждении — создаём бронирование (с проверкой конфликта)
  if (status === 'CONFIRMED' && lead.status !== 'CONFIRMED') {
    const pzId = photozoneId || lead.photozoneId;
    if (!pzId) return NextResponse.json({ error: 'Не указана фотозона для бронирования' }, { status: 422 });
    const { conflict } = await hasBookingConflict(lead.eventDate, pzId);
    if (conflict) {
      return NextResponse.json({ error: 'Конфликт: фотозона уже занята или заблокирована на эту дату' }, { status: 409 });
    }
  }

  const updated = await db.lead.update({ where: { id }, data });

  // создадим/обновим бронирование
  if (status === 'CONFIRMED') {
    const pzId = photozoneId || lead.photozoneId;
    if (pzId) {
      const existing = await db.booking.findFirst({ where: { leadId: id } });
      if (existing) {
        await db.booking.update({ where: { id: existing.id }, data: { photozoneId: pzId, date: lead.eventDate, status: 'RESERVED' } });
      } else {
        await db.booking.create({ data: { leadId: id, photozoneId: pzId, date: lead.eventDate, status: 'RESERVED', managerId: session.id } });
      }
    }
  }
  if (status === 'DONE') {
    await db.booking.updateMany({ where: { leadId: id }, data: { status: 'DONE' } });
  }
  if (status === 'DECLINED' || status === 'CANCELED') {
    await db.booking.updateMany({ where: { leadId: id }, data: { status: 'CANCELED' } });
  }

  return NextResponse.json({ ok: true, lead: updated });
}
