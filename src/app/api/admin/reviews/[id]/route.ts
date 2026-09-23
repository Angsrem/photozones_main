import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import fs from 'fs';
import path from 'path';

export const runtime = 'nodejs';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  const body = await req.json().catch(() => ({}));
  const data: any = {};
  if ('isPublished' in body) data.isPublished = body.isPublished;
  if ('rating' in body) data.rating = Number(body.rating);
  if ('text' in body) data.text = body.text;
  if ('author' in body) data.author = body.author;
  const review = await db.review.update({ where: { id }, data });
  return NextResponse.json({ ok: true, review });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });
  const { id } = await params;
  // удаляем файлы
  const review = await db.review.findUnique({ where: { id } });
  if (review) {
    const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
    for (const url of [...((review.photos as string[]) || []), ...((review.videos as string[]) || [])]) {
      if (typeof url !== 'string' || !url.startsWith('/uploads/reviews/')) continue;
      const filePath = path.resolve(PUBLIC_ROOT, '.' + url);
      if (!filePath.startsWith(PUBLIC_ROOT + path.sep)) continue;
      try { fs.unlinkSync(filePath); } catch {}
    }
  }
  await db.review.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
