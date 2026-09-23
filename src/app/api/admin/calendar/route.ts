import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { findAlternives } from '@/lib/leads';

export const runtime = 'nodejs';

function isValidDate(str: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());
}
function isValidMonth(str: string): boolean {
  return /^\d{4}-\d{2}$/.test(str);
}

// Данные календаря занятости за месяц + подбор аналогов
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const month = searchParams.get('month'); // YYYY-MM
  const date = searchParams.get('date'); // конкретный день для деталей
  const alternativesFor = searchParams.get('alternativesFor'); // photozoneId для подбора аналогов на date

  // Подбор аналогов
  if (alternativesFor && date) {
    if (!isValidDate(date)) return NextResponse.json({ error: 'Некорректная дата' }, { status: 422 });
    try {
      const alts = await findAlternives(date, alternativesFor);
      return NextResponse.json({ items: alts });
    } catch (e) {
      console.error('[calendar] alternatives error', e);
      return NextResponse.json({ error: 'Ошибка подбора аналогов' }, { status: 500 });
    }
  }

  // Детали по конкретному дню
  if (date) {
    if (!isValidDate(date)) return NextResponse.json({ error: 'Некорректная дата' }, { status: 422 });
    try {
      const [leads, bookings, blocks] = await Promise.all([
        db.lead.findMany({
          where: { eventDate: date },
          orderBy: { createdAt: 'desc' },
          include: { photozone: { select: { id: true, title: true, slug: true } } },
        }),
        db.booking.findMany({
          where: { date },
          include: { photozone: { select: { id: true, title: true } }, lead: { select: { id: true, name: true, phone: true } } },
        }),
        db.dateBlock.findMany({ where: { date }, include: { photozone: { select: { id: true, title: true } } } }),
      ]);
      return NextResponse.json({ leads, bookings, blocks });
    } catch (e) {
      console.error('[calendar] day details error', e);
      return NextResponse.json({ error: 'Ошибка получения деталей' }, { status: 500 });
    }
  }

  // Месячная сетка
  if (!month) return NextResponse.json({ error: 'Укажите month=YYYY-MM' }, { status: 422 });
  if (!isValidMonth(month)) return NextResponse.json({ error: 'Некорректный месяц' }, { status: 422 });
  try {
    const [y, m] = month.split('-').map(Number);
    const start = new Date(y, m - 1, 1);
    const end = new Date(y, m, 0, 23, 59, 59);
    const startStr = start.toISOString().slice(0, 10);
    const endStr = end.toISOString().slice(0, 10);

    const [bookings, blocks, leads] = await Promise.all([
      db.booking.findMany({
        where: { date: { gte: startStr, lte: endStr } },
        include: { photozone: { select: { id: true, title: true } }, lead: { select: { id: true, name: true, phone: true } } },
      }),
      db.dateBlock.findMany({
        where: { date: { gte: startStr, lte: endStr } },
        include: { photozone: { select: { id: true, title: true } } },
      }),
      db.lead.findMany({
        where: { eventDate: { gte: startStr, lte: endStr } },
        include: { photozone: { select: { id: true, title: true } } },
      }),
    ]);

    // карта по дням
    const byDay: Record<string, { bookings: any[]; blocks: any[]; leads: any[] }> = {};
    for (const b of bookings) {
      (byDay[b.date] ??= { bookings: [], blocks: [], leads: [] }).bookings.push(b);
    }
    for (const b of blocks) {
      (byDay[b.date] ??= { bookings: [], blocks: [], leads: [] }).blocks.push(b);
    }
    for (const l of leads) {
      (byDay[l.eventDate] ??= { bookings: [], blocks: [], leads: [] }).leads.push(l);
    }
    return NextResponse.json({ month, byDay });
  } catch (e) {
    console.error('[calendar] month grid error', e);
    return NextResponse.json({ error: 'Ошибка получения сетки месяца' }, { status: 500 });
  }
}
