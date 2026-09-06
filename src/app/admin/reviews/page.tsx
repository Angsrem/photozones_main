'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Loader2, RefreshCw, Trash2, Check, X, Star, ImageOff, Clock } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api } from '../_lib';

type Review = {
  id: string;
  author: string;
  event: string | null;
  text: string;
  photos: string[] | null;
  videos: string[] | null;
  rating: number;
  isPublished: boolean;
  createdAt: string;
};

export default function AdminReviewsPage() {
  const [items, setItems] = React.useState<Review[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [deleteId, setDeleteId] = React.useState<string | null>(null);
  const [tab, setTab] = React.useState('pending');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ items: Review[] }>('/api/admin/reviews');
      setItems(data.items);
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  const togglePublish = async (id: string, publish: boolean) => {
    try {
      await api(`/api/admin/reviews/${id}`, { method: 'PATCH', body: JSON.stringify({ isPublished: publish }) });
      toast.success(publish ? 'Отзыв опубликован' : 'Отзыв скрыт');
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  const onDelete = async () => {
    if (!deleteId) return;
    try {
      await api(`/api/admin/reviews/${deleteId}`, { method: 'DELETE' });
      toast.success('Отзыв удалён');
      setDeleteId(null);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    }
  };

  const pending = items.filter((r) => !r.isPublished);
  const published = items.filter((r) => r.isPublished);
  const current = tab === 'pending' ? pending : published;

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Star className="size-6 text-primary" /> Отзывы
          </h1>
          <p className="text-sm text-muted-foreground">
            Модерация пользовательских отзывов · всего {items.length} (на модерации: {pending.length})
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={load} className="gap-2">
          <RefreshCw className="size-4" /> Обновить
        </Button>
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="pending" className="gap-1.5">
            <Clock className="size-3.5" /> На модерации ({pending.length})
          </TabsTrigger>
          <TabsTrigger value="published" className="gap-1.5">
            <Check className="size-3.5" /> Опубликованные ({published.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-4">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка…
            </div>
          ) : current.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center text-sm text-muted-foreground">
                {tab === 'pending' ? 'Нет отзывов на модерации' : 'Нет опубликованных отзывов'}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {current.map((r) => (
                <Card key={r.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium">{r.author}</span>
                          {r.event && <Badge variant="outline" className="text-xs">{r.event}</Badge>}
                          <div className="flex gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? 'fill-gold text-gold' : 'text-muted-foreground/30'}`} />
                            ))}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {new Date(r.createdAt).toLocaleString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        {r.isPublished ? (
                          <Button size="sm" variant="outline" onClick={() => togglePublish(r.id, false)} className="gap-1.5 h-8">
                            <X className="size-3.5" /> Скрыть
                          </Button>
                        ) : (
                          <Button size="sm" onClick={() => togglePublish(r.id, true)} className="gap-1.5 h-8 bg-emerald-600 text-white hover:bg-emerald-700">
                            <Check className="size-3.5" /> Опубликовать
                          </Button>
                        )}
                        <Button size="icon" variant="ghost" className="size-8 text-destructive" onClick={() => setDeleteId(r.id)}>
                          <Trash2 className="size-3.5" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">{r.text}</p>
                    {/* Фото */}
                    {r.photos && r.photos.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-2">
                        {r.photos.map((src, i) => (
                          <a key={i} href={src} target="_blank" rel="noopener noreferrer" className="block w-20 h-20 rounded-lg overflow-hidden border border-border">
                            <img src={src} alt="" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    {/* Видео */}
                    {r.videos && r.videos.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {r.videos.map((src, i) => (
                          <video key={i} src={src} controls className="w-40 h-24 rounded-lg border border-border object-cover" />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить отзыв?</AlertDialogTitle>
            <AlertDialogDescription>Отзыв и все его фото/видео будут удалены безвозвратно.</AlertDialogDescription>
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
