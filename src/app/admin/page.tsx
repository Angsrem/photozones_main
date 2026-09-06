'use client';

import * as React from 'react';
import {
  Inbox,
  PhoneIncoming,
  CheckCircle2,
  Percent,
  TrendingUp,
  Images,
  Loader2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { api, type LeadStatus, LEAD_STATUS_LABEL, LEAD_STATUS_STYLES } from './_lib';
import { formatDateShort } from '@/lib/format';

type Stats = {
  total: number;
  byStatus: Record<string, number>;
  conversion: number;
  recent: {
    id: string;
    name: string;
    createdAt: string;
    status: LeadStatus;
    source: string | null;
  }[];
  byPhotozone: { title: string; count: number }[];
  bySource: { source: string; count: number }[];
};

const STATUS_BAR_COLORS: Record<LeadStatus, string> = {
  NEW: 'bg-amber-400',
  CALLED: 'bg-sky-400',
  CONFIRMED: 'bg-emerald-400',
  DECLINED: 'bg-rose-400',
  DONE: 'bg-violet-400',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = React.useState<Stats | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);
  const [partials, setPartials] = React.useState<any[]>([]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [data, pData] = await Promise.all([
        api<Stats>('/api/admin/stats'),
        api<{ items: any[] }>('/api/quiz-partial?limit=10'),
      ]);
      setStats(data);
      setPartials(pData.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка статистики…
      </div>
    );
  }
  if (err || !stats) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          {err || 'Нет данных'}
          <div className="mt-3">
            <Button variant="outline" onClick={load}>Повторить</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const statuses: LeadStatus[] = ['NEW', 'CALLED', 'CONFIRMED', 'DECLINED', 'DONE'];
  const newCount = stats.byStatus['NEW'] || 0;
  const confirmedCount = stats.byStatus['CONFIRMED'] || 0;
  const doneCount = stats.byStatus['DONE'] || 0;

  const barData = statuses.map((s) => ({
    name: LEAD_STATUS_LABEL[s],
    value: stats.byStatus[s] || 0,
    status: s,
  }));
  const maxBar = Math.max(1, ...barData.map((b) => b.value));
  const maxSource = Math.max(1, ...stats.bySource.map((s) => s.count));
  const maxPhotozone = Math.max(1, ...stats.byPhotozone.map((p) => p.count));

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Дашборд</h1>
          <p className="text-sm text-muted-foreground">
            Сводка по заявкам и конверсии.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load}>Обновить</Button>
      </div>

      {/* KPI */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Всего заявок" value={stats.total} icon={<Inbox className="size-5" />} tint="bg-sky-100 text-sky-700" />
        <KpiCard title="Новые" value={newCount} icon={<PhoneIncoming className="size-5" />} tint="bg-amber-100 text-amber-700" hint="Требуют обработки" />
        <KpiCard title="Подтверждены" value={confirmedCount} icon={<CheckCircle2 className="size-5" />} tint="bg-emerald-100 text-emerald-700" hint={`Выполнено: ${doneCount}`} />
        <KpiCard title="Конверсия" value={`${stats.conversion}%`} icon={<Percent className="size-5" />} tint="bg-violet-100 text-violet-700" hint="подтв. + выполнено / всего" />
      </div>

      {/* Брошенные квизы (partial-лиды) */}
      {partials.length > 0 && (
        <Card>
          <div className="p-5 border-b">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display text-base flex items-center gap-2">
                  <AlertCircle className="size-4 text-amber-500" /> Брошенные квизы ({partials.length})
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">Люди начали квиз, но не дошли до результата — потенциальные лиды для дозвона</p>
              </div>
              <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300">{partials.filter((p) => !p.converted).length} активных</Badge>
            </div>
          </div>
          <div className="divide-y max-h-64 overflow-y-auto">
            {partials.slice(0, 8).map((p) => {
              const a = p.answers || {};
              return (
                <div key={p.id} className="px-5 py-2.5 flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{a.occasion || '—'}</span>
                      {a.style && <Badge variant="outline" className="text-[10px]">{a.style}</Badge>}
                      {a.guests && <Badge variant="outline" className="text-[10px]">{a.guests}</Badge>}
                      {a.budget && <Badge variant="outline" className="text-[10px]">{a.budget}</Badge>}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Шаг {p.step} · {new Date(p.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })} · {(p.source || '?').slice(0, 30)}
                    </div>
                  </div>
                  {p.converted ? (
                    <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 shrink-0">Дошёл</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 shrink-0">Бросил</Badge>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* График по статусам — CSS-бары */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <TrendingUp className="size-4 text-primary" /> Заявки по статусам
            </CardTitle>
            <CardDescription>Распределение всех заявок по этапам воронки</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {barData.map((b) => (
                <div key={b.status} className="flex items-center gap-3">
                  <div className="w-28 text-sm text-foreground/80 shrink-0">{b.name}</div>
                  <div className="flex-1 h-7 rounded-md bg-muted overflow-hidden relative">
                    <div
                      className={`h-full ${STATUS_BAR_COLORS[b.status]} transition-all`}
                      style={{ width: `${(b.value / maxBar) * 100}%` }}
                    />
                  </div>
                  <div className="w-8 text-sm font-semibold text-right">{b.value}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* По источникам */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">По источникам</CardTitle>
            <CardDescription>Откуда приходят заявки</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.bySource.length === 0 && <div className="text-sm text-muted-foreground">Нет данных</div>}
            {stats.bySource.map((s) => (
              <div key={s.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{s.source || '—'}</span>
                  <span className="text-muted-foreground">{s.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(s.count / maxSource) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Популярные фотозоны */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Images className="size-4 text-primary" /> Популярные фотозоны
            </CardTitle>
            <CardDescription>По числу заявок</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {stats.byPhotozone.length === 0 && <div className="text-sm text-muted-foreground">Нет данных</div>}
            {stats.byPhotozone.map((p, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="truncate">{p.title}</span>
                  <span className="text-muted-foreground">{p.count}</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div className="h-full bg-primary" style={{ width: `${(p.count / maxPhotozone) * 100}%` }} />
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Последние заявки */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <div>
              <CardTitle className="text-base">Последние заявки</CardTitle>
              <CardDescription>Свежие 7 обращений</CardDescription>
            </div>
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link href="/admin/leads">Все <ArrowRight className="size-3.5" /></Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {stats.recent.length === 0 && <div className="text-sm text-muted-foreground py-3">Нет заявок</div>}
              {stats.recent.map((r) => (
                <div key={r.id} className="flex items-center justify-between gap-3 py-2.5">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{r.name || 'Без имени'}</div>
                    <div className="text-xs text-muted-foreground">
                      {formatDateShort(r.createdAt)} · {r.source || 'прямая'}
                    </div>
                  </div>
                  <Badge variant="outline" className={`shrink-0 ${LEAD_STATUS_STYLES[r.status as LeadStatus] || ''}`}>
                    {LEAD_STATUS_LABEL[r.status as LeadStatus] || r.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function KpiCard({
  title, value, icon, tint, hint,
}: {
  title: string;
  value: React.ReactNode;
  icon: React.ReactNode;
  tint: string;
  hint?: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm text-muted-foreground">{title}</div>
            <div className="mt-1 text-2xl font-semibold tracking-tight">{value}</div>
            {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
          </div>
          <div className={`flex size-10 items-center justify-center rounded-lg ${tint}`}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}
