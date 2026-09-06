import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const items = await db.page.findMany({ orderBy: { title: 'asc' } });
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const body = await req.json().catch(() => ({}));
  const { slug, title, description, blocks, isPublished } = body;
  if (!slug || !title) return NextResponse.json({ error: 'Укажите slug и название' }, { status: 422 });
  const existing = await db.page.findUnique({ where: { slug } });
  if (existing) return NextResponse.json({ error: 'Slug занят' }, { status: 409 });
  const page = await db.page.create({
    data: {
      slug: String(slug),
      title: String(title),
      description: description ? String(description) : null,
      blocks: blocks || [],
      isPublished: isPublished !== false,
    },
  });
  return NextResponse.json({ ok: true, page });
}
