'use client';

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Star, ImagePlus, Video as VideoIcon, X, CheckCircle2, Upload } from 'lucide-react';
import { toast } from 'sonner';

const EVENTS = ['Свадьба', 'День рождения', 'Выпускной', 'Корпоратив', 'Новый год', 'Другое'];

export function ReviewForm() {
  const [author, setAuthor] = React.useState('');
  const [event, setEvent] = React.useState('');
  const [text, setText] = React.useState('');
  const [rating, setRating] = React.useState(5);
  const [photos, setPhotos] = React.useState<File[]>([]);
  const [videos, setVideos] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [submitted, setSubmitted] = React.useState(false);
  const [photoPreviews, setPhotoPreviews] = React.useState<string[]>([]);
  const [videoPreviews, setVideoPreviews] = React.useState<string[]>([]);

  const onPhotosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 5 - photos.length);
    setPhotos((p) => [...p, ...files]);
    setPhotoPreviews((p) => [...p, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };
  const onVideosChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []).slice(0, 2 - videos.length);
    setVideos((v) => [...v, ...files]);
    setVideoPreviews((v) => [...v, ...files.map((f) => URL.createObjectURL(f))]);
    e.target.value = '';
  };
  const removePhoto = (i: number) => {
    setPhotos((p) => p.filter((_, idx) => idx !== i));
    setPhotoPreviews((p) => p.filter((_, idx) => idx !== i));
  };
  const removeVideo = (i: number) => {
    setVideos((v) => v.filter((_, idx) => idx !== i));
    setVideoPreviews((v) => v.filter((_, idx) => idx !== i));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim()) return toast.error('Укажите имя');
    if (text.trim().length < 10) return toast.error('Отзыв слишком короткий (минимум 10 символов)');
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('author', author.trim());
      fd.append('text', text.trim());
      fd.append('event', event);
      fd.append('rating', String(rating));
      photos.forEach((f) => fd.append('photos', f));
      videos.forEach((f) => fd.append('videos', f));
      const res = await fetch('/api/reviews', { method: 'POST', body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      setSubmitted(true);
      toast.success('Отзыв отправлен на модерацию!');
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось отправить');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center"
      >
        <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto mb-4" />
        <h3 className="font-display text-2xl mb-2">Спасибо за отзыв!</h3>
        <p className="text-muted-foreground mb-6 max-w-md mx-auto">
          Ваш отзыв отправлен на модерацию. После проверки он появится на сайте — обычно в течение нескольких часов.
        </p>
        <Button
          variant="outline"
          onClick={() => {
            setSubmitted(false);
            setAuthor(''); setText(''); setEvent(''); setRating(5);
            setPhotos([]); setVideos([]); setPhotoPreviews([]); setVideoPreviews([]);
          }}
        >
          Отправить ещё один
        </Button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-border bg-card/50 p-5 sm:p-6 space-y-4">
      <div>
        <h3 className="font-display text-xl mb-1">Оставить отзыв</h3>
        <p className="text-sm text-muted-foreground">Поделитесь впечатлениями и фото/видео с мероприятия</p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="rev-author">Имя *</Label>
          <Input id="rev-author" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Как вас зовут" className="h-11" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="rev-event">Повод</Label>
          <select
            id="rev-event"
            value={event}
            onChange={(e) => setEvent(e.target.value)}
            className="flex h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
          >
            <option value="">Выберите повод</option>
            {EVENTS.map((ev) => <option key={ev} value={ev}>{ev}</option>)}
          </select>
        </div>
      </div>

      {/* Рейтинг */}
      <div className="space-y-1.5">
        <Label>Оценка *</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setRating(n)}
              aria-label={`${n} звёзд`}
              className="p-1"
            >
              <Star className={`w-7 h-7 transition-colors ${n <= rating ? 'fill-gold text-gold' : 'text-muted-foreground/40 hover:text-gold/50'}`} />
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="rev-text">Текст отзыва *</Label>
        <Textarea
          id="rev-text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder="Расскажите о вашем мероприятии, фотозоне, качестве работы..."
          className="resize-none"
        />
        <p className="text-xs text-muted-foreground">{text.length}/1000 символов</p>
      </div>

      {/* Загрузка фото */}
      <div className="space-y-1.5">
        <Label>Фото с мероприятия (до 5 шт, до 8МБ)</Label>
        <div className="flex flex-wrap gap-2">
          {photoPreviews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-border group">
              <img src={src} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removePhoto(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {photos.length < 5 && (
            <label className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
              <ImagePlus className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-1">Фото</span>
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple className="hidden" onChange={onPhotosChange} />
            </label>
          )}
        </div>
      </div>

      {/* Загрузка видео */}
      <div className="space-y-1.5">
        <Label>Видео с мероприятия (до 2 шт, до 50МБ)</Label>
        <div className="flex flex-wrap gap-2">
          {videoPreviews.map((src, i) => (
            <div key={i} className="relative w-32 h-20 rounded-lg overflow-hidden border border-border group">
              <video src={src} className="w-full h-full object-cover" muted />
              <button
                type="button"
                onClick={() => removeVideo(i)}
                className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3 text-white" />
              </button>
            </div>
          ))}
          {videos.length < 2 && (
            <label className="w-32 h-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-gold/50 transition-colors">
              <VideoIcon className="w-5 h-5 text-muted-foreground" />
              <span className="text-[10px] text-muted-foreground mt-1">Видео</span>
              <input type="file" accept="video/mp4,video/webm" multiple className="hidden" onChange={onVideosChange} />
            </label>
          )}
        </div>
      </div>

      <Button type="submit" disabled={loading} className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
        {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
        {loading ? 'Отправляем...' : 'Отправить отзыв'}
      </Button>
      <p className="text-xs text-muted-foreground text-center">
        Отзыв появится на сайте после модерации (обычно в течение нескольких часов)
      </p>
    </form>
  );
}
