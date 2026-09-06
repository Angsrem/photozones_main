import { NextRequest, NextResponse } from 'next/server';
import { getPhotozones } from '@/lib/data';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const occasion = searchParams.get('occasion') || undefined;
  const search = searchParams.get('q') || undefined;
  const sort = (searchParams.get('sort') as any) || undefined;
  const limit = searchParams.get('limit') ? Number(searchParams.get('limit')) : undefined;

  const zones = await getPhotozones({ category, occasion, search, sort, limit });
  return NextResponse.json({ items: zones });
}
