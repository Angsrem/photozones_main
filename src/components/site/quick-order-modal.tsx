'use client';

import { useEffect, useState } from 'react';
import { useQuickOrder, type QuickOrderPrefill } from './quick-order-store';
import { Dialog, DialogContent, DialogTitle, DialogDescription, DialogClose } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle2, Sparkles, ShieldCheck, Clock } from 'lucide-react';
import { formatPriceFrom } from '@/lib/format';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

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

export function QuickOrderModal() {
  const { open, prefill, close } = useQuickOrder();
  const [status, setStatus] = useState<Status>('idle');
  const [form, setForm] = useState({ name: '', phone: '', email: '', date: '', comment: '', promoCode: '' });
  const [promoStatus, setPromoStatus] = useState<{ checked: boolean; valid: boolean; discountPct?: number; reason?: string } | null>(null);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (open) {
      setStatus('idle');
      setErrorMsg('');
      setForm({ name: '', phone: '', email: '', date: '', comment: '', promoCode: '' });
      setPromoStatus(null);
    }
  }, [open, prefill]);

  async function checkPromo() {
    if (!form.promoCode.trim()) return;
    setCheckingPromo(true);
    setPromoStatus(null);
    try {
      const res = await fetch('/api/promo-code-validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: form.promoCode.trim() }),
      });
      const data = await res.json();
      setPromoStatus(data);
    } catch {
      setPromoStatus({ checked: true, valid: false, reason: 'Ошибка проверки' });
    } finally {
      setCheckingPromo(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    // Телефон — единственное обязательное поле. Минимум 10 цифр.
    const phoneDigits = form.phone.replace(/\D/g, '');
    if (phoneDigits.length < 10) return setErrorMsg('Введите корректный номер телефона — минимум 10 цифр');

    setStatus('loading');
    setErrorMsg('');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim() || null,
          email: form.email.trim() || null,
          phone: form.phone,
          eventDate: form.date.trim() || null,
          comment: form.comment.trim() || null,
          photozoneId: prefill.photozoneId ?? null,
          occasion: prefill.occasion ?? null,
          source: prefill.source ?? (typeof window !== 'undefined' ? window.location.pathname : null),
          sourcePage: prefill.sourcePage ?? (typeof window !== 'undefined' ? window.location.pathname : null),
          utm: captureUtm(),
          referrer: typeof document !== 'undefined' ? document.referrer : null,
          priceEstimate: prefill.priceEstimate ?? prefill.photozonePrice ?? null,
          config: prefill.config ?? null,
          promoCode: form.promoCode.trim() || null,
          promoDiscount: promoStatus?.valid ? promoStatus.discountPct : null,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        throw new Error(data?.error || 'Ошибка отправки');
      }
      setStatus('success');
    } catch (err: any) {
      setStatus('error');
      setErrorMsg(err?.message || 'Не удалось отправить заявку. Позвоните нам.');
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) close(); }}>
      <DialogContent className="max-w-md p-0 overflow-hidden gap-0 max-h-[92vh] overflow-y-auto">
        <AnimatePresence mode="wait">
          {status === 'success' ? (
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
              <DialogTitle className="font-display text-2xl mb-2">Заявка принята!</DialogTitle>
              <DialogDescription className="text-base text-muted-foreground mb-6">
                Перезвоним в течение <b className="text-foreground">15 минут</b>, подтвердим наличие на вашу дату
                или предложим аналогичные варианты.
              </DialogDescription>
              <div className="rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground mb-6">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-gold" /> <span>Среднее время перезвона — 7 минут</span>
                </div>
                <div className="flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-gold" /> <span>Менеджер не разглашает данные третьим лицам</span>
                </div>
              </div>
              <DialogClose asChild>
                <Button className="w-full h-12 bg-gold text-primary-foreground hover:bg-gold/90">Отлично, жду звонка</Button>
              </DialogClose>
            </motion.div>
          ) : (
            <motion.form
              key="form"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onSubmit={submit} className="flex flex-col"
            >
              {prefill.photozoneImage && (
                <div className="relative w-full h-32 overflow-hidden">
                  <Image src={prefill.photozoneImage} alt={prefill.photozoneTitle || 'Фотозона'} fill className="object-cover" sizes="448px" />
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 to-transparent" />
                  {prefill.photozoneTitle && (
                    <div className="absolute bottom-2 left-4 right-4 flex items-center justify-between gap-2">
                      <span className="font-display text-lg drop-shadow">{prefill.photozoneTitle}</span>
                      {prefill.photozonePrice != null && (
                        <Badge className="bg-gold text-primary-foreground">{formatPriceFrom(prefill.photozonePrice)}</Badge>
                      )}
                    </div>
                  )}
                </div>
              )}

              <div className="p-6 pt-5">
                {!prefill.photozoneImage && (
                  <DialogTitle className="font-display text-2xl mb-1">Быстрый заказ</DialogTitle>
                )}
                <DialogDescription className="mb-5 text-sm">
                  Заполните 4 поля — менеджер перезвонит и подтвердит дату. Это займёт 20 секунд.
                </DialogDescription>

                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-name">Имя</Label>
                    <Input id="qo-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder="Как к вам обращаться" className="h-12" autoComplete="name" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-phone">Телефон <span className="text-coral">*</span></Label>
                    <Input id="qo-phone" type="tel" inputMode="tel" value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      placeholder="+7 960 752 17 77" className="h-12" autoComplete="tel" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-email">Email</Label>
                    <Input id="qo-email" type="email" inputMode="email" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      placeholder="you@example.com" className="h-12" autoComplete="email" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-date">Желаемая дата</Label>
                    <Input id="qo-date" type="text" inputMode="text" value={form.date}
                      onChange={(e) => setForm({ ...form, date: e.target.value })}
                      placeholder="дд.мм.гггг — или «ближе к выходным»" className="h-12" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-comment">Комментарий</Label>
                    <Textarea id="qo-comment" value={form.comment} rows={2}
                      onChange={(e) => setForm({ ...form, comment: e.target.value })}
                      placeholder="Повод, количество гостей, адрес" className="resize-none" />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="qo-promo">Промокод</Label>
                    <div className="flex gap-2">
                      <Input id="qo-promo" value={form.promoCode}
                        onChange={(e) => { setForm({ ...form, promoCode: e.target.value.toUpperCase() }); setPromoStatus(null); }}
                        onBlur={checkPromo}
                        placeholder="FOTO-XXXX" className="font-mono uppercase" />
                      <Button type="button" variant="outline" size="sm" onClick={checkPromo} disabled={checkingPromo || !form.promoCode.trim()}>
                        {checkingPromo ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Проверить'}
                      </Button>
                    </div>
                    {promoStatus?.checked && (
                      <p className={`text-xs ${promoStatus.valid ? 'text-emerald-400' : 'text-coral'}`}>
                        {promoStatus.valid
                          ? `✓ Промокод принят: скидка ${promoStatus.discountPct}%`
                          : `✗ ${promoStatus.reason}`}
                      </p>
                    )}
                  </div>
                </div>

                {errorMsg && <p className="text-sm text-coral mt-3">{errorMsg}</p>}

                <Button type="submit" disabled={status === 'loading'}
                  className="w-full h-12 mt-4 bg-gold text-primary-foreground hover:bg-gold/90 text-base font-semibold">
                  {status === 'loading' ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Отправить заявку</>}
                </Button>

                <p className="text-xs text-muted-foreground text-center mt-3 leading-relaxed">
                  Нажимая кнопку, вы соглашаетесь с{' '}
                  <Link href="/privacy" target="_blank" className="underline hover:text-foreground">политикой конфиденциальности</Link>
                  {' '}и обработкой персональных данных.
                </p>

                <div className="flex items-center justify-center gap-4 mt-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1"><Sparkles className="w-3.5 h-3.5 text-gold" /> 30+ меропр./мес</span>
                  <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-gold" /> Монтаж 1 час</span>
                </div>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// Кнопка-обёртка: открывает модалку с префиллом
export function OrderButton({
  prefill, children, className, variant = 'default', size,
}: {
  prefill?: QuickOrderPrefill;
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  return (
    <Button
      type="button"
      variant={variant as any}
      size={size as any}
      className={className}
      onClick={() => openOrder(prefill)}
    >
      {children}
    </Button>
  );
}
