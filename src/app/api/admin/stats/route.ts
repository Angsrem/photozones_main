import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const [total, byStatus, recent, byPhotozoneRaw, bySourceRaw] = await Promise.all([
    db.lead.count(),
    db.lead.groupBy({ by: ['status'], _count: true }),
    db.lead.findMany({ orderBy: { createdAt: 'desc' }, take: 7, select: { id: true, name: true, createdAt: true, status: true, source: true } }),
    db.lead.groupBy({ by: ['photozoneId'], _count: { _all: true }, orderBy: { _count: { photozoneId: 'desc' } }, take: 8 }),
    db.lead.groupBy({ by: ['source'], _count: { _all: true }, orderBy: { _count: { source: 'desc' } }, take: 10 }),
  ]);

  const photozoneIds = byPhotozoneRaw.map((x) => x.photozoneId).filter(Boolean) as string[];
  const photozones = await db.photoZone.findMany({ where: { id: { in: photozoneIds } }, select: { id: true, title: true } });
  const pzMap = new Map(photozones.map((p) => [p.id, p.title]));
  const byPhotozone = byPhotozoneRaw
    .filter((x) => x.photozoneId)
    .map((x) => ({ title: pzMap.get(x.photozoneId!) || '—', count: (x._count as any)._all ?? 0 }))
    .sort((a, b) => b.count - a.count);

  const statusMap: Record<string, number> = {};
  for (const s of byStatus) statusMap[s.status] = (s._count as any) ?? 0;

  const converted = (statusMap['CONFIRMED'] || 0) + (statusMap['DONE'] || 0);
  const conversion = total ? Math.round((converted / total) * 100) : 0;

  return NextResponse.json({
    total,
    byStatus: statusMap,
    conversion,
    recent,
    byPhotozone,
    bySource: bySourceRaw.map((x) => ({ source: x.source || '—', count: (x._count as any)._all ?? 0 })),
  });
}
