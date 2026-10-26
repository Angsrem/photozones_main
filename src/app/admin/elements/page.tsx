'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  Search,
  ImageOff,
  Save,
  Calculator,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { api } from '../_lib';
import { formatPrice } from '@/lib/format';

// ===== Типы =====
type ElementCategory = 'letter' | 'decor' | 'prop' | 'lighting' | 'service';

type ElementItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category: string;
  photozoneId?: string | null;
  isActive: boolean;
  createdAt?: string;
};

const CATEGORY_OPTIONS: { value: ElementCategory; label: string; badge: string }[] = [
  { value: 'letter', label: 'Буквы', badge: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 'decor', label: 'Декор', badge: 'bg-rose-100 text-rose-800 border-rose-300' },
  { value: 'prop', label: 'Реквизит', badge: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 'lighting', label: 'Освещение', badge: 'bg-violet-100 text-violet-800 border-violet-300' },
  { value: 'service', label: 'Услуги', badge: 'bg-sky-100 text-sky-800 border-sky-300' },
];

function categoryLabel(cat: string): string {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat;
}

function categoryBadgeClass(cat: string): string {
  return CATEGORY_OPTIONS.find((c) => c.value === cat)?.badge || 'bg-muted text-muted-foreground';
}

const emptyForm: ElementFormState = {
  name: '',
  description: '',
  price: '',
  image: '',
  category: 'decor',
  isActive: true,
};

type ElementFormState = {
  name: string;
  description: string;
  price: string;
  image: string;
  category: ElementCategory;
  isActive: boolean;
};

export default function AdminElementsPage() {
  const [items, setItems] = React.useState<ElementItem[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState<string>('all');
  const [editing, setEditing] = React.useState<ElementItem | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<ElementItem | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      // Запрашиваем ВСЕ элементы (включая неактивные). Фильтр по photozoneId=null
      // выполняется на сервере по умолчанию (without ?all=1).
      const data = await api<{ items: ElementItem[] }>('/api/admin/elements?includeInactive=1');
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить элементы');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    let list = items;
    if (categoryFilter !== 'all') {
      list = list.filter((i) => i.category === categoryFilter);
    }
    if (q) {
      const ql = q.toLowerCase();
      list = list.filter(
        (i) =>
          i.name.toLowerCase().includes(ql) ||
          (i.description || '').toLowerCase().includes(ql)
      );
    }
    return list;
  }, [items, q, categoryFilter]);

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/api/admin/elements/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Элемент удалён');
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка удаления');
    }
  };

  // inline toggle для Switch (активна) — мгновенно PATCH
  const onToggleActive = async (item: ElementItem, value: boolean) => {
    try {
      await api(`/api/admin/elements/${item.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: value }),
      });
      setItems((prev) =>
        prev.map((p) => (p.id === item.id ? { ...p, isActive: value } : p))
      );
      toast.success(value ? 'Элемент активирован' : 'Элемент скрыт');
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Calculator className="size-6 text-primary" /> Элементы калькулятора
          </h1>
          <p className="text-sm text-muted-foreground">
            Глобальные элементы калькулятора · всего {items.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
          </Button>
          <Button
            size="sm"
            onClick={() => {
              setEditing(null);
              setShowForm(true);
            }}
            className="gap-1.5"
          >
            <Plus className="size-4" /> Добавить элемент
          </Button>
        </div>
      </div>

      {/* Фильтры */}
      <Card>
        <CardContent className="p-3 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Поиск по названию или описанию…"
                className="pl-8"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
            <div className="w-full sm:w-56">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Все категории" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Все категории</SelectItem>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
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
          {!err && !loading && (
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] -mx-3 sm:mx-0">
              <Table className="min-w-[720px]">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-16">Превью</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="w-64">Описание</TableHead>
                    <TableHead className="w-28">Категория</TableHead>
                    <TableHead className="w-28">Цена</TableHead>
                    <TableHead className="w-20">Активна</TableHead>
                    <TableHead className="w-24 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-sm text-muted-foreground py-10">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((el) => (
                    <TableRow key={el.id} className="hover:bg-accent/50">
                      <TableCell>
                        {el.image ? (
                          <img
                            src={el.image}
                            alt={el.name}
                            className="size-10 rounded-md object-cover border"
                          />
                        ) : (
                          <div className="size-10 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
                            <ImageOff className="size-4" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <button
                          onClick={() => {
                            setEditing(el);
                            setShowForm(true);
                          }}
                          className="text-left font-medium hover:text-primary"
                        >
                          {el.name}
                        </button>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        <div className="line-clamp-2 max-w-xs">
                          {el.description || '—'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={`text-xs ${categoryBadgeClass(el.category)}`}>
                          {categoryLabel(el.category)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm font-medium">{formatPrice(el.price)}</TableCell>
                      <TableCell>
                        <Switch
                          checked={el.isActive}
                          onCheckedChange={(v) => onToggleActive(el, v)}
                        />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => {
                              setEditing(el);
                              setShowForm(true);
                            }}
                            title="Редактировать"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(el)}
                            title="Удалить"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {(showForm || editing) && (
        <ElementFormDialog
          element={editing}
          onClose={() => {
            setShowForm(false);
            setEditing(null);
          }}
          onSaved={() => {
            setShowForm(false);
            setEditing(null);
            load();
          }}
        />
      )}

      <AlertDialog
        open={!!deleteTarget}
        onOpenChange={(o) => !o && setDeleteTarget(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить элемент?</AlertDialogTitle>
            <AlertDialogDescription>
              Элемент «{deleteTarget?.name}» будет удалён из калькулятора без возможности восстановления.
              Составы фотозон, которые его используют, нужно будет обновить вручную.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={onDelete}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Диалог Add/Edit элемента ============
function ElementFormDialog({
  element,
  onClose,
  onSaved,
}: {
  element: ElementItem | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!element;
  const [form, setForm] = React.useState<ElementFormState>(
    element
      ? {
          name: element.name,
          description: element.description || '',
          price: String(element.price ?? ''),
          image: element.image || '',
          category: (element.category as ElementCategory) || 'decor',
          isActive: element.isActive !== false,
        }
      : emptyForm
  );
  const [saving, setSaving] = React.useState(false);

  const set = <K extends keyof ElementFormState>(k: K, v: ElementFormState[K]) =>
    setForm((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    if (!form.name.trim()) {
      toast.error('Введите название элемента');
      return;
    }
    if (!form.price || !Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      toast.error('Введите корректную цену');
      return;
    }
    const payload = {
      name: form.name.trim(),
      description: form.description.trim() || null,
      price: Number(form.price),
      image: form.image.trim() || null,
      category: form.category,
      isActive: form.isActive,
    };
    setSaving(true);
    try {
      if (isEdit && element) {
        await api(`/api/admin/elements/${element.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Элемент обновлён');
      } else {
        await api('/api/admin/elements', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Элемент создан');
      }
      onSaved();
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактирование элемента' : 'Новый элемент калькулятора'}
          </DialogTitle>
          <DialogDescription>
            Глобальные элементы отображаются в публичном калькуляторе (/kalkulyator) и доступны для выбора в составе любой фотозоны.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Название *</Label>
            <Input
              value={form.name}
              onChange={(e) => set('name', e.target.value)}
              placeholder="Например, Световые буквы LOVE"
            />
          </div>

          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Textarea
              rows={2}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
              placeholder="Короткое описание (необязательно)"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Цена, ₽ *</Label>
              <Input
                type="number"
                min={0}
                value={form.price}
                onChange={(e) => set('price', e.target.value)}
                placeholder="3900"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <Select
                value={form.category}
                onValueChange={(v) => set('category', v as ElementCategory)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>URL изображения</Label>
            <Input
              value={form.image}
              onChange={(e) => set('image', e.target.value)}
              placeholder="/images/elements/love-letters.png"
              className="font-mono text-xs"
            />
            <div className="text-xs text-muted-foreground">
              Превью элемента в калькуляторе. Если пусто — будет показана иконка-заглушка.
            </div>
          </div>

          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <div className="text-sm font-medium">Активна</div>
              <div className="text-xs text-muted-foreground">
                Неактивные элементы не показываются в калькуляторе
              </div>
            </div>
            <Switch checked={form.isActive} onCheckedChange={(v) => set('isActive', v)} />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={saving}>
            Отмена
          </Button>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            {isEdit ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
