import { SITE } from './constants';

// ===== Уведомления менеджеру: Telegram + Email =====
// Если env-ключи не заданы — graceful fallback в лог.

async function sendTelegram(text: string) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MANAGER_CHAT_ID;
  if (!token || !chatId) {
    console.log('[notify:telegram] (нет ключей) ->\n', text);
    return;
  }
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error('[notify:telegram] error', e);
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || `ФотоЗона24 <noreply@${SITE.url.replace('https://', '')}>`;
  if (!apiKey) {
    console.log('[notify:email] (нет RESEND_API_KEY) ->', to, subject, '\n', html);
    return;
  }
  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ from, to: [to], subject, html }),
    });
    if (!res.ok) console.error('[notify:email] resend error', await res.text());
  } catch (e) {
    console.error('[notify:email] error', e);
  }
}

export async function notifyNewLead(data: {
  name: string;
  phone: string;
  eventDate: string;
  occasion?: string | null;
  photozoneTitle?: string | null;
  comment?: string | null;
  source?: string | null;
  priceEstimate?: number | null;
  id: string;
}) {
  const lines = [
    '🔔 <b>Новая заявка — ФотоЗона24</b>',
    '',
    `👤 Имя: <b>${data.name}</b>`,
    `📞 Телефон: <code>${data.phone}</code>`,
    `📅 Желаемая дата: <b>${data.eventDate}</b>`,
  ];
  if (data.occasion) lines.push(`🎉 Повод: ${data.occasion}`);
  if (data.photozoneTitle) lines.push(`🖼 Фотозона: ${data.photozoneTitle}`);
  if (data.priceEstimate) lines.push(`💰 Ориентировочно: ${data.priceEstimate} ₽`);
  if (data.comment) lines.push(`💬 Комментарий: ${data.comment}`);
  if (data.source) lines.push(`📍 Источник: ${data.source}`);
  lines.push('', `⚡ Перезвонить за ${SITE.workTimeMin} мин!`);

  await sendTelegram(lines.join('\n'));

  const email = process.env.MANAGER_EMAIL || SITE.email;
  await sendEmail(
    email,
    `Новая заявка: ${data.name} — ${data.eventDate}`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto">
      <h2 style="color:#b8860b">Новая заявка — ФотоЗона24</h2>
      <p><b>Имя:</b> ${data.name}</p>
      <p><b>Телефон:</b> <a href="tel:${data.phone}">${data.phone}</a></p>
      <p><b>Дата:</b> ${data.eventDate}</p>
      ${data.occasion ? `<p><b>Повод:</b> ${data.occasion}</p>` : ''}
      ${data.photozoneTitle ? `<p><b>Фотозона:</b> ${data.photozoneTitle}</p>` : ''}
      ${data.priceEstimate ? `<p><b>Ориентировочно:</b> ${data.priceEstimate} ₽</p>` : ''}
      ${data.comment ? `<p><b>Комментарий:</b> ${data.comment}</p>` : ''}
      <p><b>Источник:</b> ${data.source || '—'}</p>
      <hr><p style="color:#888">Перезвонить за ${SITE.workTimeMin} минут.</p>
    </div>`
  );
}
