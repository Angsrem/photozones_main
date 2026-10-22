import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { notifyNewLead } from '@/lib/notify';

export const runtime = 'nodejs';

// POST — отправить тестовое уведомление (проверить, что Telegram/email работают)
export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const result = await notifyNewLead({
    id: 'test-' + Date.now(),
    name: 'Тест (от ' + session.name + ')',
    phone: '+7 (999) 000-00-00',
    eventDate: new Date().toISOString().slice(0, 10),
    occasion: 'OTHER',
    photozoneTitle: null,
    comment: 'Это тестовое уведомление из админки. Если вы его видите — Telegram подключён.',
    source: 'admin-test',
    priceEstimate: null,
  });

  return NextResponse.json({
    ok: true,
    telegram: result.telegram,
    emailSent: result.emailSent,
    message: result.telegram?.ok
      ? '✅ Тестовое уведомление отправлено в Telegram'
      : '⚠️ Telegram не настроен. Проверьте TELEMER_BOT_TOKEN и TELEMER_CHAT_ID в .env',
  });
}
