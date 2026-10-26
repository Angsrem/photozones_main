import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

const NOTIFY_EMAILS_KEY = 'notify_emails';
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Ограничения: не больше 20 адресов, длина каждого — разумная.
const MAX_EMAILS = 20;

function requireAdmin(session: Awaited<ReturnType<typeof getSession>>) {
  if (!session) return { ok: false as const, status: 401, error: 'Не авторизован' };
  if (session.role !== 'ADMIN') return { ok: false as const, status: 403, error: 'Только для ADMIN' };
  return { ok: true as const };
}

/** GET — текущие адреса для email-уведомлений. */
export async function GET() {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const row = await db.setting.findUnique({ where: { key: NOTIFY_EMAILS_KEY } });
  let emails: string[] = [];
  if (row?.value) {
    try {
      const parsed = JSON.parse(row.value);
      if (Array.isArray(parsed)) {
        emails = parsed.map((x) => String(x || '').trim().toLowerCase()).filter(Boolean);
      }
    } catch {
      emails = [];
    }
  }

  return NextResponse.json({ emails });
}

/** PUT — сохранить список адресов для уведомлений. */
export async function PUT(req: NextRequest) {
  const session = await getSession();
  const guard = requireAdmin(session);
  if (!guard.ok) return NextResponse.json({ error: guard.error }, { status: guard.status });

  const body = await req.json().catch(() => ({}));
  // Принимаем как массив строк, так и строку с разделителями (запятая/перенос/точка с запятой).
  let raw: unknown = body.emails;
  if (typeof raw === 'string') {
    raw = raw.split(/[\n,;]+/).map((s) => s.trim()).filter(Boolean);
  }
  if (!Array.isArray(raw)) {
    return NextResponse.json({ error: 'Ожидается массив emails или строка' }, { status: 422 });
  }

  const seen = new Set<string>();
  const clean: string[] = [];
  for (const item of raw) {
    const email = String(item || '').trim().toLowerCase();
    if (!email) continue;
    if (!EMAIL_RE.test(email)) {
      return NextResponse.json({ error: `Некорректный email: "${email}"` }, { status: 422 });
    }
    if (seen.has(email)) {
      return NextResponse.json({ error: `Дубликат email: "${email}"` }, { status: 422 });
    }
    seen.add(email);
    clean.push(email);
    if (clean.length > MAX_EMAILS) {
      return NextResponse.json({ error: `Максимум ${MAX_EMAILS} адресов` }, { status: 422 });
    }
  }

  await db.setting.upsert({
    where: { key: NOTIFY_EMAILS_KEY },
    update: { value: JSON.stringify(clean) },
    create: { key: NOTIFY_EMAILS_KEY, value: JSON.stringify(clean) },
  });

  return NextResponse.json({ ok: true, emails: clean });
}
