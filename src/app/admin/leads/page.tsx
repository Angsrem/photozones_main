'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Search,
  Loader2,
  Phone,
  MessageCircle,
  RefreshCw,
  Inbox,
  AlertTriangle,
  Save,
  X,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  type LeadStatus,
  type PhotoZone,
  LEAD_STATUS_LABEL,
  LEAD_STATUS_STYLES,
  waLink,
  telLink,
} from '../_lib';
import { formatDateShort, formatDateRu, formatPrice } from '@/lib/format';
import { LeadPromoCodes } from './lead-promo-codes';

type Filters = {
  status: string; // 'ALL' | LeadStatus
  q: string;
  dateFrom: string;
  dateTo: string;
};

const STATUS_TABS: { value: string; label: string }[] = [
  { value: 'ALL', label: 'Все' },
  { value: 'NEW', label: 'Новые' },
  { value: 'CALLED', label: 'Перезвонили' },
  { value: 'CONFIRMED', label: 'Подтверждены' },
  { value: 'DONE', label: 'Выполнены' },
  { value: 'DECLINED', label: 'Отказ' },
];

export default function AdminLeadsPage() {
  const [filters, setFilters] = React.useState<Filters>({
    status: 'ALL',
    q: '',
    dateFrom: '',
    dateTo: '',
  });
  const [items, setItems] = React.useState<Lead[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [selectedId, setSelectedId] = React.useState<string | null>(null);

  // debounce для поиска
  const [qInput, setQInput] = React.useState(filters.q);
  React.useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, q: qInput })), 350);
    return () => clearTimeout(t);
  }, [qInput]);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const params = new URLSearchParams();
      if (filters.status && filters.status !== 'ALL') params.set('status', filters.status);
      if (filters.q) params.set('q', filters.q);
      if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
      if (filters.dateTo) params.set('dateTo', filters.dateTo);
      const data = await api<{ items: Lead[] }>(`/api/admin/leads?${params.toString()}`);
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить заявки');
    } finally {
      setLoading(false);
    }
  }, [filters]);

  React.useEffect(() => {
    load();
  }, [load]);

  const resetFilters = () => {
    setFilters({ status: 'ALL', q: '', dateFrom: '', dateTo: '' });
    setQInput('');
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Заявки</h1>
          <p className="text-sm text-muted-foreground">
            Обработка обращений клиентов · {items.length} найдено
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
          <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
        </Button>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-4 space-y-3">
          <Tabs value={filters.status} onValueChange={(v) => setFilters((f) => ({ ...f, status: v }))}>
            <TabsList className="flex flex-wrap h-auto">
              {STATUS_TABS.map((t) => (
                <TabsTrigger key={t.value} value={t.value} className="text-xs sm:text-sm">
                  {t.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto_auto]">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по имени, телефону, комментарию…"
                className="pl-8"
                value={qInput}
                onChange={(e) => setQInput(e.target.value)}
              />
            </div>
            <Input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters((f) => ({ ...f, dateFrom: e.target.value }))}
              className="md:w-44"
              aria-label="Дата от"
            />
            <Input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters((f) => ({ ...f, dateTo: e.target.value }))}
              className="md:w-44"
              aria-label="Дата до"
            />
            <Button variant="ghost" size="sm" onClick={resetFilters} className="gap-1">
              <X className="size-3.5" /> Сбросить
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Таблица */}
      <Card>
        <CardContent className="p-0">
          {err && (
            <div className="p-6 text-sm text-destructive text-center">
              {err}
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={load}>Повторить</Button>
              </div>
            </div>
          )}
          {!err && loading && (
            <div className="p-12 flex items-center justify-center text-muted-foreground">
              <Loader2 className="size-5 mr-2 animate-spin text-primary" /> Загрузка…
            </div>
          )}
          {!err && !loading && items.length === 0 && (
            <div className="p-12 text-center text-muted-foreground">
              <Inbox className="size-7 mx-auto mb-2 opacity-50" />
              <div className="text-sm">Заявок не найдено</div>
            </div>
          )}
          {!err && !loading && items.length > 0 && (
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-28">Создана</TableHead>
                    <TableHead>Клиент</TableHead>
                    <TableHead className="w-32">Телефон</TableHead>
                    <TableHead className="w-32">Мероприятие</TableHead>
                    <TableHead>Фотозона</TableHead>
                    <TableHead className="w-32">Источник</TableHead>
                    <TableHead className="w-32">Статус</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((l) => (
                    <TableRow
                      key={l.id}
                      onClick={() => setSelectedId(l.id)}
                      className="cursor-pointer hover:bg-accent/50"
                    >
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDateShort(l.createdAt)}
                      </TableCell>
                      <TableCell className="font-medium">{l.name || '—'}</TableCell>
                      <TableCell className="text-xs">{l.phone}</TableCell>
                      <TableCell className="text-xs">{formatDateShort(l.eventDate)}</TableCell>
                      <TableCell className="text-sm">
                        {l.photozone?.title || <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {l.source || '—'}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={LEAD_STATUS_STYLES[l.status as LeadStatus]}
                        >
                          {LEAD_STATUS_LABEL[l.status as LeadStatus]}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <LeadDetailDialog
        leadId={selectedId}
        onClose={() => setSelectedId(null)}
        onSaved={() => {
          load();
        }}
      />
    </div>
  );
}

// ============ Диалог деталей ============

function LeadDetailDialog({
  leadId,
  onClose,
  onSaved,
}: {
  leadId: string | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [lead, setLead] = React.useState<Lead | null>(null);
  const [photozones, setPhotozones] = React.useState<PhotoZone[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [status, setStatus] = React.useState<LeadStatus>('NEW');
  const [managerNote, setManagerNote] = React.useState('');
  const [photozoneId, setPhotozoneId] = React.useState<string>('');
  const [saving, setSaving] = React.useState(false);
  const [conflictWarn, setConflictWarn] = React.useState(false);

  // загрузка деталей
  React.useEffect(() => {
    if (!leadId) {
      setLead(null);
      return;
    }
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const [data, pzRes] = await Promise.all([
          api<Lead>(`/api/admin/leads/${leadId}`),
          api<{ items: PhotoZone[] }>('/api/admin/photozones'),
        ]);
        if (cancelled) return;
        setLead(data);
        setStatus((data.status as LeadStatus) || 'NEW');
        setManagerNote(data.managerNote || '');
        setPhotozoneId(data.photozoneId || data.photozone?.id || '');
        setPhotozones(pzRes.items || []);
      } catch (e: any) {
        toast.error(e?.message || 'Не удалось загрузить заявку');
        onClose();
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [leadId, onClose]);

  const save = async () => {
    if (!lead) return;
    setSaving(true);
    setConflictWarn(false);
    try {
      await api('/api/admin/leads', {
        method: 'PATCH',
        body: JSON.stringify({
          id: lead.id,
          status,
          managerNote,
          photozoneId: photozoneId || null,
        }),
      });
      toast.success('Заявка обновлена');
      onSaved();
      onClose();
    } catch (e: any) {
      if (e?.status === 409) {
        setConflictWarn(true);
        toast.error('Конфликт: фотозона занята на эту дату');
      } else {
        toast.error(e?.message || 'Не удалось сохранить');
      }
    } finally {
      setSaving(false);
    }
  };

  const open = !!leadId;
  const phone = lead?.phone || '';
  const leadName = lead?.name || '';

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Заявка · {lead ? formatDateRu(lead.createdAt) : ''}</DialogTitle>
          <DialogDescription>
            {lead ? `ID: ${lead.id}` : 'Загрузка…'}
          </DialogDescription>
        </DialogHeader>

        {loading && (
          <div className="py-10 flex items-center justify-center text-muted-foreground">
            <Loader2 className="size-5 mr-2 animate-spin text-primary" /> Загрузка…
          </div>
        )}

        {!loading && lead && (
          <div className="space-y-4">
            {/* Контактные данные */}
            <div className="grid sm:grid-cols-2 gap-3">
              <Card>
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Клиент</div>
                  <div className="font-medium text-base">{lead.name || '—'}</div>
                  <div className="text-sm">{lead.phone}</div>
                  {lead.occasion && (
                    <div className="text-xs text-muted-foreground">Повод: {lead.occasion}</div>
                  )}
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 space-y-2">
                  <div>
                    <div className="text-xs text-muted-foreground">Дата мероприятия</div>
                    <div className="font-medium">{formatDateRu(lead.eventDate)}</div>
                  </div>
                  {lead.priceEstimate != null && (
                    <div>
                      <div className="text-xs text-muted-foreground">Оценка стоимости</div>
                      <div className="font-medium">{formatPrice(lead.priceEstimate)}</div>
                    </div>
                  )}
                  <div className="flex gap-2 pt-1">
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <a href={telLink(phone)} target="_blank" rel="noreferrer">
                        <Phone className="size-3.5" /> Позвонить
                      </a>
                    </Button>
                    <Button asChild size="sm" variant="outline" className="gap-1.5">
                      <a
                        href={waLink(
                          phone,
                          `Здравствуйте, ${leadName}! Пишу по поводу аренды фотозоны на ${formatDateRu(
                            lead.eventDate
                          )}.`
                        )}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <MessageCircle className="size-3.5" /> WhatsApp
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Источник */}
            <div className="text-xs text-muted-foreground space-y-0.5">
              <div>
                Источник: <span className="text-foreground">{lead.source || '—'}</span>
                {lead.sourcePage && (
                  <span> · страница <code className="font-mono">{lead.sourcePage}</code></span>
                )}
              </div>
              {lead.manager && (
                <div>Менеджер: <span className="text-foreground">{lead.manager.name}</span></div>
              )}
            </div>

            {/* Комментарий клиента */}
            {lead.comment && (
              <div className="rounded-md bg-muted/60 p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-1">Комментарий клиента</div>
                {lead.comment}
              </div>
            )}

            {/* Бронирования */}
            {lead.bookings && lead.bookings.length > 0 && (
              <div className="rounded-md border p-3 text-sm">
                <div className="text-xs text-muted-foreground mb-2">Бронирования по заявке</div>
                <ul className="space-y-1">
                  {lead.bookings.map((b: any) => (
                    <li key={b.id} className="flex justify-between gap-2">
                      <span>{b.photozone?.title || '—'}</span>
                      <span className="text-xs text-muted-foreground">
                        {formatDateShort(b.date)} · {b.status}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Форма обработки */}
            <div className="space-y-3 border-t pt-4">
              <h3 className="text-sm font-semibold">Обработка заявки</h3>

              {conflictWarn && (
                <div className="flex items-start gap-2 rounded-md bg-rose-50 border border-rose-200 text-rose-800 p-3 text-sm">
                  <AlertTriangle className="size-4 mt-0.5 shrink-0" />
                  <div>
                    <div className="font-medium">Конфликт бронирования</div>
                    <div className="text-xs">
                      Фотозона уже забронирована или заблокирована на {formatDateRu(lead.eventDate)}.
                      Выберите другую фотозону или освободите дату в календаре.
                    </div>
                  </div>
                </div>
              )}

              <div className="grid sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Статус</Label>
                  <Select value={status} onValueChange={(v) => setStatus(v as LeadStatus)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {(Object.keys(LEAD_STATUS_LABEL) as LeadStatus[]).map((s) => (
                        <SelectItem key={s} value={s}>
                          {LEAD_STATUS_LABEL[s]}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label>Фотозона</Label>
                  <Select value={photozoneId || '__none__'} onValueChange={(v) => setPhotozoneId(v === '__none__' ? '' : v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Не выбрана" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">— Не выбрана —</SelectItem>
                      {photozones.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.title} ({formatPrice(p.basePrice)})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Заметка менеджера</Label>
                <Textarea
                  rows={3}
                  value={managerNote}
                  onChange={(e) => setManagerNote(e.target.value)}
                  placeholder="Позвонил, обсудили детали, ждём предоплату…"
                />
              </div>

              {/* ПРОМОКОДЫ ЗА ОТЗЫВЫ */}
              <LeadPromoCodes leadId={lead.id} leadName={lead.name} leadPhone={lead.phone} />

              {status === 'CONFIRMED' && !photozoneId && (
                <div className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">
                  Для подтверждения нужно выбрать фотозону — на её основе будет создано бронирование.
                </div>
              )}
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving || loading} className="gap-1.5">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
