import { NextResponse } from 'next/server';
import { getSession, clearSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const s = await getSession();
  if (!s) return NextResponse.json({ manager: null }, { status: 401 });
  return NextResponse.json({ manager: s });
}

export async function DELETE() {
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
}
