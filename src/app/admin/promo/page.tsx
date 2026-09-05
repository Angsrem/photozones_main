'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Plus, Loader2, RefreshCw, Trash2, Pencil, Tag, Calendar as CalIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '../_lib';

type Promo = {
  id: string;
  title: string;
  description: string | null;
  discount: number | null;
  activeFrom: string | null;
  activeTo: string | null;
  pages: string[];
  isActive: boolean;
  createdAt: string;
};

const PAGE_OPTIONS = ['/', '/katalog', '/ceny', '/svadby', '/detskie-prazdniki', '/vypusknie', '/korporativy', '/prazdniki/novyj-god', '/prazdniki/8-marta', '/prazdniki/23-fevralya'];

const empty = { title: '', description: '', discount: '', activeFrom: '', activeTo: '', pages: [] as string[], isActive: true };

export default function AdminPromoPage() {
  const [items, setItems] = React.useState<Promo[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Promo | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ items: Promo[] }>('/api/admin/promos');
      setItems(data.items);
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось загрузить');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await api(`/api/admin/promos/${deleteId}`, { method: 'DELETE' });
      toast.success('Промо удалено');
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Tag className="size-6 text-primary" /> Акции и офферы
          </h1>
          <p className="text-sm text-muted-foreground">
            Управление промо-блоками на посадочных страницах · всего {items.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="size-4" /> Обновить
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus className="size-4" /> Добавить
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка…
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Пока нет акций. Нажмите «Добавить».
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Скидка</TableHead>
                  <TableHead>Период</TableHead>
                  <TableHead>Страницы</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead className="text-right">Действия</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.title}</div>
                      {p.description && <div className="text-xs text-muted-foreground line-clamp-1">{p.description}</div>}
                    </TableCell>
                    <TableCell>{p.discount ? <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">−{p.discount}%</Badge> : '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {p.activeFrom?.slice(0, 10) || '∞'} → {p.activeTo?.slice(0, 10) || '∞'}
                    </TableCell>
                    <TableCell className="text-xs">
                      {Array.isArray(p.pages) && p.pages.length ? (
                        <div className="flex flex-wrap gap-1">
                          {p.pages.slice(0, 3).map((pg) => <Badge key={pg} variant="outline" className="text-[10px]">{pg}</Badge>)}
                          {p.pages.length > 3 && <span className="text-muted-foreground">+{p.pages.length - 3}</span>}
                        </div>
                      ) : <span className="text-muted-foreground">все</span>}
                    </TableCell>
                    <TableCell>
                      <Badge variant={p.isActive ? 'default' : 'secondary'}>{p.isActive ? 'Активна' : 'Выкл'}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => { setEditing(p); setShowForm(true); }} aria-label="Редактировать">
                        <Pencil className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(p.id)} aria-label="Удалить">
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PromoForm
          promo={editing}
          onClose={() => setShowForm(false)}
          onSaved={() => { setShowForm(false); load(); }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить акцию?</AlertDialogTitle>
            <AlertDialogDescription>Действие необратимо.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">Удалить</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function PromoForm({ promo, onClose, onSaved }: { promo: Promo | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = React.useState(() => ({
    title: promo?.title || '',
    description: promo?.description || '',
    discount: promo?.discount ? String(promo.discount) : '',
    activeFrom: promo?.activeFrom?.slice(0, 10) || '',
    activeTo: promo?.activeTo?.slice(0, 10) || '',
    pages: (promo?.pages as string[]) || [],
    isActive: promo?.isActive !== false,
  }));
  const [saving, setSaving] = React.useState(false);

  const togglePage = (pg: string) => {
    setForm((f) => ({ ...f, pages: f.pages.includes(pg) ? f.pages.filter((p) => p !== pg) : [...f.pages, pg] }));
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error('Укажите название');
    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        discount: form.discount ? Number(form.discount) : null,
        activeFrom: form.activeFrom || null,
        activeTo: form.activeTo || null,
        pages: form.pages,
        isActive: form.isActive,
      };
      if (promo) {
        await api(`/api/admin/promos/${promo.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Промо обновлено');
      } else {
        await api('/api/admin/promos', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Промо создано');
      }
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{promo ? 'Редактировать акцию' : 'Новая акция'}</DialogTitle>
          <DialogDescription>Промо-блок показывается на выбранных страницах сверху контента</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-title">Название *</Label>
            <Input id="p-title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Например: Раннее бронирование — скидка 10%" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Описание</Label>
            <Textarea id="p-desc" value={form.description} rows={2} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Короткое описание акции" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-disc">Скидка, %</Label>
              <Input id="p-disc" type="number" min="0" max="100" value={form.discount} onChange={(e) => setForm({ ...form, discount: e.target.value })} placeholder="10" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-from" className="flex items-center gap-1"><CalIcon className="size-3" /> С</Label>
              <Input id="p-from" type="date" value={form.activeFrom} onChange={(e) => setForm({ ...form, activeFrom: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-to" className="flex items-center gap-1"><CalIcon className="size-3" /> По</Label>
              <Input id="p-to" type="date" value={form.activeTo} onChange={(e) => setForm({ ...form, activeTo: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Страницы показа</Label>
            <p className="text-xs text-muted-foreground">Не выбрано = показывается везде</p>
            <div className="grid grid-cols-2 gap-2 mt-1">
              {PAGE_OPTIONS.map((pg) => (
                <label key={pg} className="flex items-center gap-2 text-sm cursor-pointer rounded-md border p-2 hover:bg-accent">
                  <input type="checkbox" checked={form.pages.includes(pg)} onChange={() => togglePage(pg)} className="accent-primary" />
                  <span className="truncate">{pg}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} id="p-active" />
            <Label htmlFor="p-active">Активна</Label>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {promo ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
