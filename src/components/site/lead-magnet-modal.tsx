'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { PhoneInput, isPhoneValid } from '@/components/site/phone-input';
import { Loader2, Download, CheckCircle2, FileText, Sparkles, ShieldCheck } from 'lucide-react';

type Status = 'idle' | 'loading' | 'success' | 'error';

function captureUtm(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const p = new URLSearchParams(window.location.search);
  const utm: Record<string, string> = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach((k) => {
    const v = p.get(k);
    if (v) utm[k] = v;
  });
  return utm;
}

export function LeadMagnetModal({
  slug,
  title,
  fileUrl,
  occasion,
  sourcePage,
}: {
  slug: string;
  title: string;
  fileUrl: string;
  occasion: string | null;
  sourcePage: string;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '' });
  const [result, setResult] = useState<{ fileUrl: string; promoCode: string; expiresAt: string } | null>(null);

  function reset() {
    setStatus('idle');
    setErrorMsg('');
    setForm({ name: '', phone: '', email: '' });
    setResult(null);
  }

  function onOpenChange(o: boolean) {
    setOpen(o);
    if (!o) {
      // Сбрасываем с задержкой, чтобы модалка не мелькала при закрытии
      setTimeout(reset, 200);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) return setErrorMsg('Укажите имя');
    if (!isPhoneValid(form.phone)) return setErrorMsg('Введите корректный телефон');
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      return setErrorMsg('Некорректный email');
    }

    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/lead-magnets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug,
          name: form.name.trim(),
          phone: form.phone,
          email: form.email.trim() || null,
          sourcePage,
          occasion: occasion ?? null,
          utm: captureUtm(),
          referrer: typeof document !== 'undefined' ? document.referrer : null,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        throw new Error(data?.error || 'Не удалось отправить заявку');
      }
      setResult({
        fileUrl: data.fileUrl,
        promoCode: data.promoCode,
        expiresAt: data.expiresAt,
      });
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Не удалось отправить заявку. Позвоните нам.');
    }
  }

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold shrink-0 gap-2"
      >
        <Download className="w-5 h-5" /> Скачать PDF
      </Button>

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-md p-0 overflow-hidden gap-0 max-h-[92vh] overflow-y-auto">
          <AnimatePresence mode="wait">
            {status === 'success' && result ? (
              <motion.div
                key="success"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="p-8 text-center"
              >
                <motion.div
                  initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="mx-auto mb-5 w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center"
                >
                  <CheckCircle2 className="w-9 h-9 text-emerald-400" />
                </motion.div>
                <DialogTitle className="font-display text-2xl mb-2">Готово! Вот ваш PDF</DialogTitle>
                <DialogDescription className="text-base text-muted-foreground mb-6">
                  Гайд <b className="text-foreground">«{title}»</b> доступен для скачивания. Мы также отправили
                  его вам на почту (если указали email) и забронировали промокод.
                </DialogDescription>

                <div className="rounded-xl border border-border bg-muted/30 p-4 mb-4 space-y-3">
                  <a
                    href={result.fileUrl}
                    download
                    className="flex items-center justify-center gap-2 w-full h-12 rounded-lg bg-gold text-primary-foreground font-semibold hover:bg-gold/90 transition-colors"
                  >
                    <Download className="w-5 h-5" /> Скачать PDF
                  </a>
                  <div className="flex items-center justify-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4 text-gold" />
                    <span>
                      Промокод <code className="bg-gold/15 text-gold px-2 py-0.5 rounded font-mono font-semibold">{result.promoCode}</code>{' '}
                      — скидка 5%. Действует до {new Date(result.expiresAt).toLocaleDateString('ru-RU')}.
                    </span>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1.5 mb-4">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Менеджер перезвонит за 15 минут, чтобы помочь с выбором.
                </p>

                <DialogClose asChild>
                  <Button className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90">Спасибо!</Button>
                </DialogClose>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                onSubmit={submit}
                className="flex flex-col"
              >
                {/* Шапка с иконкой */}
                <div className="relative w-full h-32 bg-gradient-to-br from-gold/15 via-card to-card flex items-center justify-center overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl" aria-hidden />
                  <div className="relative w-14 h-14 rounded-xl bg-gold/20 flex items-center justify-center">
                    <FileText className="w-7 h-7 text-gold" />
                  </div>
                </div>

                <div className="p-6 pt-5">
                  <DialogTitle className="font-display text-2xl mb-1">Скачать гайд</DialogTitle>
                  <DialogDescription className="mb-5 text-sm">
                    {title}. Оставьте контакты — пришлём PDF и промокод на скидку 5%. Это займёт 15 секунд.
                  </DialogDescription>

                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="lm-name">Имя <span className="text-coral">*</span></Label>
                      <Input
                        id="lm-name"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Как к вам обращаться"
                        className="h-12"
                        autoComplete="name"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lm-phone">Телефон <span className="text-coral">*</span></Label>
                      <PhoneInput
                        id="lm-phone"
                        value={form.phone}
                        onChange={(v) => setForm({ ...form, phone: v })}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="lm-email">Email (необязательно)</Label>
                      <Input
                        id="lm-email"
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="you@example.com — куда прислать PDF"
                        className="h-12"
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {errorMsg && <p className="text-sm text-coral mt-3">{errorMsg}</p>}

                  <Button
                    type="submit"
                    disabled={status === 'loading'}
                    className="w-full h-12 mt-4 bg-gold text-primary-foreground hover:bg-gold/90 text-base font-semibold gap-2"
                  >
                    {status === 'loading' ? (
                      <Loader2 className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Download className="w-5 h-5" /> Получить PDF
                      </>
                    )}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                    Нажимая кнопку, вы соглашаетесь на обработку персональных данных.
                    Мы не передаём контакты третьим лицам.
                  </p>

                  <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5 text-gold" /> + промокод QUIZ5
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-gold" /> Перезвон 15 мин
                    </span>
                  </div>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </DialogContent>
      </Dialog>
    </>
  );
}
