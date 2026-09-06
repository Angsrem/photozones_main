'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Plus, Loader2, RefreshCw, Trash2, Pencil, FileText, Eye,
  Type, AlignLeft, List, Image as ImageIcon, MousePointerClick,
  Quote, HelpCircle, BarChart3, Minus, GripVertical, Save, X, ArrowUp, ArrowDown,
} from 'lucide-react';
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

type Block =
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'cta'; text: string; href: string; variant?: 'gold' | 'outline' }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | { type: 'divider' };

type Page = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  blocks: Block[];
  isPublished: boolean;
  updatedAt: string;
};

const BLOCK_TYPES: { type: Block['type']; label: string; icon: any }[] = [
  { type: 'heading', label: 'Заголовок', icon: Type },
  { type: 'paragraph', label: 'Абзац', icon: AlignLeft },
  { type: 'list', label: 'Список', icon: List },
  { type: 'image', label: 'Изображение', icon: ImageIcon },
  { type: 'cta', label: 'Кнопка (CTA)', icon: MousePointerClick },
  { type: 'quote', label: 'Цитата', icon: Quote },
  { type: 'faq', label: 'FAQ', icon: HelpCircle },
  { type: 'stats', label: 'Статистика', icon: BarChart3 },
  { type: 'divider', label: 'Разделитель', icon: Minus },
];

function newBlock(type: Block['type']): Block {
  switch (type) {
    case 'heading': return { type: 'heading', text: 'Новый заголовок', level: 2 };
    case 'paragraph': return { type: 'paragraph', text: 'Текст абзаца...' };
    case 'list': return { type: 'list', items: ['Первый пункт', 'Второй пункт'], ordered: false };
    case 'image': return { type: 'image', src: '/images/hero.jpg', alt: '', caption: '' };
    case 'cta': return { type: 'cta', text: 'Заказать', href: '#', variant: 'gold' };
    case 'quote': return { type: 'quote', text: 'Текст цитаты', author: '' };
    case 'faq': return { type: 'faq', items: [{ q: 'Вопрос?', a: 'Ответ.' }] };
    case 'stats': return { type: 'stats', items: [{ value: '100+', label: 'мероприятий' }] };
    case 'divider': return { type: 'divider' };
  }
}

export default function AdminPagesPage() {
  const [items, setItems] = React.useState<Page[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [editing, setEditing] = React.useState<Page | null>(null);
  const [showForm, setShowForm] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ items: Page[] }>('/api/admin/pages');
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
      await api(`/api/admin/pages/${deleteId}`, { method: 'DELETE' });
      toast.success('Страница удалена');
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <FileText className="size-6 text-primary" /> Страницы (контент)
          </h1>
          <p className="text-sm text-muted-foreground">
            Редактор текстов и блоков — меняйте контент без разработчика · всего {items.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="size-4" /> Обновить
          </Button>
          <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
            <Plus className="size-4" /> Создать страницу
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
            <div className="py-16 text-center">
              <FileText className="size-12 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground mb-4">Пока нет страниц. Создайте первую.</p>
              <Button size="sm" onClick={() => { setEditing(null); setShowForm(true); }} className="gap-2">
                <Plus className="size-4" /> Создать страницу
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Блоков</TableHead>
                  <TableHead>Статус</TableHead>
                  <TableHead>Обновлено</TableHead>
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
                    <TableCell><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.slug}</code></TableCell>
                    <TableCell><Badge variant="outline">{Array.isArray(p.blocks) ? p.blocks.length : 0}</Badge></TableCell>
                    <TableCell><Badge variant={p.isPublished ? 'default' : 'secondary'}>{p.isPublished ? 'Опубл.' : 'Черновик'}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{new Date(p.updatedAt).toLocaleDateString('ru-RU')}</TableCell>
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
        <PageForm page={editing} onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); load(); }} />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
            <AlertDialogDescription>Действие необратимо. Если страница используется на сайте — контент пропадёт.</AlertDialogDescription>
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

function PageForm({ page, onClose, onSaved }: { page: Page | null; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = React.useState(page?.title || '');
  const [slug, setSlug] = React.useState(page?.slug || '');
  const [description, setDescription] = React.useState(page?.description || '');
  const [blocks, setBlocks] = React.useState<Block[]>(Array.isArray(page?.blocks) ? page!.blocks : []);
  const [isPublished, setIsPublished] = React.useState(page?.isPublished !== false);
  const [saving, setSaving] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);

  const save = async () => {
    if (!title.trim() || !slug.trim()) return toast.error('Укажите название и slug');
    setSaving(true);
    try {
      const payload = { title: title.trim(), slug: slug.trim(), description: description.trim() || null, blocks, isPublished };
      if (page) {
        await api(`/api/admin/pages/${page.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
        toast.success('Страница обновлена');
      } else {
        await api('/api/admin/pages', { method: 'POST', body: JSON.stringify(payload) });
        toast.success('Страница создана');
      }
      onSaved();
    } catch (e: any) {
      if (e?.status === 409) toast.error('Slug уже занят');
      else toast.error(e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  const addBlock = (type: Block['type']) => {
    setBlocks((b) => [...b, newBlock(type)]);
  };
  const removeBlock = (i: number) => setBlocks((b) => b.filter((_, idx) => idx !== i));
  const moveBlock = (i: number, dir: -1 | 1) => {
    setBlocks((b) => {
      const arr = [...b];
      const j = i + dir;
      if (j < 0 || j >= arr.length) return arr;
      [arr[i], arr[j]] = [arr[j], arr[i]];
      return arr;
    });
  };
  const updateBlock = (i: number, patch: Partial<Block>) => {
    setBlocks((b) => b.map((blk, idx) => idx === i ? { ...blk, ...patch } as Block : blk));
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{page ? 'Редактировать страницу' : 'Новая страница'}</DialogTitle>
          <DialogDescription>
            Блочный редактор. Slug — ключ для получения контента на сайте (например «home-intro», «ceny-guarantee»).
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto pr-1 space-y-4">
          {/* Метаданные */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="p-title">Название *</Label>
              <Input id="p-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Главная — вводный блок" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="p-slug">Slug *</Label>
              <Input id="p-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="home-intro" className="font-mono" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="p-desc">Описание (для админки)</Label>
            <Input id="p-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Где используется этот блок" />
          </div>

          {/* Панель добавления блоков */}
          <div className="rounded-xl border border-border bg-card/50 p-3">
            <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Добавить блок:</div>
            <div className="flex flex-wrap gap-1.5">
              {BLOCK_TYPES.map((bt) => (
                <Button key={bt.type} variant="outline" size="sm" onClick={() => addBlock(bt.type)} className="gap-1.5 h-8">
                  <bt.icon className="size-3.5" /> {bt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Список блоков */}
          {blocks.length === 0 ? (
            <div className="text-center py-10 text-sm text-muted-foreground border border-dashed border-border rounded-xl">
              Нет блоков. Добавьте первый блок кнопкой выше.
            </div>
          ) : (
            <div className="space-y-2">
              {blocks.map((blk, i) => (
                <BlockEditor
                  key={i}
                  block={blk}
                  index={i}
                  total={blocks.length}
                  onChange={(patch) => updateBlock(i, patch)}
                  onRemove={() => removeBlock(i)}
                  onMove={(dir) => moveBlock(i, dir)}
                />
              ))}
            </div>
          )}
        </div>

        <DialogFooter className="border-t pt-4 flex !justify-between">
          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} id="p-pub" />
            <Label htmlFor="p-pub" className="text-sm cursor-pointer">Опубликован</Label>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setShowPreview(true)} className="gap-2">
              <Eye className="size-4" /> Превью
            </Button>
            <Button variant="outline" onClick={onClose}>Отмена</Button>
            <Button onClick={save} disabled={saving}>
              {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : <Save className="size-4 mr-2" />}
              {page ? 'Сохранить' : 'Создать'}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>

      {showPreview && (
        <Dialog open onOpenChange={setShowPreview}>
          <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Превью: {title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-2">
              {blocks.map((blk, i) => <BlockPreview key={i} block={blk} />)}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowPreview(false)}>Закрыть</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
}

function BlockEditor({ block, index, total, onChange, onRemove, onMove }: {
  block: Block; index: number; total: number;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void;
}) {
  const meta = BLOCK_TYPES.find((b) => b.type === block.type)!;
  const Icon = meta.icon;

  return (
    <div className="rounded-xl border border-border bg-background p-3">
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col">
          <Button variant="ghost" size="icon" className="size-5" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Вверх">
            <ArrowUp className="size-3" />
          </Button>
          <Button variant="ghost" size="icon" className="size-5" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Вниз">
            <ArrowDown className="size-3" />
          </Button>
        </div>
        <Icon className="size-4 text-primary" />
        <span className="text-sm font-medium flex-1">{meta.label}</span>
        <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
        <Button variant="ghost" size="icon" className="size-7" onClick={onRemove} aria-label="Удалить блок">
          <X className="size-3.5 text-destructive" />
        </Button>
      </div>

      <div className="pl-7">
        {block.type === 'heading' && (
          <div className="flex gap-2">
            <select
              value={block.level || 2}
              onChange={(e) => onChange({ level: Number(e.target.value) as any })}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value={1}>H1</option>
              <option value={2}>H2</option>
              <option value={3}>H3</option>
            </select>
            <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} className="flex-1" />
          </div>
        )}
        {block.type === 'paragraph' && (
          <Textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} rows={3} className="resize-none" />
        )}
        {block.type === 'list' && (
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-xs text-muted-foreground">
              <input type="checkbox" checked={!!block.ordered} onChange={(e) => onChange({ ordered: e.target.checked })} />
              Нумерованный список
            </label>
            <Textarea
              value={block.items.join('\n')}
              onChange={(e) => onChange({ items: e.target.value.split('\n').filter(Boolean) })}
              rows={4}
              className="resize-none text-sm"
              placeholder="Каждый пункт с новой строки"
            />
          </div>
        )}
        {block.type === 'image' && (
          <div className="space-y-2">
            <Input value={block.src} onChange={(e) => onChange({ src: e.target.value })} placeholder="/images/..." className="font-mono text-sm" />
            <div className="grid grid-cols-2 gap-2">
              <Input value={block.alt || ''} onChange={(e) => onChange({ alt: e.target.value })} placeholder="alt-текст" className="text-sm" />
              <Input value={block.caption || ''} onChange={(e) => onChange({ caption: e.target.value })} placeholder="подпись" className="text-sm" />
            </div>
          </div>
        )}
        {block.type === 'cta' && (
          <div className="grid grid-cols-3 gap-2">
            <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Текст кнопки" className="text-sm" />
            <Input value={block.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="/katalog или #" className="font-mono text-sm" />
            <select
              value={block.variant || 'gold'}
              onChange={(e) => onChange({ variant: e.target.value as any })}
              className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            >
              <option value="gold">Золотая</option>
              <option value="outline">Контурная</option>
            </select>
          </div>
        )}
        {block.type === 'quote' && (
          <div className="space-y-2">
            <Textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} rows={2} className="resize-none text-sm" />
            <Input value={block.author || ''} onChange={(e) => onChange({ author: e.target.value })} placeholder="Автор (необязательно)" className="text-sm" />
          </div>
        )}
        {block.type === 'faq' && (
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2 items-start">
                <Input value={item.q} onChange={(e) => { const items = [...block.items]; items[i] = { ...items[i], q: e.target.value }; onChange({ items }); }} placeholder="Вопрос" className="text-sm" />
                <Textarea value={item.a} onChange={(e) => { const items = [...block.items]; items[i] = { ...items[i], a: e.target.value }; onChange({ items }); }} rows={1} className="resize-none text-sm" placeholder="Ответ" />
                <Button variant="ghost" size="icon" className="size-8" onClick={() => onChange({ items: block.items.filter((_, idx) => idx !== i) })}>
                  <X className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => onChange({ items: [...block.items, { q: '', a: '' }] })} className="gap-1.5 h-7">
              <Plus className="size-3" /> Добавить вопрос
            </Button>
          </div>
        )}
        {block.type === 'stats' && (
          <div className="space-y-2">
            {block.items.map((item, i) => (
              <div key={i} className="grid grid-cols-[1fr_2fr_auto] gap-2">
                <Input value={item.value} onChange={(e) => { const items = [...block.items]; items[i] = { ...items[i], value: e.target.value }; onChange({ items }); }} placeholder="100+" className="text-sm" />
                <Input value={item.label} onChange={(e) => { const items = [...block.items]; items[i] = { ...items[i], label: e.target.value }; onChange({ items }); }} placeholder="мероприятий" className="text-sm" />
                <Button variant="ghost" size="icon" className="size-8" onClick={() => onChange({ items: block.items.filter((_, idx) => idx !== i) })}>
                  <X className="size-3.5 text-destructive" />
                </Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={() => onChange({ items: [...block.items, { value: '', label: '' }] })} className="gap-1.5 h-7">
              <Plus className="size-3" /> Добавить
            </Button>
          </div>
        )}
        {block.type === 'divider' && (
          <div className="text-xs text-muted-foreground italic">Горизонтальная линия</div>
        )}
      </div>
    </div>
  );
}

function BlockPreview({ block }: { block: Block }) {
  if (block.type === 'heading') {
    const Tag = (`h${block.level || 2}`) as any;
    return <Tag className="font-display">{block.text}</Tag>;
  }
  if (block.type === 'paragraph') return <p className="text-muted-foreground">{block.text}</p>;
  if (block.type === 'list') {
    return block.ordered ? (
      <ol className="list-decimal list-inside space-y-1 text-sm">{block.items.map((i, idx) => <li key={idx}>{i}</li>)}</ol>
    ) : (
      <ul className="list-disc list-inside space-y-1 text-sm">{block.items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    );
  }
  if (block.type === 'image') return <figure><img src={block.src} alt={block.alt || ''} className="rounded-xl max-h-48 mx-auto" />{block.caption && <figcaption className="text-xs text-center text-muted-foreground mt-1">{block.caption}</figcaption>}</figure>;
  if (block.type === 'cta') return <Button variant={block.variant === 'outline' ? 'outline' : 'default'} className={block.variant === 'gold' ? 'bg-gold text-primary-foreground' : ''}>{block.text}</Button>;
  if (block.type === 'quote') return <blockquote className="border-l-4 border-gold pl-4 italic text-muted-foreground">«{block.text}»{block.author && <footer className="text-xs not-italic mt-1">— {block.author}</footer>}</blockquote>;
  if (block.type === 'faq') return <div className="space-y-2">{block.items.map((i, idx) => <div key={idx}><div className="font-medium text-sm">{i.q}</div><div className="text-sm text-muted-foreground">{i.a}</div></div>)}</div>;
  if (block.type === 'stats') return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{block.items.map((i, idx) => <div key={idx} className="text-center p-2 rounded-lg bg-muted"><div className="font-display text-xl text-gold">{i.value}</div><div className="text-xs text-muted-foreground">{i.label}</div></div>)}</div>;
  if (block.type === 'divider') return <hr className="border-border" />;
  return null;
}
