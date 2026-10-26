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
        await db.booking.update({ where: { id: existing.id }, data: { photozoneId: pzId, date: lead.eventDate } as any });
      } else {
        await db.booking.create({ data: { leadId: id, photozoneId: pzId, date: lead.eventDate, managerId: session.id } as any });
      }
    }
  }
  if (status === 'DONE') {
    await db.booking.updateMany({ where: { leadId: id }, data: { status: 'DONE' } as any });
  }
  if (status === 'DECLINED' || status === 'CANCELED') {
    await db.booking.updateMany({ where: { leadId: id }, data: { status: 'CANCELED' } as any });
  }

  return NextResponse.json({ ok: true, lead: updated });
}

/** DELETE — массовое удаление заявок.
 * Body: { ids?: string[], status?: string } — либо по списку id, либо все с указанным status.
 * Если пустой body — удалить ВСЕ заявки (с подтверждением на клиенте).
 */
export async function DELETE(req: NextRequest) {
  const session = await guard();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const { ids, status } = body as { ids?: string[]; status?: string };

  let where: any = {};
  if (ids && Array.isArray(ids) && ids.length > 0) {
    where.id = { in: ids };
  } else if (status && status !== 'ALL') {
    where.status = status;
  }
  // Если ни ids, ни status — where пустой → удалит все

  // Сначала удалим связанные бронирования (если есть)
  const leadIds = (await db.lead.findMany({ where, select: { id: true } })).map((l) => l.id);
  if (leadIds.length > 0) {
    await db.booking.deleteMany({ where: { leadId: { in: leadIds } } });
  }
  const result = await db.lead.deleteMany({ where });
  return NextResponse.json({ ok: true, deleted: result.count });
}
