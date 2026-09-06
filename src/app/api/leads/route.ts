import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';
import { isPhoneValid } from '@/lib/format';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });

    const name = String(body.name || '').trim();
    const phone = String(body.phone || '').trim();
    const eventDate = String(body.eventDate || '').trim();

    if (!name) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
    if (!isPhoneValid(phone)) return NextResponse.json({ error: 'Введите корректный телефон' }, { status: 422 });
    if (!eventDate) return NextResponse.json({ error: 'Укажите желаемую дату' }, { status: 422 });

    const d = new Date(eventDate);
    if (isNaN(d.getTime())) return NextResponse.json({ error: 'Некорректная дата' }, { status: 422 });

    const lead = await createLead({
      name,
      phone,
      eventDate: eventDate.slice(0, 10),
      occasion: body.occasion ?? null,
      comment: body.comment ? String(body.comment).slice(0, 1000) : null,
      photozoneId: body.photozoneId ?? null,
      source: body.source ?? null,
      sourcePage: body.sourcePage ?? null,
      utm: body.utm ?? null,
      referrer: body.referrer ?? null,
      config: body.config ?? null,
      priceEstimate: typeof body.priceEstimate === 'number' ? body.priceEstimate : null,
      // промокод
      promoCode: body.promoCode ? String(body.promoCode).toUpperCase().trim() : null,
      promoDiscount: typeof body.promoDiscount === 'number' ? body.promoDiscount : null,
    });

    return NextResponse.json({ ok: true, id: lead.id }, { status: 201 });
  } catch (e: any) {
    console.error('[POST /api/leads] error', e);
    return NextResponse.json({ error: 'Внутренняя ошибка сервера' }, { status: 500 });
  }
}
