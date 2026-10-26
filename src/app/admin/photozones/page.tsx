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
  Calculator,
  ArrowRight,
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
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] -mx-3 sm:mx-0">
              <Table className="min-w-[860px]">
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

// ====== Константы расчёта калькулятора (синхронизированы с /kalkulyator) ======
const CALC_DELIVERY = 2000;
const CALC_MONTAGE_FIX = 3000;
const CALC_MONTAGE_THRESHOLD = 15000; // если sum+delivery >= 15000 → 20% надбавка
const CALC_MONTAGE_RATIO = 0.20;
const CALC_DISCOUNT = 0.85; // -15% для карточки фотозоны

type GlobalElement = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  image?: string | null;
  category: string;
  isActive: boolean;
};

type CompositionItem = { elementId: string; qty: number };

// Категории элементов для блока состава
const COMPOSITION_CATEGORY_OPTIONS: { value: string; label: string }[] = [
  { value: 'letter', label: 'Буквы' },
  { value: 'decor', label: 'Декор' },
  { value: 'prop', label: 'Реквизит' },
  { value: 'lighting', label: 'Освещение' },
  { value: 'service', label: 'Услуги' },
];

function compositionCategoryLabel(cat: string): string {
  return COMPOSITION_CATEGORY_OPTIONS.find((c) => c.value === cat)?.label || cat;
}

// Главная формула: calc_price = sum + delivery + montage
function computeCalcPrice(sum: number): { sum: number; delivery: number; montage: number; total: number } {
  const delivery = CALC_DELIVERY;
  const base = sum + delivery;
  const montage = base >= CALC_MONTAGE_THRESHOLD
    ? Math.max(CALC_MONTAGE_FIX, Math.round(base * CALC_MONTAGE_RATIO))
    : CALC_MONTAGE_FIX;
  return { sum, delivery, montage, total: base + montage };
}

// basePrice = «психологическая» цена = round(calc × 0.85 / 10) × 10 − 10
function computeBasePriceFromCalc(calcPrice: number): number {
  return Math.round(Math.round(calcPrice * CALC_DISCOUNT) / 10) * 10 - 10;
}

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
  const [videosText, setVideosText] = React.useState<string>(
    Array.isArray(photozone?.videos) ? (photozone!.videos as string[]).join('\n') : ''
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
  const [elements, setElements] = React.useState<{ id?: string; name: string; price: number; description?: string | null; image?: string | null; category?: string; isActive?: boolean }[]>(
    (photozone?.elements as any) || []
  );
  const [newElName, setNewElName] = React.useState('');
  const [newElPrice, setNewElPrice] = React.useState('');
  const [newElCategory, setNewElCategory] = React.useState('decor');
  const [newElImage, setNewElImage] = React.useState('');
  const [newElDesc, setNewElDesc] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  // ===== Состав фотозоны из калькулятора =====
  // Глобальные элементы (photozoneId IS NULL) — загружаются один раз.
  const [globalElements, setGlobalElements] = React.useState<GlobalElement[]>([]);
  const [globalElementsLoading, setGlobalElementsLoading] = React.useState(false);
  const [compQuery, setCompQuery] = React.useState('');
  const [compCategory, setCompCategory] = React.useState<string>('all');
  // состав: map elementId → qty (undefined = не выбран)
  const [compositionMap, setCompositionMap] = React.useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    if (Array.isArray(photozone?.composition)) {
      for (const c of photozone!.composition as CompositionItem[]) {
        if (c && c.elementId) init[c.elementId] = Number(c.qty) > 0 ? Math.floor(Number(c.qty)) : 1;
      }
    }
    return init;
  });

  // Загрузка глобальных элементов при открытии редактора
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setGlobalElementsLoading(true);
      try {
        const data = await api<{ items: GlobalElement[] }>(
          '/api/admin/elements?includeInactive=1'
        );
        if (!cancelled) setGlobalElements(data.items || []);
      } catch (e: any) {
        if (!cancelled) toast.error(e?.message || 'Не удалось загрузить элементы калькулятора');
      } finally {
        if (!cancelled) setGlobalElementsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Отфильтрованный список глобальных элементов для UI
  const filteredGlobalElements = React.useMemo(() => {
    let list = globalElements;
    if (compCategory !== 'all') list = list.filter((e) => e.category === compCategory);
    if (compQuery) {
      const ql = compQuery.toLowerCase();
      list = list.filter(
        (e) =>
          e.name.toLowerCase().includes(ql) ||
          (e.description || '').toLowerCase().includes(ql)
      );
    }
    return list;
  }, [globalElements, compQuery, compCategory]);

  // Выбранные элементы + количества
  const selectedComposition = React.useMemo<CompositionItem[]>(() => {
    return Object.entries(compositionMap)
      .filter(([, qty]) => qty > 0)
      .map(([elementId, qty]) => ({ elementId, qty }));
  }, [compositionMap]);

  // Расчёт цены
  const compositionBreakdown = React.useMemo(() => {
    let sumElements = 0;
    for (const { elementId, qty } of selectedComposition) {
      const el = globalElements.find((e) => e.id === elementId);
      if (el) sumElements += el.price * qty;
    }
    const calc = computeCalcPrice(sumElements);
    const autoBasePrice = computeBasePriceFromCalc(calc.total);
    return { ...calc, autoBasePrice };
  }, [selectedComposition, globalElements]);

  const toggleCompositionItem = (elementId: string) => {
    setCompositionMap((prev) => {
      const next = { ...prev };
      if (next[elementId]) delete next[elementId];
      else next[elementId] = 1;
      return next;
    });
  };

  const setCompositionQty = (elementId: string, qty: number) => {
    setCompositionMap((prev) => ({
      ...prev,
      [elementId]: qty > 0 ? Math.floor(qty) : 1,
    }));
  };

  const applyAutoBasePrice = () => {
    if (compositionBreakdown.total <= 0) {
      toast.error('Сначала выберите хотя бы один элемент');
      return;
    }
    setBasePrice(String(compositionBreakdown.autoBasePrice));
    toast.success(
      `basePrice автоматически рассчитан: ${formatPrice(compositionBreakdown.autoBasePrice)} (calc_price = ${formatPrice(compositionBreakdown.total)})`
    );
  };

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
      {
        name: newElName.trim(),
        price: Number(newElPrice) || 0,
        category: newElCategory,
        image: newElImage.trim() || null,
        description: newElDesc.trim() || null,
      } as any,
    ]);
    setNewElName('');
    setNewElPrice('');
    setNewElCategory('decor');
    setNewElImage('');
    setNewElDesc('');
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
      videos: videosText
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
      elements: elements.map((e) => ({
        id: (e as any).id,
        name: e.name,
        price: Number(e.price) || 0,
        isActive: (e as any).isActive !== false,
        category: (e as any).category || 'decor',
        image: (e as any).image || null,
        description: (e as any).description || null,
      })),
      composition: selectedComposition,
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
              placeholder="/images/photozones/love.jpg"
              className="font-mono text-xs"
            />
            <div className="text-xs text-muted-foreground">
              Первое изображение — основное (превью в каталоге)
            </div>
          </div>

          {/* Видео */}
          <div className="space-y-1.5">
            <Label>Видео (URL, по одному в строке) — необязательно</Label>
            <Textarea
              rows={2}
              value={videosText}
              onChange={(e) => setVideosText(e.target.value)}
              placeholder="/videos/love.mp4"
              className="font-mono text-xs"
            />
            <div className="text-xs text-muted-foreground">
              Видео автоплеем без звука при наведении в каталоге и карточке. Несколько видео — ротация каждые 4 сек.
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

          {/* Элементы / опции */}
          <div className="space-y-2">
            <Label>Дополнительные опции (буквы, декор, освещение, реквизит)</Label>
            <p className="text-xs text-muted-foreground break-words">Опции с категорией «Освещение» можно сделать глобальными (доступны всем фотозонам) — оставьте category=lighting. Опции группируются в карточке фотозоны по category.</p>
            <div className="rounded-md border divide-y">
              {elements.length === 0 && (
                <div className="p-3 text-xs text-muted-foreground">Пока нет опций</div>
              )}
              {elements.map((el, idx) => (
                <div key={idx} className="flex items-center gap-2 p-2 text-sm">
                  <GripVertical className="size-4 text-muted-foreground shrink-0" />
                  {el.image && <img src={el.image} alt="" className="size-8 rounded object-cover shrink-0" />}
                  <span className="flex-1 min-w-0 truncate">{el.name}</span>
                  {el.category && <Badge variant="outline" className="text-[10px] shrink-0">{el.category}</Badge>}
                  <span className="text-muted-foreground whitespace-nowrap shrink-0">{formatPrice(el.price)}</span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-7 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => removeElement(idx)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
            {/* Форма добавления новой опции */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <Input
                placeholder="Название опции *"
                value={newElName}
                onChange={(e) => setNewElName(e.target.value)}
              />
              <Input
                type="number"
                placeholder="Цена, ₽ *"
                value={newElPrice}
                onChange={(e) => setNewElPrice(e.target.value)}
              />
              <Select value={newElCategory} onValueChange={setNewElCategory}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Категория" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="letter">Буквы и цифры</SelectItem>
                  <SelectItem value="decor">Декор</SelectItem>
                  <SelectItem value="prop">Реквизит</SelectItem>
                  <SelectItem value="lighting">Освещение</SelectItem>
                  <SelectItem value="service">Доп. услуга</SelectItem>
                </SelectContent>
              </Select>
              <Input
                placeholder="URL изображения (необязательно)"
                value={newElImage}
                onChange={(e) => setNewElImage(e.target.value)}
                className="font-mono text-xs"
              />
              <Input
                placeholder="Описание (необязательно)"
                value={newElDesc}
                onChange={(e) => setNewElDesc(e.target.value)}
                className="sm:col-span-2"
              />
            </div>
            <Button variant="outline" onClick={addElement} className="gap-1 w-full">
              <Plus className="size-4" /> Добавить опцию
            </Button>
            {!isEdit && (
              <div className="text-xs text-muted-foreground">
                Примечание: элементы сохранятся после создания фотозоны (нужен её id).
                Сначала сохраните фотозону, затем добавьте элементы в повторном редактировании.
              </div>
            )}
          </div>

          {/* ===== Состав фотозоны (из калькулятора) ===== */}
          <div className="space-y-3 rounded-lg border bg-card/40 p-4">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <Calculator className="size-4 text-primary" />
                  <Label className="text-base font-semibold">
                    Состав фотозоны (из калькулятора)
                  </Label>
                </div>
                <p className="text-xs text-muted-foreground mt-1 break-words">
                  Выберите глобальные элементы калькулятора, которые входят в эту фотозону.
                  Авто-расчёт: calc_price = сумма + доставка (2000 ₽) + монтаж (3000 ₽ фикс / 20% если ≥ 15 000 ₽).
                  basePrice = calc_price × 0.85 − 10 («психологическая» цена карточки фотозоны).
                </p>
              </div>
            </div>

            {/* Фильтры */}
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  placeholder="Поиск по названию…"
                  className="pl-8"
                  value={compQuery}
                  onChange={(e) => setCompQuery(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-48">
                <Select value={compCategory} onValueChange={setCompCategory}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Все категории" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Все категории</SelectItem>
                    {COMPOSITION_CATEGORY_OPTIONS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        {c.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Список элементов */}
            <div className="rounded-md border max-h-72 overflow-y-auto divide-y">
              {globalElementsLoading && (
                <div className="p-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Загрузка элементов…
                </div>
              )}
              {!globalElementsLoading && filteredGlobalElements.length === 0 && (
                <div className="p-4 text-sm text-muted-foreground">
                  Элементы не найдены. Добавьте их в разделе «Элементы калькулятора».
                </div>
              )}
              {!globalElementsLoading &&
                filteredGlobalElements.map((el) => {
                  const qty = compositionMap[el.id] || 0;
                  const selected = qty > 0;
                  return (
                    <label
                      key={el.id}
                      className={`flex items-center gap-2 p-2 text-sm cursor-pointer transition-colors ${
                        selected ? 'bg-primary/5' : 'hover:bg-accent/40'
                      }`}
                    >
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleCompositionItem(el.id)}
                      />
                      {el.image ? (
                        <img src={el.image} alt="" className="size-8 rounded object-cover border" />
                      ) : (
                        <div className="size-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          <ImageOff className="size-3.5" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{el.name}</div>
                        {el.description && (
                          <div className="text-xs text-muted-foreground truncate">
                            {el.description}
                          </div>
                        )}
                      </div>
                      <Badge variant="outline" className="text-[10px] hidden sm:inline-flex">
                        {compositionCategoryLabel(el.category)}
                      </Badge>
                      <span className="text-sm tabular-nums text-muted-foreground whitespace-nowrap">
                        {formatPrice(el.price)}
                      </span>
                      {selected && (
                        <Input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) => setCompositionQty(el.id, Number(e.target.value))}
                          onClick={(e) => e.preventDefault()}
                          className="w-16 h-8 text-center"
                          aria-label={`Количество: ${el.name}`}
                        />
                      )}
                    </label>
                  );
                })}
            </div>

            {/* Расчёт */}
            <div className="rounded-md border bg-background p-3 space-y-1.5 text-sm">
              <div className="flex justify-between text-muted-foreground">
                <span>Сумма элементов ({selectedComposition.length} шт.)</span>
                <span className="tabular-nums">{formatPrice(compositionBreakdown.sum)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>+ Доставка</span>
                <span className="tabular-nums">{formatPrice(compositionBreakdown.delivery)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>
                  + Монтаж{' '}
                  {compositionBreakdown.sum + compositionBreakdown.delivery >= CALC_MONTAGE_THRESHOLD
                    ? '(20% от суммы)'
                    : '(фикс)'}
                </span>
                <span className="tabular-nums">{formatPrice(compositionBreakdown.montage)}</span>
              </div>
              <div className="h-px bg-border my-1" />
              <div className="flex justify-between font-medium">
                <span>calc_price</span>
                <span className="tabular-nums">{formatPrice(compositionBreakdown.total)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground">basePrice (−15%, «психологическая»)</span>
                <span className="tabular-nums font-semibold text-primary">
                  {formatPrice(compositionBreakdown.autoBasePrice)}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 pt-2">
                <div className="text-xs text-muted-foreground">
                  Текущая basePrice: <span className="font-mono">{basePrice || '—'}</span>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={applyAutoBasePrice}
                  disabled={compositionBreakdown.total <= 0}
                  className="gap-1"
                >
                  Применить автоРасчёт
                  <ArrowRight className="size-3.5" />
                </Button>
              </div>
              <div className="text-xs text-muted-foreground">
                Поле «Цена (от), ₽» в начале формы можно изменить вручную — авто-расчёт не перезаписывает его автоматически.
              </div>
            </div>
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
