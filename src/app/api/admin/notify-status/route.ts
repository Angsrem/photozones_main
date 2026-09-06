import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getNotifyConfigStatus } from '@/lib/notify';

export const runtime = 'nodejs';

// Статус конфигурации уведомлений (настроены ли Telegram/email)
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  return NextResponse.json(getNotifyConfigStatus());
}
