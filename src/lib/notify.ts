import { SITE } from './constants';
import { db } from './db';

// ===== Уведомления менеджеру: Telegram + Max + Email =====
// Если env-ключи не заданы — graceful fallback в лог (для dev/демо).
// Для боевого режима задайте в .env:
//   TELEGRAM_BOT_TOKEN=123456:ABC...        (создать бота через @BotFather)
//   TELEGRAM_MANAGER_CHAT_ID=123456789      (свой chat_id — узнать у @userinfobot)
//   MAX_BOT_TOKEN=1001.ABC...               (создать бота через @masterbot в Max)
//   MAX_CHAT_ID=1234567890                  (ID канала в Max)
//   MANAGER_EMAIL=order@fotoarka.ru         (fallback — куда дублировать письмом)
//
// ===== Email через Beget SMTP (Nodemailer) =====
// Beget: https://beget.com — российский хостинг, почта работает в РФ без блокировок.
// Настройки SMTP задаются в .env:
//   SMTP_HOST=smtp.beget.com (или smtp.beget.ru)
//   SMTP_PORT=465 (SSL) или 587 (STARTTLS)
//   SMTP_USER=order@fotoarka.ru
//   SMTP_PASSWORD=********
//   SMTP_FROM="Fotoarka <order@fotoarka.ru>"
//
// Список получателей email-уведомлений хранится в БД (Setting с ключом notify_emails,
// JSON-массив адресов). Управляется через админку (/admin/settings).
// Если в БД пусто — fallback на process.env.MANAGER_EMAIL.

const NOTIFY_EMAILS_KEY = 'notify_emails';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Получаем список адресов для уведомлений из БД (Setting.notify_emails). */
export async function getNotifyEmails(): Promise<string[]> {
  try {
    const row = await db.setting.findUnique({ where: { key: NOTIFY_EMAILS_KEY } });
    if (row?.value) {
      try {
        const parsed = JSON.parse(row.value);
        if (Array.isArray(parsed)) {
          const list = parsed
            .map((x: unknown) => String(x || '').trim().toLowerCase())
            .filter((x: string) => EMAIL_RE.test(x));
          if (list.length > 0) return Array.from(new Set(list));
        }
      } catch {
        // некорректный JSON — fallback ниже
      }
    }
  } catch (e) {
    // БД может быть недоступна — fallback ниже
    console.warn('[notify:emails] не удалось прочитать Setting.notify_emails', (e as Error)?.message);
  }
  // Fallback на env
  const envList = (process.env.MANAGER_EMAIL || SITE.email)
    .split(',')
    .map((x) => x.trim().toLowerCase())
    .filter((x) => EMAIL_RE.test(x));
  return Array.from(new Set(envList));
}

/** Проверка, что SMTP-настройки заданы в .env. */
export function isSmtpConfigured(): boolean {
  return !!(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASSWORD);
}

function escapeHtml(s: string): string {
  return String(s || '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]!));
}

// ===== Max (VK Teams) API =====
// Max — российский мессенджер от VK, API работает в РФ без блокировок.
// Документация: https://dev.max.ru
async function sendMax(text: string) {
  const token = process.env.MAX_BOT_TOKEN;
  const chatId = process.env.MAX_CHAT_ID;
  if (!token || !chatId) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notify:max] (нет MAX_BOT_TOKEN/MAX_CHAT_ID — fallback в лог) ->\n', text);
    }
    return { ok: false, reason: 'no-credentials' };
  }
  try {
    // Max API: отправка текстового сообщения в чат/канал
    // Сначала получаем URI для загрузки (не нужно для текста), сразу шлём сообщение
    const res = await fetch(`https://botapi.max.ru/messages?access_token=${token}&chat_id=${chatId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        format: 'html',
      }),
    });
    const data = await res.json();
    if (!res.ok || data.code !== 'ok') {
      console.error('[notify:max] API error:', JSON.stringify(data).slice(0, 200));
      return { ok: false, reason: 'api-error', data };
    }
    return { ok: true };
  } catch (e: any) {
    console.error('[notify:max] network error', e?.message);
    return { ok: false, reason: 'network', error: e?.message };
  }
}

// Получаем список chat_id для отправки уведомлений.
// Поддержка нескольких менеджеров: можно указать один или несколько через запятую или 2 отдельных env.
// Приоритет: TELEMER_CHAT_ID (новый формат, поддержка нескольких через запятую)
//            TELEGRAM_MANAGER_CHAT_ID (старый формат, для обратной совместимости)
//            TELEMER_CHAT_ID_2 (опционально — второй менеджер)
function getChatIds(): string[] {
  const ids: string[] = [];
  // Новый формат: один или несколько через запятую
  const main = process.env.TELEMER_CHAT_ID || process.env.TELEGRAM_MANAGER_CHAT_ID;
  if (main) {
    for (const id of main.split(',')) {
      const trimmed = id.trim();
      if (trimmed) ids.push(trimmed);
    }
  }
  // Второй менеджер (опционально)
  const second = process.env.TELEMER_CHAT_ID_2;
  if (second) {
    for (const id of second.split(',')) {
      const trimmed = id.trim();
      if (trimmed && !ids.includes(trimmed)) ids.push(trimmed);
    }
  }
  return ids;
}

async function sendTelegram(text: string, replyMarkup?: object) {
  const token = process.env.TELEMER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getChatIds();
  // Прокси для обхода блокировки api.telegram.org в РФ.
  // По умолчанию — напрямую. Для прода в РФ задайте TELEGRAM_API_BASE (например, Cloudflare Worker URL).
  const apiBase = process.env.TELEGRAM_API_BASE || 'https://api.telegram.org';
  if (!token || chatIds.length === 0) {
    // Полный текст уведомления печатаем только в dev — в prod это утечка PII.
    if (process.env.NODE_ENV !== 'production') {
      console.log('[notify:telegram] (нет TELEGRAM_BOT_TOKEN/CHAT_ID — fallback в лог) ->\n', text);
    } else {
      console.warn('[notify:telegram] нет TELEGRAM_BOT_TOKEN/CHAT_ID — уведомление не отправлено');
    }
    return { ok: false, reason: 'no-credentials' };
  }
  // Отправляем каждому менеджеру. Если хотя бы один получит — ок.
  const results = await Promise.all(chatIds.map(async (chatId) => {
    try {
      const body: any = {
        chat_id: chatId,
        text,
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      };
      if (replyMarkup) body.reply_markup = replyMarkup;
      const res = await fetch(`${apiBase}/bot${token}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        console.error(`[notify:telegram] API error (chat_id=${chatId}):`, JSON.stringify(data).slice(0, 200));
        return { ok: false, chatId };
      }
      return { ok: true, chatId };
    } catch (e: any) {
      console.error(`[notify:telegram] network error (chat_id=${chatId})`, e?.message);
      return { ok: false, chatId };
    }
  }));
  const anyOk = results.some(r => r.ok);
  return { ok: anyOk, results };
}

let nodemailerPromise: Promise<typeof import('nodemailer')> | null = null;
async function getNodemailer() {
  if (!nodemailerPromise) {
    nodemailerPromise = import('nodemailer');
  }
  return nodemailerPromise;
}

/**
 * Базовая отправка email через Beget SMTP (Nodemailer).
 * Если SMTP не настроен — лог + не падаем (graceful).
 */
async function sendMailSmtp(recipients: string[], subject: string, html: string): Promise<boolean> {
  if (!isSmtpConfigured()) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[notify:email] SMTP не настроен — добавьте SMTP_HOST/SMTP_USER/SMTP_PASSWORD в .env. Письмо не отправлено.');
    } else {
      console.warn('[notify:email] SMTP не настроен — письмо не отправлено');
    }
    return false;
  }
  if (recipients.length === 0) {
    console.warn('[notify:email] нет получателей');
    return false;
  }

  const host = process.env.SMTP_HOST!;
  const portRaw = Number(process.env.SMTP_PORT) || 465;
  const user = process.env.SMTP_USER!;
  const pass = process.env.SMTP_PASSWORD!;
  const from = process.env.SMTP_FROM || `Fotoarka <${user}>`;

  // 465 → SSL, 587 → STARTTLS (по конвенции Beget).
  const useSsl = portRaw === 465;

  try {
    const nm = await getNodemailer();
    const transporter = nm.createTransport({
      host,
      port: portRaw,
      secure: useSsl,
      requireTLS: !useSsl,
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from,
      to: recipients.join(', '),
      subject,
      html,
    });

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[notify:email] → ${recipients.join(', ')} | id=${info.messageId}`);
    }
    return true;
  } catch (e: any) {
    console.error('[notify:email] SMTP error', e?.message || e);
    return false;
  }
}

/**
 * Отправка email-уведомления менеджерам (о новой заявке).
 * Получателей берёт из БД (Setting.notify_emails), fallback на env MANAGER_EMAIL.
 */
async function sendEmail(subject: string, html: string): Promise<boolean> {
  const recipients = await getNotifyEmails();
  if (recipients.length === 0) {
    console.warn('[notify:email] нет получателей (ни в БД, ни в MANAGER_EMAIL)');
    return false;
  }
  return sendMailSmtp(recipients, subject, html);
}

/**
 * Отправка email конкретному адресату (клиенту — дожим-цепочка лид-магнитов).
 */
async function sendEmailTo(to: string, subject: string, html: string): Promise<boolean> {
  const list = to.split(',').map((x) => x.trim()).filter(Boolean);
  return sendMailSmtp(list, subject, html);
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
    '🔔 <b>Новая заявка — Fotoarka</b>',
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
  // Также отправляем в Max (если настроен) — Max работает в РФ без блокировок
  const maxResult = await sendMax(lines.join('\n'));

  const emailSent = await sendEmail(
    `🔔 Новая заявка: ${data.name} — ${data.eventDate}`,
    `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#faf7f2;padding:24px;border-radius:12px">
      <div style="background:#1a1428;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;text-align:center">
        <h2 style="margin:0;color:#e8c878">🔔 Новая заявка — Fotoarka</h2>
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

  return { telegram: telegramResult, max: maxResult, emailSent };
}

// ===== Дожим-цепочка для лид-магнитов (3 касания) =====
// Пока функции-заготовки без cron — для демо и ручного вызова.
// Шаг 1 (сразу): PDF + промокод QUIZ5
// Шаг 2 (+2 дня): «Успеем рассчитать под вашу дату»
// Шаг 3 (+5 дней): «Промокод истекает завтра»
//
// Тексты писем — человекочитаемые HTML (через sendEmail, определённую выше).
// Если RESEND_API_KEY не задан — письмо не отправляется (fallback в лог в dev).

const DRIP_TEMPLATES: Record<
  number,
  { subject: (title: string) => string; body: (name: string, magnetTitle: string, fileUrl: string) => string }
> = {
  1: {
    subject: (title) => `Ваш PDF «${title}» + промокод QUIZ5`,
    body: (name, magnetTitle, fileUrl) => `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#faf7f2;padding:24px;border-radius:12px">
        <div style="background:#1a1428;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="margin:0;color:#e8c878">🎁 Ваш гайд готов, ${escapeHtml(name)}!</h2>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #e5dcc9;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6">
            Спасибо за интерес к Fotoarka! Вы запросили гайд
            <b>«${escapeHtml(magnetTitle)}»</b>.
            Скачать PDF можно по кнопке ниже.
          </p>
          <div style="text-align:center;margin:20px 0">
            <a href="${SITE.url}${fileUrl}" style="display:inline-block;padding:12px 28px;background:#b8860b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">⬇ Скачать PDF</a>
          </div>
          <div style="padding:14px;background:#fff4d6;border-radius:6px;text-align:center;color:#8a6600;font-weight:600">
            🎟 Промокод <code style="background:#fff;padding:2px 6px;border-radius:4px">QUIZ5</code> — скидка 5% на любой заказ.
            Действует 5 дней.
          </div>
          <p style="margin:16px 0 0;font-size:13px;color:#888;line-height:1.5">
            Менеджер перезвонит в течение 15 минут, чтобы помочь с выбором фотозоны под вашу дату.
            Или позвоните нам: <a href="tel:${SITE.phoneRaw}" style="color:#b8860b">${SITE.phone}</a>.
          </p>
        </div>
      </div>`,
  },
  2: {
    subject: (title) => `Успеем рассчитать фотозону под вашу дату (${title})`,
    body: (name, magnetTitle) => `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#faf7f2;padding:24px;border-radius:12px">
        <div style="background:#1a1428;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="margin:0;color:#e8c878">⏰ Успеем рассчитать под вашу дату</h2>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #e5dcc9;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6">
            ${escapeHtml(name)}, вы скачали гайд <b>«${escapeHtml(magnetTitle)}»</b> пару дней назад.
            Подскажите дату мероприятия — менеджер за 15 минут подберёт 2–3 варианта фотозоны под бюджет
            и проверит наличие.
          </p>
          <div style="text-align:center;margin:20px 0">
            <a href="${SITE.url}/kalkulyator" style="display:inline-block;padding:12px 28px;background:#b8860b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">📐 Открыть калькулятор</a>
            <a href="${SITE.url}/katalog" style="display:inline-block;padding:12px 28px;background:#1a1428;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-left:8px">📋 В каталог</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;color:#888;line-height:1.5">
            Промокод <code style="background:#fff4d6;padding:2px 6px;border-radius:4px">QUIZ5</code> ещё действует — скидка 5%.
          </p>
        </div>
      </div>`,
  },
  3: {
    subject: (title) => `Промокод QUIZ5 истекает завтра — успейте заказать (${title})`,
    body: (name, magnetTitle) => `
      <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;background:#faf7f2;padding:24px;border-radius:12px">
        <div style="background:#7f1d1d;color:#fff;padding:16px 20px;border-radius:8px 8px 0 0;text-align:center">
          <h2 style="margin:0;color:#fcd34d">⏳ Завтра истекает промокод</h2>
        </div>
        <div style="background:#fff;padding:20px;border:1px solid #e5dcc9;border-top:none;border-radius:0 0 8px 8px">
          <p style="margin:0 0 12px;font-size:15px;line-height:1.6">
            ${escapeHtml(name)}, промокод <code style="background:#fff4d6;padding:2px 6px;border-radius:4px">QUIZ5</code>
            на скидку 5% перестанет действовать <b>завтра</b>. Вы скачивали гайд
            <b>«${escapeHtml(magnetTitle)}»</b> — мы хотим, чтобы успели воспользоваться скидкой.
          </p>
          <div style="text-align:center;margin:20px 0">
            <a href="${SITE.url}/katalog" style="display:inline-block;padding:12px 28px;background:#b8860b;color:#fff;text-decoration:none;border-radius:8px;font-weight:600">Выбрать фотозону</a>
            <a href="tel:${SITE.phoneRaw}" style="display:inline-block;padding:12px 28px;background:#1a1428;color:#fff;text-decoration:none;border-radius:8px;font-weight:600;margin-left:8px">📞 Позвонить</a>
          </div>
          <p style="margin:16px 0 0;font-size:13px;color:#888;line-height:1.5">
            Если уже не актуально — просто не отвечайте, мы больше не побеспокоим.
          </p>
        </div>
      </div>`,
  },
};

/**
 * Отправляет шаг дожим-цепочки (1, 2 или 3) по лид-магниту.
 * @param to — email клиента
 * @param step — 1 (сразу), 2 (+2 дня), 3 (+5 дней)
 * @param leadMagnetSlug — slug магнита, для которого тянем цепочку
 * @param ctx — { name, leadId } — имя клиента для персонализации
 */
export async function sendDripEmail(
  to: string,
  step: 1 | 2 | 3,
  leadMagnetSlug: string,
  ctx: { name: string; leadId?: string },
) {
  const tpl = DRIP_TEMPLATES[step];
  if (!tpl) {
    console.warn('[notify:drip] unknown step', step);
    return { ok: false, reason: 'unknown-step' };
  }

  // Подтягиваем лид-магнит из БД (для заголовка и fileUrl)
  try {
    const magnet = await db.leadMagnet.findUnique({ where: { slug: leadMagnetSlug } });
    if (!magnet) {
      console.warn('[notify:drip] magnet not found', leadMagnetSlug);
      return { ok: false, reason: 'magnet-not-found' };
    }
    const subject = tpl.subject(magnet.title);
    const html = tpl.body(ctx.name || 'Гость', magnet.title, magnet.fileUrl);

    if (process.env.NODE_ENV !== 'production') {
      console.log(`[notify:drip] step ${step} → ${to} (magnet=${leadMagnetSlug}, lead=${ctx.leadId || '—'})`);
    }

    await sendEmailTo(to, subject, html);
    return { ok: true, step, to, magnet: leadMagnetSlug };
  } catch (e: any) {
    console.error('[notify:drip] error', e?.message);
    return { ok: false, reason: 'error', error: e?.message };
  }
}

// Статус конфигурации уведомлений (для админки — чтобы видеть, настроено ли)
export async function getNotifyConfigStatus() {
  // Поддержка обоих форматов: TELEMER_* (новый) и TELEGRAM_* (старый)
  const botToken = process.env.TELEMER_BOT_TOKEN || process.env.TELEGRAM_BOT_TOKEN;
  const chatIds = getChatIds();
  const chatIdForDisplay = chatIds[0] || null;
  const emails = await getNotifyEmails();
  return {
    telegram: {
      configured: !!(botToken && chatIds.length > 0),
      chatId: chatIdForDisplay ? `…${chatIdForDisplay.slice(-4)}` : null,
    },
    email: {
      configured: isSmtpConfigured(),
      // показываем только первые 2 адреса, остальные скрыто (без PII в логах)
      to: emails.slice(0, 2).join(', ') + (emails.length > 2 ? `, +${emails.length - 2}` : ''),
      count: emails.length,
      from: process.env.SMTP_FROM || process.env.SMTP_USER || null,
      host: process.env.SMTP_HOST || null,
      port: process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : null,
    },
  };
}
