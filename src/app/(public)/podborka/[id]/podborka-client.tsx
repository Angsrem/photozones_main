'use client';

import * as React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Sparkles, CheckCircle2, Gift, Copy, Send, MessageCircle, ChevronRight, Loader2 } from 'lucide-react';
import { useQuickOrder } from '@/components/site/quick-order-store';
import { formatPriceFrom } from '@/lib/format';
import { SITE } from '@/lib/constants';

type Zone = {
  id: string; slug: string; title: string; basePrice: number;
  images: string[]; sizeW: number | null; sizeH: number | null;
  includes: string[]; badge: string | null; hit: boolean;
};

const ROLES = [
  { key: 'economy', label: '💚 Выгодно', desc: 'Оптимально по цене' },
  { key: 'hit', label: '💛 Наш хит', desc: 'Самая заказываемая' },
  { key: 'premium', label: '💜 Премиум', desc: 'Эффект «вау»' },
] as const;

export function PODBORKA_SHEET({
  session,
  zones,
}: {
  session: { id: string; promoCode: string | null; expiresAt: string; answers: any };
  zones: Zone[];
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const [saveContact, setSaveContact] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/podborka/${session.id}`);
      toast.success('Ссылка скопирована!');
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const sendToSelf = async () => {
    if (!saveContact.trim()) return;
    setSaving(true);
    const c = saveContact.trim();
    const channel = /@/.test(c) ? 'email' : 'whatsapp';
    try {
      await fetch(`/api/quiz/${session.id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: c, channel }),
      });
      toast.success('Подборка отправлена!');
      setSaveContact('');
    } catch {
      toast.error('Не удалось отправить');
    } finally {
      setSaving(false);
    }
  };

  const waDeepLink = zones[0]
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу фотозону «${zones[0].title}» (подборка с сайта ФотоЗона24)`)}` : `https://wa.me/${SITE.whatsapp}`;

  const expiresRu = new Date(session.expiresAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 mb-3">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h1 className="font-display text-3xl sm:text-4xl mb-2">Ваша подборка фотозон</h1>
        <p className="text-muted-foreground">3 варианта под ваш повод и бюджет. Выбирайте и заказывайте — менеджер перезвонит за 15 минут.</p>
      </motion.div>

      {/* Промокод */}
      {session.promoCode && (
        <div className="mb-5 rounded-xl border border-gold/30 bg-gold/10 p-4 flex items-center gap-3 justify-center">
          <Gift className="w-6 h-6 text-gold shrink-0" />
          <div className="text-sm">
            Промокод <b className="text-gold font-mono text-base">{session.promoCode}</b> — скидка 5%, активен 7 дней. Назовите менеджеру при заказе.
          </div>
        </div>
      )}

      {/* 3 карточки */}
      <div className="grid gap-4 sm:grid-cols-3 mb-6">
        {zones.slice(0, 3).map((z, i) => {
          const role = ROLES[i] || ROLES[1];
          const img = z.images?.[0] || '/images/photozones/love.png';
          return (
            <div key={z.id} className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image src={img} alt={z.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
                <div className="absolute top-3 left-3">
                  <Badge className="bg-background/90 text-foreground border-0 backdrop-blur">{role.label}</Badge>
                </div>
                {z.badge && (
                  <div className="absolute top-3 right-3">
                    <Badge className="bg-gold text-primary-foreground border-0">{z.badge === 'HIT' ? 'Хит' : 'Новинка'}</Badge>
                  </div>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="text-xs text-muted-foreground mb-1">{role.desc}</div>
                <h3 className="font-display text-lg leading-tight mb-1">{z.title}</h3>
                <div className="text-gold font-semibold mb-2">{formatPriceFrom(z.basePrice)}</div>
                {z.sizeW && z.sizeH && <div className="text-xs text-muted-foreground mb-3">Размер: {z.sizeW} × {z.sizeH} м</div>}
                <Button
                  onClick={() => openOrder({
                    photozoneId: z.id,
                    photozoneTitle: z.title,
                    photozoneImage: img,
                    photozonePrice: z.basePrice,
                    source: 'quiz-shared',
                    sourcePage: `/podborka/${session.id}`,
                    occasion: session.answers?.occasion,
                    priceEstimate: z.basePrice,
                    config: { quizAnswers: session.answers, recommendedId: z.id, role: role.key, sessionId: session.id, promoCode: session.promoCode },
                  })}
                  className="mt-auto h-11 bg-gold text-primary-foreground hover:bg-gold/90 w-full"
                >
                  <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Сохранить */}
      <div className="rounded-2xl border border-border bg-card/50 p-5 mb-4">
        <h3 className="font-display text-lg mb-1">Сохранить подборку</h3>
        <p className="text-sm text-muted-foreground mb-4">Отправим на телефон/email или скопируйте ссылку. Ссылка активна до {expiresRu}.</p>
        <div className="flex flex-col sm:flex-row gap-2 mb-3">
          <Input value={saveContact} onChange={(e) => setSaveContact(e.target.value)} placeholder="Телефон или email" className="h-12 flex-1" />
          <Button onClick={sendToSelf} disabled={saving || !saveContact.trim()} className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90">
            {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
            Отправить мне
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm" className="h-10">
            <a href={waDeepLink} target="_blank" rel="noopener noreferrer"><MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp</a>
          </Button>
          <Button asChild variant="outline" size="sm" className="h-10">
            <a href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener noreferrer"><Send className="w-4 h-4 mr-1.5" /> Telegram</a>
          </Button>
          <Button onClick={copyLink} variant="outline" size="sm" className="h-10">
            <Copy className="w-4 h-4 mr-1.5" /> Скопировать ссылку
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-10">
            <Link href="/katalog"><ChevronRight className="w-4 h-4 mr-1" /> Весь каталог</Link>
          </Button>
        </div>
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Менеджер свяжется в течение 15 минут в рабочее время и подтвердит варианты на вашу дату.
      </div>
    </div>
  );
}
