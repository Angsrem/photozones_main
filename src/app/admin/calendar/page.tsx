'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ChevronLeft,
  ChevronRight,
  Loader2,
  CalendarDays,
  Ban,
  Trash2,
  Plus,
  Phone,
  MessageCircle,
  Sparkles,
  X,
  AlertTriangle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  api,
  type Lead,
  type Booking,
  type DateBlock,
  type PhotoZone,
  type LeadStatus,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_STYLES,
  waLink,
  telLink,
} from '../_lib';
import { formatDateRu, formatDateShort, formatPrice } from '@/lib/format';

type DayData = { bookings: Booking[]; blocks: DateBlock[]; leads: Lead[] };
type MonthData = { month: string; byDay: Record<string, DayData> };

const WEEKDAYS = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
const MONTHS_RU = [
  'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
  'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь',
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function ymOf(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

// строит сетку месяца (с доп. ячейками из соседних месяцев чтобы заполнить 6 строк × 7 столбцов)
function buildMonthGrid(year: number, month: number) {
  // month: 0-based
  const first = new Date(year, month, 1);
  const firstDayJs = new Date(year, month, 1);
  // делаем понедельник первым днём недели
  const firstWeekday = (firstDayJs.getDay() + 6) % 7; // 0=Пн
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: { date: string; day: number; inMonth: boolean; isToday: boolean }[] = [];
  const todayStr = new Date().toISOString().slice(0, 10);

  // префикс из прошлого месяца
  for (let i = firstWeekday - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    cells.push({
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      inMonth: false,
      isToday: d.toISOString().slice(0, 10) === todayStr,
    });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const ds = d.toISOString().slice(0, 10);
    cells.push({ date: ds, day: i, inMonth: true, isToday: ds === todayStr });
  }
  // суффикс до 42 ячеек (6 строк)
  let i = 1;
  while (cells.length < 42) {
    const d = new Date(year, month + 1, i++);
    cells.push({
      date: d.toISOString().slice(0, 10),
      day: d.getDate(),
      inMonth: false,
      isToday: d.toISOString().slice(0, 10) === todayStr,
    });
  }
  return cells;
}

export default function AdminCalendarPage() {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth()); // 0-based
  const [pzFilter, setPzFilter] = React.useState<string>('ALL');
  const [photozones, setPhotozones] = React.useState<PhotoZone[]>([]);
  const [data, setData] = React.useState<MonthData | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [selectedDate, setSelectedDate] = React.useState<string | null>(null);

  // загрузка фотозон для фильтра
  React.useEffect(() => {
    api<{ items: PhotoZone[] }>('/api/admin/photozones')
      .then((r) => setPhotozones(r.items || []))
      .catch(() => setPhotozones([]));
  }, []);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const ym = `${year}-${pad(month + 1)}`;
      const data = await api<MonthData>(`/api/admin/calendar?month=${ym}`);
      setData(data);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить календарь');
    } finally {
      setLoading(false);
    }
  }, [year, month]);

  React.useEffect(() => {
    load();
  }, [load]);

  const goPrev = () => {
    if (month === 0) {
      setMonth(11);
      setYear((y) => y - 1);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (month === 11) {
      setMonth(0);
      setYear((y) => y + 1);
    } else {
      setMonth((m) => m + 1);
    }
  };
  const goToday = () => {
    const t = new Date();
    setYear(t.getFullYear());
    setMonth(t.getMonth());
  };

  const cells = React.useMemo(() => buildMonthGrid(year, month), [year, month]);

  // цвет точки фотозоны — стабильный на основе id
  const pzColor = (id: string) => {
    const palette = [
      'bg-emerald-500',
      'bg-rose-500',
      'bg-sky-500',
      'bg-violet-500',
      'bg-amber-500',
      'bg-pink-500',
      'bg-teal-500',
      'bg-indigo-500',
      'bg-orange-500',
      'bg-cyan-500',
      'bg-fuchsia-500',
      'bg-lime-600',
    ];
    let h = 0;
    for (const c of id) h = (h * 31 + c.charCodeAt(0)) >>> 0;
    return palette[h % palette.length];
  };

  const pzTitle = (id: string | null | undefined) =>
    photozones.find((p) => p.id === id)?.title || '—';

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Календарь занятости</h1>
          <p className="text-sm text-muted-foreground">
            Бронирования, блокировки и заявки по дням
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToday}>Сегодня</Button>
          <Button variant="outline" size="icon" onClick={goPrev} aria-label="Предыдущий месяц">
            <ChevronLeft className="size-4" />
          </Button>
          <div className="min-w-[170px] text-center font-medium">
            {MONTHS_RU[month]} {year}
          </div>
          <Button variant="outline" size="icon" onClick={goNext} aria-label="Следующий месяц">
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>

      {/* фильтр по фотозоне */}
      <Card>
        <CardContent className="p-3 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CalendarDays className="size-4" /> Фотозона:
          </div>
          <Select value={pzFilter} onValueChange={setPzFilter}>
            <SelectTrigger className="w-[260px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">Все фотозоны</SelectItem>
              {photozones.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {loading && (
            <Loader2 className="size-4 animate-spin text-muted-foreground" />
          )}
        </CardContent>
      </Card>

      {err && (
        <Card>
          <CardContent className="py-8 text-center text-sm text-destructive">
            {err}
            <div className="mt-2">
              <Button variant="outline" size="sm" onClick={load}>Повторить</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Сетка */}
      {!err && (
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="grid grid-cols-7 gap-1 sm:gap-2">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-center text-xs font-medium text-muted-foreground py-2"
                >
                  {w}
                </div>
              ))}
              {cells.map((c, idx) => {
                const dayData = data?.byDay[c.date];
                // если фильтр по фотозоне — отфильтруем брони/блоки/лиды по ней
                let bookings = dayData?.bookings || [];
                let blocks = dayData?.blocks || [];
                let leads = dayData?.leads || [];
                if (pzFilter !== 'ALL') {
                  bookings = bookings.filter(
                    (b) => b.photozoneId === pzFilter
                  );
                  blocks = blocks.filter((b) => b.photozoneId === pzFilter);
                  leads = leads.filter((l) => l.photozoneId === pzFilter);
                }
                const hasEvents = bookings.length + blocks.length + leads.length > 0;
                const isWeekend = idx % 7 >= 5;

                return (
                  <button
                    key={`${c.date}-${idx}`}
                    onClick={() => setSelectedDate(c.date)}
                    className={`calendar-cell relative text-left rounded-md border p-1.5 sm:p-2 transition-colors ${
                      c.inMonth ? 'bg-card' : 'bg-muted/30'
                    } ${
                      c.isToday ? 'border-primary ring-1 ring-primary/30' : 'border-border'
                    } hover:border-primary/60 hover:bg-accent/30`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-sm font-medium ${
                          c.inMonth ? '' : 'text-muted-foreground/60'
                        } ${isWeekend && c.inMonth ? 'text-rose-600' : ''}`}
                      >
                        {c.day}
                      </span>
                      {hasEvents && (
                        <span className="text-[10px] text-muted-foreground">
                          {bookings.length + blocks.length > 0 && (
                            <span className="mr-1 text-emerald-600">
                              ●{bookings.length + blocks.length}
                            </span>
                          )}
                          {leads.length > 0 && (
                            <span className="text-amber-600">∞{leads.length}</span>
                          )}
                        </span>
                      )}
                    </div>

                    {/* Чипы бронирований */}
                    <div className="mt-1 space-y-0.5">
                      {bookings.slice(0, 2).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-1 text-[10px] sm:text-[11px] leading-tight truncate"
                        >
                          <span
                            className={`size-1.5 rounded-full shrink-0 ${pzColor(
                              b.photozoneId || ''
                            )}`}
                          />
                          <span className="truncate">
                            {b.photozone?.title || 'Бронь'}
                          </span>
                        </div>
                      ))}
                      {blocks.slice(0, 1).map((b) => (
                        <div
                          key={b.id}
                          className="flex items-center gap-1 text-[10px] sm:text-[11px] text-rose-700 leading-tight truncate"
                        >
                          <Ban className="size-2.5 shrink-0" />
                          <span className="truncate">
                            {b.photozone?.title || 'Заблокировано'}
                          </span>
                        </div>
                      ))}
                      {bookings.length + blocks.length > 3 && (
                        <div className="text-[10px] text-muted-foreground">
                          +{bookings.length + blocks.length - 3} ещё
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-emerald-500" /> Бронь
              </div>
              <div className="flex items-center gap-1.5">
                <Ban className="size-3 text-rose-600" /> Блокировка
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-amber-600">∞</span> Заявка
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <DayDetailDialog
        date={selectedDate}
        photozones={photozones}
        onClose={() => setSelectedDate(null)}
        onChanged={load}
        pzColor={pzColor}
      />
    </div>
  );
}

// ============ Диалог деталей дня ============

function DayDetailDialog({
  date,
  photozones,
  onClose,
  onChanged,
  pzColor,
}: {
  date: string | null;
  photozones: PhotoZone[];
  onClose: () => void;
  onChanged: () => void;
  pzColor: (id: string) => string;
}) {
  const [leads, setLeads] = React.useState<Lead[]>([]);
  const [bookings, setBookings] = React.useState<Booking[]>([]);
  const [blocks, setBlocks] = React.useState<DateBlock[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [alternativesFor, setAlternativesFor] = React.useState<string | null>(null);
  const [alts, setAlts] = React.useState<PhotoZone[]>([]);
  const [loadingAlts, setLoadingAlts] = React.useState(false);
  const [showBlockForm, setShowBlockForm] = React.useState(false);
  const [showBookingForm, setShowBookingForm] = React.useState(false);

  const loadDay = React.useCallback(async () => {
    if (!date) return;
    setLoading(true);
    try {
      const data = await api<{ leads: Lead[]; bookings: Booking[]; blocks: DateBlock[] }>(
        `/api/admin/calendar?date=${date}`
      );
      setLeads(data.leads || []);
      setBookings(data.bookings || []);
      setBlocks(data.blocks || []);
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось загрузить день');
    } finally {
      setLoading(false);
    }
  }, [date]);

  React.useEffect(() => {
    if (date) {
      loadDay();
      setAlternativesFor(null);
      setAlts([]);
      setShowBlockForm(false);
      setShowBookingForm(false);
    }
  }, [date, loadDay]);

  // подбор аналогов
  React.useEffect(() => {
    if (!date || !alternativesFor) {
      setAlts([]);
      return;
    }
    let cancelled = false;
    setLoadingAlts(true);
    (async () => {
      try {
        const r = await api<{ items: PhotoZone[] }>(
          `/api/admin/calendar?date=${date}&alternativesFor=${alternativesFor}`
        );
        if (!cancelled) setAlts(r.items || []);
      } catch {
        if (!cancelled) setAlts([]);
      } finally {
        if (!cancelled) setLoadingAlts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [date, alternativesFor]);

  const removeBlock = async (id: string) => {
    if (!confirm('Разблокировать дату?')) return;
    try {
      await api(`/api/admin/bookings?id=${id}&type=block`, { method: 'DELETE' });
      toast.success('Блокировка снята');
      loadDay();
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  const removeBooking = async (id: string) => {
    if (!confirm('Удалить бронирование?')) return;
    try {
      await api(`/api/admin/bookings?id=${id}&type=booking`, { method: 'DELETE' });
      toast.success('Бронирование удалено');
      loadDay();
      onChanged();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  const occupiedPzIds = React.useMemo(() => {
    const set = new Set<string>();
    for (const b of bookings) if (b.photozoneId) set.add(b.photozoneId);
    for (const b of blocks) if (b.photozoneId) set.add(b.photozoneId);
    return set;
  }, [bookings, blocks]);

  return (
    <Dialog open={!!date} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="size-5 text-primary" />
            {date ? formatDateRu(date) : ''}
          </DialogTitle>
          <DialogDescription>
            Бронирования, блокировки и заявки на выбранный день
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-8 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 mr-2 animate-spin text-primary" /> Загрузка…
          </div>
        )}

        {!loading && date && (
          <div className="space-y-4">
            {/* Бронирования */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold">
                  Бронирования ({bookings.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowBookingForm((v) => !v)}
                >
                  <Plus className="size-3.5" /> Добавить бронь
                </Button>
              </div>

              {showBookingForm && (
                <AddBookingForm
                  date={date}
                  photozones={photozones}
                  occupiedPzIds={occupiedPzIds}
                  leads={leads}
                  onDone={() => {
                    setShowBookingForm(false);
                    loadDay();
                    onChanged();
                  }}
                />
              )}

              {bookings.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">Нет бронирований</div>
              ) : (
                <div className="space-y-1.5">
                  {bookings.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className={`size-2.5 rounded-full shrink-0 ${pzColor(
                            b.photozoneId || ''
                          )}`}
                        />
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {b.photozone?.title || '—'}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {b.lead ? `Клиент: ${b.lead.name} · ${b.lead.phone}` : b.note || 'без лида'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {b.status}
                        </Badge>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="size-7 text-muted-foreground hover:text-destructive"
                          onClick={() => removeBooking(b.id)}
                          title="Удалить"
                        >
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Блокировки */}
            <section>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Ban className="size-4 text-rose-600" /> Блокировки ({blocks.length})
                </h3>
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  onClick={() => setShowBlockForm((v) => !v)}
                >
                  <Plus className="size-3.5" /> Заблокировать
                </Button>
              </div>

              {showBlockForm && (
                <BlockForm
                  date={date}
                  photozones={photozones}
                  onDone={() => {
                    setShowBlockForm(false);
                    loadDay();
                    onChanged();
                  }}
                />
              )}

              {blocks.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">Нет блокировок</div>
              ) : (
                <div className="space-y-1.5">
                  {blocks.map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between gap-3 rounded-md border border-rose-200 bg-rose-50 p-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {b.photozone?.title || 'Все фотозоны'}
                        </div>
                        <div className="text-xs text-rose-700">
                          Причина: {b.reason || 'service'}
                        </div>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-7 text-rose-700 hover:text-rose-900"
                        onClick={() => removeBlock(b.id)}
                        title="Снять блокировку"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <Separator />

            {/* Заявки */}
            <section>
              <h3 className="text-sm font-semibold mb-2">
                Заявки на день ({leads.length})
              </h3>
              {leads.length === 0 ? (
                <div className="text-xs text-muted-foreground py-2">Нет заявок</div>
              ) : (
                <div className="space-y-1.5">
                  {leads.map((l) => (
                    <div
                      key={l.id}
                      className="flex items-center justify-between gap-3 rounded-md border p-2.5 text-sm"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">{l.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {l.phone} · {l.photozone?.title || '—'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={`text-xs ${LEAD_STATUS_STYLES[l.status as LeadStatus]}`}
                        >
                          {LEAD_STATUS_LABEL[l.status as LeadStatus]}
                        </Badge>
                        <Button asChild size="icon" variant="ghost" className="size-7">
                          <a href={telLink(l.phone)} target="_blank" rel="noreferrer" title="Позвонить">
                            <Phone className="size-3.5" />
                          </a>
                        </Button>
                        <Button asChild size="icon" variant="ghost" className="size-7">
                          <a
                            href={waLink(l.phone, `Здравствуйте, ${l.name}!`)}
                            target="_blank"
                            rel="noreferrer"
                            title="WhatsApp"
                          >
                            <MessageCircle className="size-3.5" />
                          </a>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Свободные аналоги */}
            <Separator />
            <section>
              <div className="flex items-center justify-between mb-2 gap-2 flex-wrap">
                <h3 className="text-sm font-semibold flex items-center gap-1.5">
                  <Sparkles className="size-4 text-primary" /> Свободные аналоги на {formatDateShort(date)}
                </h3>
                <Select
                  value={alternativesFor || ''}
                  onValueChange={(v) => setAlternativesFor(v || null)}
                >
                  <SelectTrigger className="w-[240px] h-8 text-xs">
                    <SelectValue placeholder="Выбрать занятую фотозону" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">— Сбросить —</SelectItem>
                    {[...occupiedPzIds].map((id) => {
                      const pz = photozones.find((p) => p.id === id);
                      return (
                        <SelectItem key={id} value={id}>
                          {pz?.title || id}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {alternativesFor && (
                <>
                  {loadingAlts ? (
                    <div className="py-4 flex items-center justify-center text-muted-foreground text-sm">
                      <Loader2 className="size-4 mr-2 animate-spin text-primary" /> Подбираем…
                    </div>
                  ) : alts.length === 0 ? (
                    <div className="text-xs text-muted-foreground py-3">
                      Свободных аналогов не найдено. Попробуйте изменить дату или фотозону.
                    </div>
                  ) : (
                    <div className="grid sm:grid-cols-2 gap-2">
                      {alts.slice(0, 5).map((a) => (
                        <Card key={a.id} className="p-3">
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <div className="text-sm font-medium truncate">{a.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {a.category} · {formatPrice(a.basePrice)}
                              </div>
                            </div>
                            <Badge variant="secondary" className="shrink-0 text-xs">
                              свободна
                            </Badge>
                          </div>
                          {a.images?.[0] && (
                            <img
                              src={a.images[0]}
                              alt={a.title}
                              className="mt-2 h-20 w-full rounded-md object-cover"
                            />
                          )}
                        </Card>
                      ))}
                    </div>
                  )}
                </>
              )}
              {!alternativesFor && (
                <div className="text-xs text-muted-foreground py-2">
                  Выберите занятую фотозону выше — покажем 3–5 свободных альтернатив.
                </div>
              )}
            </section>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            <X className="size-4 mr-1.5" /> Закрыть
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============ Форма блокировки ============
function BlockForm({
  date,
  photozones,
  onDone,
}: {
  date: string;
  photozones: PhotoZone[];
  onDone: () => void;
}) {
  const [photozoneId, setPhotozoneId] = React.useState<string>('');
  const [reason, setReason] = React.useState('service');
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    setSaving(true);
    try {
      await api('/api/admin/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'block',
          date,
          photozoneId: photozoneId || null,
          reason,
        }),
      });
      toast.success('Дата заблокирована');
      onDone();
    } catch (e: any) {
      if (e?.status === 409) toast.error('Уже заблокировано');
      else toast.error(e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md border border-rose-200 bg-rose-50/50 p-3 space-y-2 mb-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Фотозона</Label>
          <Select value={photozoneId} onValueChange={setPhotozoneId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Все фотозоны" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— Все фотозоны —</SelectItem>
              {photozones.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Причина</Label>
          <Select value={reason} onValueChange={setReason}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="service">Техобслуживание</SelectItem>
              <SelectItem value="reserved">Выкуп</SelectItem>
              <SelectItem value="other">Другое</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={submit} disabled={saving} className="gap-1">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Ban className="size-3.5" />}
          Заблокировать
        </Button>
      </div>
    </div>
  );
}

// ============ Форма добавления брони ============
function AddBookingForm({
  date,
  photozones,
  occupiedPzIds,
  leads,
  onDone,
}: {
  date: string;
  photozones: PhotoZone[];
  occupiedPzIds: Set<string>;
  leads: Lead[];
  onDone: () => void;
}) {
  const [photozoneId, setPhotozoneId] = React.useState('');
  const [leadId, setLeadId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (!photozoneId) {
      toast.error('Выберите фотозону');
      return;
    }
    setSaving(true);
    try {
      await api('/api/admin/bookings', {
        method: 'POST',
        body: JSON.stringify({
          type: 'booking',
          date,
          photozoneId,
          leadId: leadId || null,
          note,
        }),
      });
      toast.success('Бронирование создано');
      onDone();
    } catch (e: any) {
      if (e?.status === 409)
        toast.error('Конфликт: фотозона занята или заблокирована на эту дату');
      else toast.error(e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-md border p-3 space-y-2 mb-3">
      <div className="grid sm:grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label className="text-xs">Фотозона *</Label>
          <Select value={photozoneId} onValueChange={setPhotozoneId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Выбрать" />
            </SelectTrigger>
            <SelectContent>
              {photozones.map((p) => (
                <SelectItem key={p.id} value={p.id} disabled={occupiedPzIds.has(p.id)}>
                  {p.title} {occupiedPzIds.has(p.id) ? '(занята)' : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs">Заявка (необязательно)</Label>
          <Select value={leadId} onValueChange={setLeadId}>
            <SelectTrigger className="h-8 text-xs">
              <SelectValue placeholder="Без заявки" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">— Без заявки —</SelectItem>
              {leads.map((l) => (
                <SelectItem key={l.id} value={l.id}>
                  {l.name} · {l.phone}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-1">
        <Label className="text-xs">Заметка</Label>
        <Input
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Например: договорённость по телефону"
          className="h-8 text-xs"
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button size="sm" onClick={submit} disabled={saving} className="gap-1">
          {saving ? <Loader2 className="size-3.5 animate-spin" /> : <Plus className="size-3.5" />}
          Создать бронь
        </Button>
      </div>
    </div>
  );
}
