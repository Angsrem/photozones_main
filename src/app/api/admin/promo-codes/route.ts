import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { issuePromoCode } from '@/lib/promo-codes';

export const runtime = 'nodejs';

// POST — выдать промокод лиду
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { leadId, discountPct, note } = body;
  if (!leadId) return NextResponse.json({ error: 'Укажите leadId' }, { status: 422 });

  const lead = await db.lead.findUnique({ where: { id: leadId } });
  if (!lead) return NextResponse.json({ error: 'Лид не найден' }, { status: 404 });

  const result = await issuePromoCode(leadId, { discountPct, note });
  return NextResponse.json({ ok: true, ...result });
}

// GET — список всех промокодов (для аналитики)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const items = await db.promoCode.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200,
    include: { lead: { select: { id: true, name: true, phone: true } } },
  });
  return NextResponse.json({ items });
}
