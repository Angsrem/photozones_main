import { NextRequest, NextResponse } from 'next/server';
import { createLead } from '@/lib/leads';
import { rateLimit, getClientIp } from '@/lib/rate-limit';

export const runtime = 'nodejs';

// Нормализация телефона: убираем всё кроме цифр, 8 → 7, 10 цифр без кода → +7.
function normalizePhone(raw: string): string {
  let d = (raw || '').replace(/\D/g, '');
  if (!d) return '';
  // Если начинается с 8 — заменяем на 7 (российский мобильный)
  if (d.startsWith('8')) d = '7' + d.slice(1);
  // 10 цифр без кода страны — добавляем 7 в начало
  if (d.length === 10) d = '7' + d;
  return d;
}

// Парсинг даты: поддерживаем dd.mm.yyyy, dd.mm.yy, yyyy-mm-dd, dd/mm/yyyy.
// Если строка не парсится — сохраняем как есть (например «ближе к выходным»).
function parseEventDate(raw: string): string | null {
  const s = (raw || '').trim();
  if (!s) return null;

  // yyyy-mm-dd
  let m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  if (m) {
    const iso = `${m[1]}-${m[2].padStart(2, '0')}-${m[3].padStart(2, '0')}`;
    const d = new Date(iso + 'T00:00:00');
    if (!isNaN(d.getTime())) return iso;
  }

  // dd.mm.yyyy или dd/mm/yyyy (или dd.mm.yy)
  m = s.match(/^(\d{1,2})[.\/](\d{1,2})[.\/](\d{2,4})$/);
  if (m) {
    let [, dd, mo, yy] = m;
    if (yy.length === 2) yy = '20' + yy;
    const iso = `${yy}-${mo.padStart(2, '0')}-${dd.padStart(2, '0')}`;
    const d = new Date(iso + 'T00:00:00');
    if (!isNaN(d.getTime())) return iso;
  }

  // Иначе — сохраняем как есть (менеджер увидит, что пользователь написал).
  return s.slice(0, 100);
}

export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 10 заявок в минуту на IP — защита от спама лидами.
    const ip = getClientIp(req);
    if (!rateLimit(`leads:${ip}`, 10, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много заявок. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const body = await req.json().catch(() => null);
    if (!body) return NextResponse.json({ error: 'Некорректный запрос' }, { status: 400 });

    // === Телефон (обязательный, минимум 10 цифр) ===
    const phoneRaw = String(body.phone || '').trim();
    const phoneDigits = phoneRaw.replace(/\D/g, '');
    if (phoneDigits.length < 10) {
      return NextResponse.json({ error: 'Введите корректный телефон — минимум 10 цифр' }, { status: 422 });
    }
    const phone = normalizePhone(phoneRaw);

    // === Имя (необязательное) ===
    const name = String(body.name || '').trim() || 'Гость';

    // === Email (необязательный, но если есть — валидируем формат) ===
    const email = String(body.email || '').trim().toLowerCase();
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Некорректный email' }, { status: 422 });
    }

    // === Дата (необязательная) ===
    const eventDate = parseEventDate(body.eventDate);

    // === Комментарий ===
    const comment = body.comment ? String(body.comment).slice(0, 1000) : null;

    const lead = await createLead({
      name,
      phone,
      eventDate,
      email: email || null,
      occasion: body.occasion ?? null,
      comment,
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
