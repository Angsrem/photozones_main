import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const items = await db.review.findMany({ orderBy: [{ isPublished: 'asc' }, { createdAt: 'desc' }] });
  return NextResponse.json({ items });
}
