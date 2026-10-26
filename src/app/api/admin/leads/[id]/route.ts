import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const lead = await db.lead.findUnique({
    where: { id },
    include: {
      photozone: { select: { id: true, title: true, slug: true, basePrice: true } },
      bookings: { include: { photozone: { select: { title: true } } } },
      manager: { select: { name: true } },
    },
  });
  if (!lead) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json(lead);
}

/** DELETE — удалить одну заявку (только ADMIN). */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  if (session.role !== 'ADMIN') return NextResponse.json({ error: 'Удаление заявок доступно только администратору' }, { status: 403 });

  const { id } = await params;
  const lead = await db.lead.findUnique({ where: { id }, select: { id: true } });
  if (!lead) return NextResponse.json({ error: 'Заявка не найдена' }, { status: 404 });

  // Удаляем связанные бронирования, затем заявку
  await db.booking.deleteMany({ where: { leadId: id } });
  await db.lead.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
