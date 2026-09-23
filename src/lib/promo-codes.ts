import { db } from './db';
import crypto from 'crypto';

// Генерация кода вида FOTO-XXXXXX (6 случайных символов A-Z0-9)
// ~1.7 млрд комбинаций (32^6), достаточно против брутфорса промокодов.
export function generatePromoCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // без I, O, 0, 1 — чтобы не путать
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[crypto.randomInt(0, chars.length)];
  }
  return `FOTO-${code}`;
}

// Создать уникальный код (с проверкой коллизии)
export async function generateUniquePromoCode(): Promise<string> {
  for (let i = 0; i < 10; i++) {
    const code = generatePromoCode();
    const exists = await db.promoCode.findUnique({ where: { code } });
    if (!exists) return code;
  }
  // fallback с большим суффиксом
  return `FOTO-${crypto.randomBytes(3).toString('hex').toUpperCase()}`;
}

// Выдать промокод лиду (после подтверждения отзыва)
export async function issuePromoCode(leadId: string, opts?: { discountPct?: number; note?: string }): Promise<{ code: string; expiresAt: Date; discountPct: number }> {
  let discountPct = opts?.discountPct ?? 5;
  if (!Number.isFinite(discountPct) || discountPct < 1 || discountPct > 50) {
    throw new Error('discountPct must be between 1 and 50');
  }
  const code = await generateUniquePromoCode();
  const expiresAt = new Date();
  expiresAt.setFullYear(expiresAt.getFullYear() + 1); // +12 месяцев

  await db.promoCode.create({
    data: {
      code,
      discountPct,
      type: 'review',
      leadId,
      singleUse: true,
      transferable: true,
      expiresAt,
      status: 'ACTIVE',
      note: opts?.note || null,
    },
  });

  return { code, expiresAt, discountPct };
}

// Проверить валидность промокода (для формы заявки)
export async function validatePromoCode(code: string): Promise<{ valid: boolean; discountPct?: number; reason?: string; promoCodeId?: string }> {
  const pc = await db.promoCode.findUnique({ where: { code: code.toUpperCase().trim() } });
  if (!pc) return { valid: false, reason: 'Промокод не найден' };
  if (pc.status === 'USED') return { valid: false, reason: 'Промокод уже использован' };
  if (pc.status === 'EXPIRED' || pc.expiresAt < new Date()) return { valid: false, reason: 'Срок действия промокода истёк' };
  return { valid: true, discountPct: pc.discountPct, promoCodeId: pc.id };
}

// Погасить промокод (при подтверждении заявки)
export async function redeemPromoCode(code: string, usedByLeadId: string): Promise<void> {
  await db.promoCode.updateMany({
    where: { code: code.toUpperCase().trim() },
    data: { status: 'USED', usedByLeadId, usedAt: new Date() },
  });
}

// Шаблоны WhatsApp-сообщений
export function waTemplate(scenario: 'day_after' | 'reminder' | 'code_issued' | 'photo_no_review' | 'negative' | 'seasonal_birthday', data: { name: string; photozoneTitle?: string; code?: string; expiresAt?: string; reviewLink?: string; catalogLink?: string; childName?: string; childAge?: string }): string {
  switch (scenario) {
    case 'day_after':
      return `Привет, ${data.name}! Как всё прошло? 🎉\n\nКак фотозона${data.photozoneTitle ? ` «${data.photozoneTitle}»` : ''}, гости оценили?\n\nС маленьким бонусом: оставите отзыв на Яндекс Картах и скинете пару живых фото с праздника — подарим промокод на 5% для следующего заказа. Можно оставить себе или передать другу, действует год.\n\nСсылка на отзыв: ${data.reviewLink || 'https://yandex.ru/maps/org/fotozona24'}\n\nЕсли что-то не понравилось — напишите прямо сюда, разберёмся без отзыва.`;

    case 'reminder':
      return `${data.name}, добрый день! Не хочу доставать, просто напомню про бонус за отзыв — промокод 5% уже ждёт 😊 Одна минута: ${data.reviewLink || 'https://yandex.ru/maps/org/fotozona24'}\n\nИ фото с праздника, если есть — с удовольствием добавим в портфолио (можно без лиц).`;

    case 'code_issued':
      return `${data.name}, спасибо за отзыв — очень приятно! 🙏\n\nВаш промокод: ${data.code}\nСкидка 5% на любой следующий заказ до ${data.expiresAt}.\nЗаказать можно у нас на сайте или просто написав мне сюда — код я приму сам.\n\nP.S. Если друзьям понравилась фотозона — можете подарить им этот код. Скажут спасибо 😊`;

    case 'photo_no_review':
      return `${data.name}, фото супер, спасибо! Уже смотрю, как попасть в портфолио 📸\n\nДля промокода остался отзыв: ${data.reviewLink || 'https://yandex.ru/maps/org/fotozona24'} — минута, и код ваш.`;

    case 'negative':
      return `${data.name}, спасибо, что написали честно — это важно.\n\nРасскажите, что именно не так? Мы вернём деньги за фотозону или переделаем концепцию к вашей следующей съёмке — как вам удобнее.`;

    case 'seasonal_birthday':
      return `Привет, ${data.name}! ${data.childName || 'Вашему ребёнку'} скоро ${data.childAge || 'день рождения'}, да? 🎂 Время летит.\n\nУ вас ещё действует промокод ${data.code} на 5% — если планируете фотозону на день рождения, лучше забронировать заранее: перед летом близнецы-юбилеи разбирают популярные темы.\n\nВот здесь можно посмотреть, что есть: ${data.catalogLink || 'https://fotozona24.ru/katalog'}`;

    default:
      return '';
  }
}
