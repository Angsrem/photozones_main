import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await db.page.findUnique({ where: { slug } });
  if (!page || !page.isPublished) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json(page);
}
