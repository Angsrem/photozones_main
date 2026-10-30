import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * GET /api/admin/analytics — статистика посещаемости.
 * Query: ?days=7 (по умолчанию 7, max 90)
 * 
 * Возвращает:
 * - График: views + unique по дням
 * - Топ-10 страниц
 * - Источники трафика (referer)
 * - Сводка (total views, unique, leads, конверсия)
 */
export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const days = Math.min(Math.max(Number(searchParams.get('days') || '7'), 1), 90);
  
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  // Все pageview за период
  const allViews = await db.pageView.findMany({
    where: { createdAt: { gte: startDate } },
    select: { path: true, referer: true, isUnique: true, createdAt: true },
  });

  // Группируем по дням
  const byDay: Record<string, { views: number; unique: number }> = {};
  for (let i = 0; i < days; i++) {
    const d = new Date(startDate);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    byDay[key] = { views: 0, unique: 0 };
  }

  for (const v of allViews) {
    const key = v.createdAt.toISOString().slice(0, 10);
    if (byDay[key]) {
      byDay[key].views++;
      if (v.isUnique) byDay[key].unique++;
    }
  }

  const chart = Object.entries(byDay).map(([date, data]) => ({
    date,
    views: data.views,
    unique: data.unique,
  }));

  // Топ-10 страниц
  const pageCount: Record<string, number> = {};
  for (const v of allViews) {
    pageCount[v.path] = (pageCount[v.path] || 0) + 1;
  }
  const topPages = Object.entries(pageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([path, count]) => ({ path, count }));

  // Источники трафика
  const refCount: Record<string, number> = {};
  for (const v of allViews) {
    const ref = v.referer || 'direct';
    refCount[ref] = (refCount[ref] || 0) + 1;
  }
  const sources = Object.entries(refCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([source, count]) => ({ source, count }));

  // Сводка
  const totalViews = allViews.length;
  const totalUnique = allViews.filter((v) => v.isUnique).length;
  const leads = await db.lead.count({ where: { createdAt: { gte: startDate } } });
  const conversion = totalUnique > 0 ? ((leads / totalUnique) * 100).toFixed(1) : '0';

  return NextResponse.json({
    days,
    chart,
    topPages,
    sources,
    summary: { totalViews, totalUnique, leads, conversion: Number(conversion) },
  });
}
