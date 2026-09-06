import { NextRequest, NextResponse } from 'next/server';
import { getPhotozoneBySlug } from '@/lib/data';

export const runtime = 'nodejs';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const pz = await getPhotozoneBySlug(slug);
  if (!pz) return NextResponse.json({ error: 'Не найдено' }, { status: 404 });
  return NextResponse.json(pz);
}
