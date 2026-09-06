import { SITE } from './constants';

// ===== Уведомления менеджеру: Telegram + Email =====
// Если env-ключи не заданы — graceful fallback в лог (для dev/демо).
// Для боевого режима задайте в .env:
//   TELEGRAM_BOT_TOKEN=123456:ABC...        (создать бота через @BotFather)
//   TELEGRAM_MANAGER_CHAT_ID=123456789      (свой chat_id — узнать у @userinfobot)
//   MANAGER_EMAIL=order@fotozona24.ru       (куда дублировать письмом)
//   RESEND_API_KEY=re_...                    (https://resend.com — бесплатно 3000/мес)

function escapeHtml(s: string): string {
  return String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
}

async function sendTelegram(text: string, replyMarkup?: object) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_MANAGER_CHAT_ID;
  if (!token || !chatId) {
    console.log('[notify:telegram] (нет TELEGRAM_BOT_TOKEN/CHAT_ID — fallback в лог) ->\n', text);
    return { ok: false, reason: 'no-credentials' };
  }
  try {
    const body: any = {
      chat_id: chatId,
      text,
      parse_mode: 'HTML',
      disable_web_page_preview: true,
    };
    if (replyMarkup) body.reply_markup = replyMarkup;
    const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok || !data.ok) {
      console.error('[notify:telegram] API error:', JSON.stringify(data).slice(0, 200));
      return { ok: false, reason: 'api-error', data };
    }
    return { ok: true };
  } catch (e: any) {
    console.error('[notify:telegram] network error', e?.message);
    return { ok: false, reason: 'network', error: e?.message };
  }
}

async function sendEmail(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM || `ФотоЗона24 <noreply@${SITE.url.replace('https://', '')}>`;
  if (!apiKey) {
    console.log('[notify:email] (нет RESEND_API_KEY — fallback в лог) ->', to, subject);
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

// occasion → человекочитаемый
const OCCASION_LABEL: Record<string, string> = {
  WEDDING: 'Свадьба',
  BIRTHDAY: 'Детский день рождения',
  BIRTHDAY_ADULT: 'Взрослый ДР / юбилей',
  GRADUATION: 'Выпускной',
  CORPORATE: 'Корпоратив',
  NEW_YEAR: 'Новый год',
  MARCH_8: '8 марта',
  FEB_23: '23 февраля',
  OTHER: 'Другое',
};

function phoneDigits(phone: string): string {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('8')) d = '7' + d.slice(1);
  if (!d.startsWith('7')) d = '7' + d;
  return d;
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
}): Promise<{ telegram: any; emailSent: boolean }> {
  const occasionLabel = data.occasion ? (OCCASION_LABEL[data.occasion] || data.occasion) : null;
  const digits = phoneDigits(data.phone);
  const adminUrl = `${SITE.url}/admin/leads`;

  const lines = [
    '🔔 <b>Новая заявка — ФотоЗона24</b>',
    '',
    `👤 Имя: <b>${escapeHtml(data.name)}</b>`,
    `📞 Телефон: <code>${escapeHtml(data.phone)}</code>`,
    `📅 Желаемая дата: <b>${escapeHtml(data.eventDate)}</b>`,
  ];
  if (occasionLabel) lines.push(`🎉 Повод: ${escapeHtml(occasionLabel)}`);
  if (data.photozoneTitle) lines.push(`🖼 Фотозона: ${escapeHtml(data.photozoneTitle)}`);
  if (data.priceEstimate) lines.push(`💰 Ориентировочно: <b>${data.priceEstimate.toLocaleString('ru-RU')} ₽</b>`);
  if (data.comment) lines.push(`💬 Комментарий: <i>${escapeHtml(data.comment)}</i>`);
  if (data.source) lines.push(`📍 Источник: <code>${escapeHtml(data.source)}</code>`);
  lines.push('', `⚡ Перезвонить за <b>${SITE.workTimeMin} минут</b>!`);

  // Inline-кнопки: позвонить, WhatsApp, открыть в админке
  const replyMarkup = {
    inline_keyboard: [
      [
        { text: '📞 Позвонить', url: `tel:+${digits}` },
        { text: '💬 WhatsApp', url: `https://wa.me/${digits}` },
      ],
      [
        { text: '📋 Открыть в админке', url: adminUrl },
      ],
    ],
  };

  const telegramResult = await sendTelegram(lines.join('\n'), replyMarkup);

  const email = process.env.MANAGER_EMAIL || SITE.email;
  await sendEmail(
    email,
    `🔔 Новая заявка: ${data.name} — ${data.eventDate}`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#faf7f2;padding:24px;border-radius:12px">
      <div style="background:#1a1428;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;text-align:center">
        <h2 style="margin:0;color:#e8c878">🔔 Новая заявка — ФотоЗона24</h2>
      </div>
      <div style="background:#fff;padding:20px;border:1px solid #e5dcc9;border-top:none;border-radius:0 0 8px 8px">
        <table style="width:100%;font-size:15px;line-height:1.6">
          <tr><td style="color:#888;padding:4px 0;width:120px">Имя:</td><td style="font-weight:600">${escapeHtml(data.name)}</td></tr>
          <tr><td style="color:#888;padding:4px 0">Телефон:</td><td><a href="tel:+${digits}" style="color:#b8860b;font-weight:600">${escapeHtml(data.phone)}</a></td></tr>
          <tr><td style="color:#888;padding:4px 0">Дата:</td><td><b>${escapeHtml(data.eventDate)}</b></td></tr>
          ${occasionLabel ? `<tr><td style="color:#888;padding:4px 0">Повод:</td><td>${escapeHtml(occasionLabel)}</td></tr>` : ''}
          ${data.photozoneTitle ? `<tr><td style="color:#888;padding:4px 0">Фотозона:</td><td>${escapeHtml(data.photozoneTitle)}</td></tr>` : ''}
          ${data.priceEstimate ? `<tr><td style="color:#888;padding:4px 0">Ориентировочно:</td><td><b>${data.priceEstimate.toLocaleString('ru-RU')} ₽</b></td></tr>` : ''}
          ${data.comment ? `<tr><td style="color:#888;padding:4px 0;vertical-align:top">Комментарий:</td><td>${escapeHtml(data.comment)}</td></tr>` : ''}
          <tr><td style="color:#888;padding:4px 0">Источник:</td><td><code>${escapeHtml(data.source || '—')}</code></td></tr>
        </table>
        <div style="margin-top:20px;padding:12px;background:#fff4d6;border-radius:6px;text-align:center;color:#8a6600;font-weight:600">
          ⚡ Перезвонить за ${SITE.workTimeMin} минут
        </div>
        <div style="margin-top:16px;text-align:center">
          <a href="tel:+${digits}" style="display:inline-block;padding:10px 20px;background:#b8860b;color:#fff;text-decoration:none;border-radius:6px;margin:0 4px">📞 Позвонить</a>
          <a href="https://wa.me/${digits}" style="display:inline-block;padding:10px 20px;background:#25d366;color:#fff;text-decoration:none;border-radius:6px;margin:0 4px">💬 WhatsApp</a>
          <a href="${adminUrl}" style="display:inline-block;padding:10px 20px;background:#1a1428;color:#fff;text-decoration:none;border-radius:6px;margin:0 4px">📋 В админку</a>
        </div>
      </div>
    </div>`
  );

  return { telegram: telegramResult, emailSent: !!process.env.RESEND_API_KEY };
}

// Статус конфигурации уведомлений (для админки — чтобы видеть, настроено ли)
export function getNotifyConfigStatus() {
  return {
    telegram: {
      configured: !!(process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_MANAGER_CHAT_ID),
      chatId: process.env.TELEGRAM_MANAGER_CHAT_ID ? `…${process.env.TELEGRAM_MANAGER_CHAT_ID.slice(-4)}` : null,
    },
    email: {
      configured: !!process.env.RESEND_API_KEY,
      to: process.env.MANAGER_EMAIL || SITE.email,
    },
  };
}
