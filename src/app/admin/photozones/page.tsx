'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  Star,
  Search,
  ImageOff,
  Save,
  X,
  GripVertical,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  api,
  type PhotoZone,
  type Category,
  CATEGORY_LABEL,
} from '../_lib';
import { OCCASIONS, CATEGORIES } from '@/lib/constants';
import { formatPrice } from '@/lib/format';

const BADGES = [
  { value: '', label: 'Нет' },
  { value: 'HIT', label: 'HIT — хит' },
  { value: 'NEW', label: 'NEW — новинка' },
];

function slugify(s: string) {
  return (s || '')
    .toLowerCase()
    .replace(/[^a-z0-9а-я]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export default function AdminPhotozonesPage() {
  const [items, setItems] = React.useState<PhotoZone[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [err, setErr] = React.useState<string | null>(null);
  const [q, setQ] = React.useState('');
  const [editing, setEditing] = React.useState<PhotoZone | null>(null);
  const [creating, setCreating] = React.useState(false);
  const [deleteTarget, setDeleteTarget] = React.useState<PhotoZone | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api<{ items: PhotoZone[] }>('/api/admin/photozones');
      setItems(data.items || []);
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить фотозоны');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const filtered = React.useMemo(() => {
    if (!q) return items;
    const ql = q.toLowerCase();
    return items.filter(
      (i) =>
        i.title.toLowerCase().includes(ql) ||
        i.slug.toLowerCase().includes(ql) ||
        i.category.toLowerCase().includes(ql)
    );
  }, [items, q]);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold">Фотозоны</h1>
          <p className="text-sm text-muted-foreground">
            Управление каталогом · всего {items.length}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading} className="gap-2">
            <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} /> Обновить
          </Button>
          <Button size="sm" onClick={() => setCreating(true)} className="gap-1.5">
            <Plus className="size-4" /> Добавить
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-3">
          <div className="relative max-w-md">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Поиск по названию, slug, категории…"
              className="pl-8"
              value={q}
              onChange={(e) => setQ(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

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
            <div className="overflow-x-auto max-h-[70vh] overflow-y-auto">
              <Table>
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead className="w-16">Превью</TableHead>
                    <TableHead>Название</TableHead>
                    <TableHead className="w-32">Категория</TableHead>
                    <TableHead className="w-28">Цена</TableHead>
                    <TableHead className="w-24">Бейдж</TableHead>
                    <TableHead className="w-20">Хит</TableHead>
                    <TableHead className="w-20">Статус</TableHead>
                    <TableHead className="w-20">Элементов</TableHead>
                    <TableHead className="w-24 text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-sm text-muted-foreground py-10">
                        Ничего не найдено
                      </TableCell>
                    </TableRow>
                  )}
                  {filtered.map((p) => (
                    <TableRow key={p.id} className="hover:bg-accent/50">
                      <TableCell>
                        {p.images?.[0] ? (
                          <img
                            src={p.images[0]}
                            alt={p.title}
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
                          onClick={() => setEditing(p)}
                          className="text-left font-medium hover:text-primary"
                        >
                          {p.title}
                        </button>
                        <div className="text-xs text-muted-foreground font-mono">{p.slug}</div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {CATEGORY_LABEL[p.category as Category] || p.category}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatPrice(p.basePrice)}</TableCell>
                      <TableCell>
                        {p.badge ? (
                          <Badge
                            variant="secondary"
                            className={
                              p.badge === 'HIT'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-800'
                            }
                          >
                            {p.badge}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {p.hit ? (
                          <Star className="size-4 fill-amber-400 text-amber-500" />
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            p.isActive
                              ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                              : 'bg-muted text-muted-foreground'
                          }
                        >
                          {p.isActive ? 'активна' : 'скрыта'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {p._count?.elements ?? '—'}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8"
                            onClick={() => setEditing(p)}
                            title="Редактировать"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-8 text-muted-foreground hover:text-destructive"
                            onClick={() => setDeleteTarget(p)}
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

      {(editing || creating) && (
        <PhotozoneEditor
          photozone={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
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
            <AlertDialogTitle>Удалить фотозону?</AlertDialogTitle>
            <AlertDialogDescription>
              Фотозона «{deleteTarget?.title}» будет удалена без возможности восстановления.
              Связанные заявки сохранятся, но потеряют ссылку на фотозону.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={async () => {
                if (!deleteTarget) return;
                try {
                  await api(`/api/admin/photozones/${deleteTarget.id}`, { method: 'DELETE' });
                  toast.success('Фотозона удалена');
                  load();
                } catch (e: any) {
                  toast.error(e?.message || 'Ошибка удаления');
                } finally {
                  setDeleteTarget(null);
                }
              }}
            >
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ============ Редактор фотозоны ============
type Element = { id?: string; name: string; price: number };

function PhotozoneEditor({
  photozone,
  onClose,
  onSaved,
}: {
  photozone: PhotoZone | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!photozone;
  const [title, setTitle] = React.useState(photozone?.title || '');
  const [slug, setSlug] = React.useState(photozone?.slug || '');
  const [slugTouched, setSlugTouched] = React.useState(!!photozone?.slug);
  const [description, setDescription] = React.useState(photozone?.description || '');
  const [category, setCategory] = React.useState<Category>(
    (photozone?.category as Category) || 'FRAME'
  );
  const [occasions, setOccasions] = React.useState<string[]>(
    (photozone?.occasions as string[]) || []
  );
  const [basePrice, setBasePrice] = React.useState<string>(
    photozone?.basePrice != null ? String(photozone.basePrice) : ''
  );
  const [sizeW, setSizeW] = React.useState<string>(
    photozone?.sizeW != null ? String(photozone.sizeW) : ''
  );
  const [sizeH, setSizeH] = React.useState<string>(
    photozone?.sizeH != null ? String(photozone.sizeH) : ''
  );
  const [imagesText, setImagesText] = React.useState<string>(
    Array.isArray(photozone?.images) ? (photozone!.images as string[]).join('\n') : ''
  );
  const [includesText, setIncludesText] = React.useState<string>(
    Array.isArray(photozone?.includes) ? (photozone!.includes as string[]).join('\n') : ''
  );
  const [badge, setBadge] = React.useState<string>(photozone?.badge || '');
  const [hit, setHit] = React.useState<boolean>(!!photozone?.hit);
  const [sortOrder, setSortOrder] = React.useState<string>(
    String(photozone?.sortOrder ?? 100)
  );
  const [isActive, setIsActive] = React.useState<boolean>(
    photozone?.isActive !== false
  );
  const [elements, setElements] = React.useState<Element[]>(
    (photozone?.elements as any) || []
  );
  const [newElName, setNewElName] = React.useState('');
  const [newElPrice, setNewElPrice] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // автоген slug
  React.useEffect(() => {
    if (!slugTouched) {
      setSlug(slugify(title));
    }
  }, [title, slugTouched]);

  const toggleOccasion = (val: string) => {
    setOccasions((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val]
    );
  };

  const addElement = () => {
    if (!newElName.trim()) return;
    setElements((prev) => [
      ...prev,
      { name: newElName.trim(), price: Number(newElPrice) || 0 },
    ]);
    setNewElName('');
    setNewElPrice('');
  };

  const removeElement = (idx: number) => {
    setElements((prev) => prev.filter((_, i) => i !== idx));
  };

  const save = async () => {
    if (!title || !slug || !category || basePrice === '') {
      toast.error('Заполните название, slug, категорию и цену');
      return;
    }
    const payload: any = {
      title: title.trim(),
      slug: slug.trim(),
      description: description.trim(),
      category,
      occasions,
      basePrice: Number(basePrice),
      sizeW: sizeW ? Number(sizeW) : null,
      sizeH: sizeH ? Number(sizeH) : null,
      images: imagesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      includes: includesText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      badge: badge || null,
      hit,
      sortOrder: Number(sortOrder) || 100,
      isActive,
    };
    setSaving(true);
    try {
      if (isEdit && photozone) {
        await api(`/api/admin/photozones/${photozone.id}`, {
          method: 'PATCH',
          body: JSON.stringify(payload),
        });
        toast.success('Фотозона обновлена');
      } else {
        await api('/api/admin/photozones', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
        toast.success('Фотозона создана');
      }
      onSaved();
    } catch (e: any) {
      if (e?.status === 409) toast.error('Slug уже занят');
      else toast.error(e?.message || 'Не удалось сохранить');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? 'Редактирование фотозоны' : 'Новая фотозона'}
          </DialogTitle>
          <DialogDescription>
            Поля со звёздочкой — обязательные. Slug генерируется автоматически из названия.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Основное */}
          <div className="grid sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Название *</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Например, Love-инсталляция"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Slug *</Label>
              <Input
                value={slug}
                onChange={(e) => {
                  setSlug(e.target.value);
                  setSlugTouched(true);
                }}
                placeholder="love-installyaciya"
                className="font-mono text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Описание</Label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Короткое описание для карточки и страницы фотозоны"
            />
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Категория *</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as Category)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Цена (от), ₽ *</Label>
              <Input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="12000"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Бейдж</Label>
              <Select value={badge} onValueChange={setBadge}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {BADGES.map((b) => (
                    <SelectItem key={b.value || 'none'} value={b.value || 'none'}>
                      {b.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid sm:grid-cols-3 gap-3">
            <div className="space-y-1.5">
              <Label>Ширина, м</Label>
              <Input
                type="number"
                step="0.1"
                value={sizeW}
                onChange={(e) => setSizeW(e.target.value)}
                placeholder="3"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Высота, м</Label>
              <Input
                type="number"
                step="0.1"
                value={sizeH}
                onChange={(e) => setSizeH(e.target.value)}
                placeholder="2.2"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Порядок сортировки</Label>
              <Input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
              />
            </div>
          </div>

          {/* Поводы */}
          <div className="space-y-1.5">
            <Label>Поводы</Label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {OCCASIONS.map((o) => (
                <label
                  key={o.value}
                  className={`flex items-center gap-2 rounded-md border px-3 py-2 cursor-pointer text-sm transition-colors ${
                    occasions.includes(o.value)
                      ? 'bg-primary/10 border-primary/40'
                      : 'hover:bg-accent'
                  }`}
                >
                  <Checkbox
                    checked={occasions.includes(o.value)}
                    onCheckedChange={() => toggleOccasion(o.value)}
                  />
                  <span>{o.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Изображения */}
          <div className="space-y-1.5">
            <Label>Изображения (URL, по одному в строке)</Label>
            <Textarea
              rows={3}
              value={imagesText}
              onChange={(e) => setImagesText(e.target.value)}
              placeholder="/images/photozones/love.png"
              className="font-mono text-xs"
            />
            <div className="text-xs text-muted-foreground">
              Первое изображение — основное (превью в каталоге)
            </div>
          </div>

          {/* Что входит */}
          <div className="space-y-1.5">
            <Label>Что входит (по строке)</Label>
            <Textarea
              rows={3}
              value={includesText}
              onChange={(e) => setIncludesText(e.target.value)}
              placeholder={"Доставка по городу\nМонтаж и демонтаж\nАренда 24 часа"}
            />
          </div>

          {/* Элементы */}
          <div className="space-y-2">
            <Label>Элементы (доп. услуги)</Label>
            <div className="rounded-md border divide-y">
              {elements.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">Пока нет элементов</div>
              )}
              {elements.map((el, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 text-sm">
                  <GripVertical className="size-4 text-muted-foreground" />
                  <span className="flex-1">{el.name}</span>
                  <span className="text-muted-foreground">{formatPrice(el.price)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeElement(idx)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Название элемента"
                value={newElName}
                onChange={(e) => setNewElName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="number"
                placeholder="Цена, ₽"
                value={newElPrice}
                onChange={(e) => setNewElPrice(e.target.value)}
                className="w-32"
              />
              <Button variant="outline" onClick={addElement} className="gap-1">
                <Plus className="size-4" /> Добавить
              </Button>
            </div>
            {!isEdit && (
              <div className="text-xs text-muted-foreground">
                Примечание: элементы сохранятся после создания фотозоны (нужен её id).
                Сначала сохраните фотозону, затем добавьте элементы в повторном редактировании.
              </div>
            )}
          </div>

          {/* Переключатели */}
          <div className="grid sm:grid-cols-2 gap-3 border-t pt-4">
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Хит продаж</div>
                <div className="text-xs text-muted-foreground">
                  Показывать звезду и поднимать в выдаче
                </div>
              </div>
              <Switch checked={hit} onCheckedChange={setHit} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <div>
                <div className="text-sm font-medium">Активна</div>
                <div className="text-xs text-muted-foreground">
                  Показывать в публичном каталоге
                </div>
              </div>
              <Switch checked={isActive} onCheckedChange={setIsActive} />
            </div>
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
