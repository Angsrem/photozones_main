'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Plus, Loader2, RefreshCw, Trash2, FileText,
  Type, AlignLeft, List, Image as ImageIcon, MousePointerClick,
  Quote, HelpCircle, BarChart3, Minus, Save, X, ArrowUp, ArrowDown, Eye, Pencil,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
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
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
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

  const editing = items.find((i) => i.id === editingId);

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <FileText className="size-6 text-primary" /> Страницы (контент)
          </h1>
          <p className="text-sm text-muted-foreground">
            Редактор текстов — меняйте заголовки, описания, FAQ без разработчика · всего {items.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="size-4" /> Обновить
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="size-4" /> Создать
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка…
        </div>
      ) : editing ? (
        <PageEditorInline
          page={editing}
          onClose={() => setEditingId(null)}
          onSaved={() => { setEditingId(null); load(); }}
        />
      ) : (
        <div className="grid gap-3">
          {items.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                Нет страниц. Нажмите «Создать».
              </CardContent>
            </Card>
          )}
          {items.map((p) => (
            <Card key={p.id} className="hover:border-primary/30 transition-colors">
              <CardContent className="p-4 flex items-center gap-3">
                <FileText className="size-5 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-medium">{p.title}</span>
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.slug}</code>
                    <Badge variant="outline" className="text-xs">{Array.isArray(p.blocks) ? p.blocks.length : 0} блоков</Badge>
                    <Badge variant={p.isPublished ? 'default' : 'secondary'} className="text-xs">{p.isPublished ? 'Опубл.' : 'Черновик'}</Badge>
                  </div>
                  {p.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{p.description}</div>}
                </div>
                <Button size="sm" variant="outline" onClick={() => setEditingId(p.id)} className="gap-1.5 shrink-0">
                  <Pencil className="size-3.5" /> Редактировать
                </Button>
                <Button size="icon" variant="ghost" onClick={() => setDeleteId(p.id)} className="shrink-0" aria-label="Удалить">
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {showCreate && (
        <CreatePageDialog
          onClose={() => setShowCreate(false)}
          onCreated={() => { setShowCreate(false); load(); }}
        />
      )}

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить страницу?</AlertDialogTitle>
            <AlertDialogDescription>Если страница используется на сайте — контент пропадёт.</AlertDialogDescription>
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

function CreatePageDialog({ onClose, onCreated }: { onClose: () => void; onCreated: () => void }) {
  const [title, setTitle] = React.useState('');
  const [slug, setSlug] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!title.trim() || !slug.trim()) return toast.error('Укажите название и slug');
    setSaving(true);
    try {
      await api('/api/admin/pages', {
        method: 'POST',
        body: JSON.stringify({ title: title.trim(), slug: slug.trim(), description: description.trim() || null, blocks: [] }),
      });
      toast.success('Страница создана');
      onCreated();
    } catch (e: any) {
      if (e?.status === 409) toast.error('Slug уже занят');
      else toast.error(e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={(o) => !o && onClose()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Новая страница</AlertDialogTitle>
          <AlertDialogDescription>
            Slug — ключ для получения контента. Например «svadby-hero», «ceny-faq».
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="np-title">Название *</Label>
            <Input id="np-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Свадьбы — Hero" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-slug">Slug *</Label>
            <Input id="np-slug" value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="svadby-hero" className="font-mono" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="np-desc">Описание</Label>
            <Input id="np-desc" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Где используется" />
          </div>
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel>Отмена</AlertDialogCancel>
          <AlertDialogAction onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Создать
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// Inline-редактор: открывается вместо списка, с визуальными блоками
function PageEditorInline({ page, onClose, onSaved }: { page: Page; onClose: () => void; onSaved: () => void }) {
  const [title, setTitle] = React.useState(page.title);
  const [slug, setSlug] = React.useState(page.slug);
  const [description, setDescription] = React.useState(page.description || '');
  const [blocks, setBlocks] = React.useState<Block[]>(Array.isArray(page.blocks) ? page.blocks : []);
  const [isPublished, setIsPublished] = React.useState(page.isPublished);
  const [saving, setSaving] = React.useState(false);

  const addBlock = (type: Block['type']) => {
    setBlocks((b) => [...b, newBlock(type)]);
    toast.success(`Добавлен блок: ${BLOCK_TYPES.find((x) => x.type === type)?.label}`);
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

  const save = async () => {
    if (!title.trim() || !slug.trim()) return toast.error('Укажите название и slug');
    setSaving(true);
    try {
      const payload = { title: title.trim(), slug: slug.trim(), description: description.trim() || null, blocks, isPublished };
      await api(`/api/admin/pages/${page.id}`, { method: 'PATCH', body: JSON.stringify(payload) });
      toast.success('Сохранено');
      onSaved();
    } catch (e: any) {
      if (e?.status === 409) toast.error('Slug уже занят');
      else toast.error(e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Шапка редактора */}
      <div className="flex items-center justify-between gap-3 flex-wrap sticky top-0 z-10 bg-background/95 backdrop-blur py-2 border-b">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" onClick={onClose} className="gap-1.5">
            <X className="size-4" /> Назад к списку
          </Button>
          <span className="text-sm text-muted-foreground">Редактирование:</span>
          <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{slug}</code>
        </div>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            Опубликован
          </label>
          <Button onClick={save} disabled={saving} className="gap-1.5">
            {saving ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
            Сохранить
          </Button>
        </div>
      </div>

      {/* Метаданные */}
      <Card>
        <CardContent className="p-4 grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Название</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Slug</Label>
            <Input value={slug} onChange={(e) => setSlug(e.target.value)} className="font-mono" />
          </div>
          <div className="space-y-1.5 col-span-2">
            <Label>Описание (для админки)</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        </CardContent>
      </Card>

      {/* Панель добавления блоков */}
      <Card>
        <CardContent className="p-3">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">Добавить блок:</div>
          <div className="flex flex-wrap gap-1.5">
            {BLOCK_TYPES.map((bt) => (
              <Button key={bt.type} variant="outline" size="sm" onClick={() => addBlock(bt.type)} className="gap-1.5 h-8">
                <bt.icon className="size-3.5" /> {bt.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Блоки — inline редактор */}
      {blocks.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground border border-dashed">
            Нет блоков. Добавьте первый блок кнопкой выше.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {blocks.map((blk, i) => (
            <BlockEditorInline
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

      {/* Превью */}
      <Card>
        <CardContent className="p-4">
          <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-1.5">
            <Eye className="size-3.5" /> Превью
          </div>
          <div className="space-y-3 rounded-lg bg-muted/30 p-4">
            {blocks.map((blk, i) => <BlockPreview key={i} block={blk} />)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function BlockEditorInline({ block, index, total, onChange, onRemove, onMove }: {
  block: Block; index: number; total: number;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void; onMove: (dir: -1 | 1) => void;
}) {
  const meta = BLOCK_TYPES.find((b) => b.type === block.type)!;
  const Icon = meta.icon;

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex flex-col">
            <Button variant="ghost" size="icon" className="size-6" onClick={() => onMove(-1)} disabled={index === 0} aria-label="Вверх">
              <ArrowUp className="size-3" />
            </Button>
            <Button variant="ghost" size="icon" className="size-6" onClick={() => onMove(1)} disabled={index === total - 1} aria-label="Вниз">
              <ArrowDown className="size-3" />
            </Button>
          </div>
          <Icon className="size-4 text-primary" />
          <span className="text-sm font-medium flex-1">{meta.label}</span>
          <Badge variant="outline" className="text-xs">#{index + 1}</Badge>
          <Button variant="ghost" size="icon" className="size-7" onClick={onRemove} aria-label="Удалить">
            <X className="size-3.5 text-destructive" />
          </Button>
        </div>

        <div className="pl-7">
          {block.type === 'heading' && (
            <div className="flex gap-2">
              <Select value={String(block.level || 2)} onValueChange={(v) => onChange({ level: Number(v) as any })}>
                <SelectTrigger className="w-20 h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">H1</SelectItem>
                  <SelectItem value="2">H2</SelectItem>
                  <SelectItem value="3">H3</SelectItem>
                </SelectContent>
              </Select>
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
                Нумерованный
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
              <Input value={block.text} onChange={(e) => onChange({ text: e.target.value })} placeholder="Текст" className="text-sm" />
              <Input value={block.href} onChange={(e) => onChange({ href: e.target.value })} placeholder="/katalog" className="font-mono text-sm" />
              <Select value={block.variant || 'gold'} onValueChange={(v) => onChange({ variant: v as any })}>
                <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="gold">Золотая</SelectItem>
                  <SelectItem value="outline">Контурная</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          {block.type === 'quote' && (
            <div className="space-y-2">
              <Textarea value={block.text} onChange={(e) => onChange({ text: e.target.value })} rows={2} className="resize-none text-sm" />
              <Input value={block.author || ''} onChange={(e) => onChange({ author: e.target.value })} placeholder="Автор" className="text-sm" />
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
                <Plus className="size-3" /> Вопрос
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
                <Plus className="size-3" /> Элемент
              </Button>
            </div>
          )}
          {block.type === 'divider' && (
            <div className="text-xs text-muted-foreground italic">Горизонтальная линия</div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function BlockPreview({ block }: { block: Block }) {
  if (block.type === 'heading') {
    const Tag = (`h${block.level || 2}`) as any;
    return <Tag className="font-display">{block.text}</Tag>;
  }
  if (block.type === 'paragraph') return <p className="text-muted-foreground text-sm">{block.text}</p>;
  if (block.type === 'list') {
    return block.ordered ? (
      <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">{block.items.map((i, idx) => <li key={idx}>{i}</li>)}</ol>
    ) : (
      <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">{block.items.map((i, idx) => <li key={idx}>{i}</li>)}</ul>
    );
  }
  if (block.type === 'image') return <figure><img src={block.src} alt={block.alt || ''} className="rounded-lg max-h-32 mx-auto" />{block.caption && <figcaption className="text-xs text-center text-muted-foreground mt-1">{block.caption}</figcaption>}</figure>;
  if (block.type === 'cta') return <Button variant={block.variant === 'outline' ? 'outline' : 'default'} size="sm" className={block.variant !== 'outline' ? 'bg-gold text-primary-foreground' : ''}>{block.text}</Button>;
  if (block.type === 'quote') return <blockquote className="border-l-4 border-gold pl-3 italic text-muted-foreground text-sm">«{block.text}»{block.author && <footer className="text-xs not-italic mt-1">— {block.author}</footer>}</blockquote>;
  if (block.type === 'faq') return <div className="space-y-1.5">{block.items.map((i, idx) => <div key={idx}><div className="font-medium text-sm">{i.q}</div><div className="text-sm text-muted-foreground">{i.a}</div></div>)}</div>;
  if (block.type === 'stats') return <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">{block.items.map((i, idx) => <div key={idx} className="text-center p-2 rounded-lg bg-background"><div className="font-display text-lg text-gold">{i.value}</div><div className="text-xs text-muted-foreground">{i.label}</div></div>)}</div>;
  if (block.type === 'divider') return <hr className="border-border" />;
  return null;
}
