'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { BarChart3, TrendingUp, Eye, Users, Target, Globe, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '../_lib';

type AnalyticsData = {
  days: number;
  chart: { date: string; views: number; unique: number }[];
  topPages: { path: string; count: number }[];
  sources: { source: string; count: number }[];
  summary: { totalViews: number; totalUnique: number; leads: number; conversion: number };
};

export default function AnalyticsPage() {
  const [data, setData] = React.useState<AnalyticsData | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [days, setDays] = React.useState(7);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const d = await api<AnalyticsData>(`/api/admin/analytics?days=${days}`);
      setData(d);
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  }, [days]);

  React.useEffect(() => { load(); }, [load]);

  // Максимальное значение для масштабирования графика
  const maxViews = Math.max(...(data?.chart.map((d) => d.views) || [1]), 1);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <BarChart3 className="size-6 text-gold" /> Аналитика
          </h1>
          <p className="text-sm text-muted-foreground">Посещаемость, источники трафика, конверсия</p>
        </div>
        <div className="flex items-center gap-2">
          <Tabs value={String(days)} onValueChange={(v) => setDays(Number(v))}>
            <TabsList>
              <TabsTrigger value="7">7 дней</TabsTrigger>
              <TabsTrigger value="30">30 дней</TabsTrigger>
              <TabsTrigger value="90">90 дней</TabsTrigger>
            </TabsList>
          </Tabs>
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="size-8 animate-spin text-muted-foreground" />
        </div>
      ) : data ? (
        <>
          {/* Сводные карточки */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Eye className="size-4" />
                  <span className="text-xs">Просмотры</span>
                </div>
                <div className="text-2xl font-bold">{data.summary.totalViews}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Users className="size-4" />
                  <span className="text-xs">Уникальные</span>
                </div>
                <div className="text-2xl font-bold">{data.summary.totalUnique}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Target className="size-4" />
                  <span className="text-xs">Заявки</span>
                </div>
                <div className="text-2xl font-bold">{data.summary.leads}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <TrendingUp className="size-4" />
                  <span className="text-xs">Конверсия</span>
                </div>
                <div className="text-2xl font-bold text-gold">{data.summary.conversion}%</div>
              </CardContent>
            </Card>
          </div>

          {/* График по дням */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Просмотры по дням</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-1 h-40 overflow-x-auto">
                {data.chart.map((d) => {
                  const height = (d.views / maxViews) * 100;
                  return (
                    <div key={d.date} className="flex-1 min-w-[30px] flex flex-col items-center gap-1 group">
                      <div className="text-[10px] text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        {d.views}
                      </div>
                      <div
                        className="w-full rounded-t bg-gold/60 hover:bg-gold transition-colors"
                        style={{ height: `${Math.max(height, 2)}%`, minHeight: '4px' }}
                      />
                      <div className="text-[9px] text-muted-foreground whitespace-nowrap">
                        {new Date(d.date).getDate()}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Две колонки: топ страниц + источники */}
          <div className="grid md:grid-cols-2 gap-4">
            {/* Топ страниц */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Топ страниц</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.topPages.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  data.topPages.map((p, i) => (
                    <div key={p.path} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-6 text-right">{i + 1}.</span>
                      <code className="flex-1 truncate text-xs bg-muted px-2 py-1 rounded">{p.path}</code>
                      <Badge variant="outline" className="shrink-0">{p.count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Источники трафика */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Globe className="size-4" /> Источники
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {data.sources.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Нет данных</p>
                ) : (
                  data.sources.map((s) => (
                    <div key={s.source} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2">
                        {s.source === 'direct' ? (
                          <Badge variant="outline">Прямые</Badge>
                        ) : (
                          <code className="text-xs bg-muted px-2 py-1 rounded">{s.source}</code>
                        )}
                      </span>
                      <Badge variant="outline" className="shrink-0">{s.count}</Badge>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Подсказка про Яндекс.Метрику */}
          <div className="rounded-xl border border-blue-300/40 bg-blue-50 dark:bg-blue-950/30 p-4 text-sm">
            <p className="text-muted-foreground">
              💡 Это собственная аналитика (хранится в БД). Для детальной аналитики (устройства, глубина просмотра, время на сайте) подключите <b className="text-foreground">Яндекс.Метрику</b> — установите счётчик и добавьте <code className="text-xs bg-muted px-1 rounded">NEXT_PUBLIC_YM_ID</code> в .env.
            </p>
          </div>
        </>
      ) : (
        <p className="text-muted-foreground text-center py-20">Нет данных</p>
      )}
    </div>
  );
}
