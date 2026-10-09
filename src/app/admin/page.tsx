'use client';

import * as React from 'react';
import { toast } from 'sonner';
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
  Send,
  Bell,
  CheckCircle,
  XCircle,
  FileDown,
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

type LeadMagnetItem = {
  id: string;
  slug: string;
  title: string;
  description: string;
  fileUrl: string;
  occasion: string | null;
  isActive: boolean;
  downloads: number;
  createdAt: string;
  updatedAt: string;
};

const OCCASION_LABELS: Record<string, string> = {
  WEDDING: 'Свадьба',
  BIRTHDAY: 'День рождения',
  GRADUATION: 'Выпускной',
  CORPORATE: 'Корпоратив',
  NEW_YEAR: 'Новый год',
  MARCH_8: '8 марта',
  FEB_23: '23 февраля',
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
  const [notifyStatus, setNotifyStatus] = React.useState<{ telegram: { configured: boolean; chatId: string | null }; email: { configured: boolean; to: string } } | null>(null);
  const [testingNotify, setTestingNotify] = React.useState(false);
  const [leadMagnets, setLeadMagnets] = React.useState<{ items: LeadMagnetItem[]; totalDownloads: number; activeCount: number; total: number } | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const [data, pData, nStatus, lmData] = await Promise.all([
        api<Stats>('/api/admin/stats'),
        api<{ items: any[] }>('/api/quiz-partial?limit=10'),
        api<any>('/api/admin/notify-status').catch(() => null),
        api<{ items: LeadMagnetItem[]; totalDownloads: number; activeCount: number; total: number }>('/api/admin/lead-magnets').catch(() => null),
      ]);
      setStats(data);
      setPartials(pData.items || []);
      if (nStatus) setNotifyStatus(nStatus);
      if (lmData) setLeadMagnets(lmData);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить статистику');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const testNotify = async () => {
    setTestingNotify(true);
    try {
      const res = await api<any>('/api/admin/notify-test', { method: 'POST' });
      if (res.telegram?.ok) {
        toast.success('Тест отправлен в Telegram — проверьте чат с ботом');
      } else {
        toast.error('Telegram не настроен. Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_MANAGER_CHAT_ID в .env');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    } finally {
      setTestingNotify(false);
    }
  };

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

      {/* Статус уведомлений (Telegram/email) */}
      <Card>
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="flex items-start gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <Bell className="size-5 text-primary" />
              </div>
              <div>
                <h3 className="font-display text-base">Уведомления о заявках</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Куда падают новые заявки — менеджер должен получать их за 15 минут</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={testNotify} disabled={testingNotify} className="gap-2 shrink-0">
              {testingNotify ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
              Тест уведомления
            </Button>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mt-4">
            {/* Telegram */}
            <div className={`rounded-lg border p-3 ${notifyStatus?.telegram.configured ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                {notifyStatus?.telegram.configured ? <CheckCircle className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-amber-600" />}
                <span className="text-sm font-medium">Telegram</span>
                <Badge variant="outline" className={notifyStatus?.telegram.configured ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}>
                  {notifyStatus?.telegram.configured ? 'Активен' : 'Не настроен'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {notifyStatus?.telegram.configured
                  ? `Уведомления идут в чат …${notifyStatus?.telegram.chatId}`
                  : 'Добавьте TELEGRAM_BOT_TOKEN и TELEGRAM_MANAGER_CHAT_ID в .env'}
              </p>
            </div>
            {/* Email */}
            <div className={`rounded-lg border p-3 ${notifyStatus?.email.configured ? 'border-emerald-300 bg-emerald-50' : 'border-amber-300 bg-amber-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                {notifyStatus?.email.configured ? <CheckCircle className="size-4 text-emerald-600" /> : <XCircle className="size-4 text-amber-600" />}
                <span className="text-sm font-medium">Email (Resend)</span>
                <Badge variant="outline" className={notifyStatus?.email.configured ? 'bg-emerald-100 text-emerald-700 border-emerald-300' : 'bg-amber-100 text-amber-700 border-amber-300'}>
                  {notifyStatus?.email.configured ? 'Активен' : 'Не настроен'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {notifyStatus?.email.configured ? `Дублирование на ${notifyStatus?.email.to}` : 'Добавьте RESEND_API_KEY в .env'}
              </p>
            </div>
          </div>
          {!notifyStatus?.telegram.configured && (
            <div className="mt-3 text-xs text-muted-foreground bg-muted/50 rounded-lg p-3">
              <b>Как подключить Telegram за 5 минут:</b>
              <ol className="list-decimal list-inside mt-1 space-y-0.5">
                <li>Откройте <code className="bg-background px-1 rounded">@BotFather</code> → /newbot → получите токен</li>
                <li>Узнайте свой chat_id через <code className="bg-background px-1 rounded">@userinfobot</code></li>
                <li>Отправьте боту любое сообщение (иначе он не сможет писать первым)</li>
                <li>Впишите значения в <code className="bg-background px-1 rounded">.env</code> и перезапустите сервер</li>
              </ol>
            </div>
          )}
        </div>
      </Card>

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

      {/* Лид-магниты — счётчик скачиваний по каждому гайду */}
      {leadMagnets && leadMagnets.items.length > 0 && (
        <Card>
          <div className="p-5 border-b">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-start gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                  <FileDown className="size-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-display text-base flex items-center gap-2">
                    Лид-магниты <span className="text-muted-foreground font-normal text-sm">· PDF-гайды</span>
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Скачиваний всего: <b className="text-foreground">{leadMagnets.totalDownloads}</b> · активных гайдов: {leadMagnets.activeCount} из {leadMagnets.total}
                  </p>
                </div>
              </div>
              <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">
                {leadMagnets.totalDownloads} скачиваний
              </Badge>
            </div>
          </div>
          <div className="divide-y max-h-80 overflow-y-auto">
            {leadMagnets.items.map((m) => {
              const maxDl = Math.max(1, ...leadMagnets.items.map((x) => x.downloads));
              return (
                <div key={m.id} className="px-5 py-3 flex items-start justify-between gap-3 text-sm">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{m.title}</span>
                      {m.occasion && (
                        <Badge variant="outline" className="text-[10px] shrink-0">
                          {OCCASION_LABELS[m.occasion] || m.occasion}
                        </Badge>
                      )}
                      {!m.isActive && (
                        <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-700 border-rose-300 shrink-0">
                          Скрыт
                        </Badge>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      slug: <code className="bg-muted px-1 rounded text-[10px]">{m.slug}</code> · {m.fileUrl}
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden mt-2 max-w-xs">
                      <div
                        className="h-full bg-primary transition-all"
                        style={{ width: `${(m.downloads / maxDl) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xl font-semibold tabular-nums">{m.downloads}</div>
                    <div className="text-[10px] text-muted-foreground">скачиваний</div>
                  </div>
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
