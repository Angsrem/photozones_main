'use client';

import { motion } from 'framer-motion';
import { Sparkles, QrCode, Gift, Phone, MessageCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useQuickOrder } from '@/components/site/quick-order-store';
import { SITE } from '@/lib/constants';
import Link from 'next/link';
import { track } from '@/lib/analytics';

const PROMO_CODE = 'QR10';
const DISCOUNT = 10;

export function QrLanding() {
  const openOrder = useQuickOrder((s) => s.openOrder);

  const handleOrder = () => {
    track({ event: 'order_opened', source: 'qr-landing' });
    openOrder({
      source: 'qr-landing',
      sourcePage: '/qr',
      priceEstimate: undefined,
      config: { promoCode: PROMO_CODE, channel: 'qr' },
    });
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-lg w-full"
      >
        {/* Hero с QR-иконкой */}
        <div className="text-center mb-6">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gold/15 mb-4"
          >
            <QrCode className="w-10 h-10 text-gold" />
          </motion.div>
          <Badge className="bg-gold text-primary-foreground border-0 mb-3">Вы отсканировали QR-код</Badge>
          <h1 className="font-display text-3xl sm:text-4xl mb-2">Хотите такую же фотозону?</h1>
          <p className="text-muted-foreground">
            Вам понравилась фотозона на мероприятии? Закажите такую же (или другую) —
            со скидкой <b className="text-gold">{DISCOUNT}%</b> по промокоду ниже.
          </p>
        </div>

        {/* Промокод */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl border-2 border-gold/40 bg-gradient-to-br from-gold/15 via-card to-card p-6 mb-6 text-center"
        >
          <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-gold/10 blur-3xl" />
          <div className="relative">
            <Gift className="w-8 h-8 text-gold mx-auto mb-2" />
            <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">Ваш промокод</div>
            <div className="font-mono text-4xl font-bold text-gold mb-1 tracking-wider">{PROMO_CODE}</div>
            <div className="text-sm text-muted-foreground">скидка {DISCOUNT}% на аренду любой фотозоны</div>
          </div>
        </motion.div>

        {/* Что входит */}
        <div className="rounded-2xl border border-border bg-card/50 p-5 mb-6">
          <h2 className="font-display text-lg mb-3 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-gold" /> Что входит в стоимость
          </h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Доставка по Красноярску</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Монтаж и демонтаж</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Аренда до 5 часов</li>
            <li className="flex items-start gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" /> Подбор аналога, если занято</li>
          </ul>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <Button
            onClick={handleOrder}
            className="w-full h-14 bg-gold text-primary-foreground hover:bg-gold/90 text-base font-semibold"
          >
            <Sparkles className="w-5 h-5 mr-2" /> Заказать со скидкой {DISCOUNT}%
          </Button>
          <div className="grid grid-cols-2 gap-3">
            <Button asChild variant="outline" className="h-12">
              <a href={`https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Отсканировал QR-код, хочу фотозону со скидкой по промокоду ${PROMO_CODE}`)}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
              </a>
            </Button>
            <Button asChild variant="outline" className="h-12">
              <a href={`tel:${SITE.phoneRaw}`}><Phone className="w-4 h-4 mr-2" /> Позвонить</a>
            </Button>
          </div>
        </div>

        {/* Доп. ссылки */}
        <div className="mt-6 pt-6 border-t border-border text-center text-sm text-muted-foreground">
          <p className="mb-3">Не знаете, что выбрать? Посмотрите каталог или пройдите квиз:</p>
          <div className="flex gap-3 justify-center">
            <Button asChild variant="ghost" size="sm"><Link href="/katalog">Каталог <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link></Button>
            <Button asChild variant="ghost" size="sm"><Link href="/kviz">Квиз <ArrowRight className="w-3.5 h-3.5 ml-1" /></Link></Button>
          </div>
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Промокод {PROMO_CODE} действует 30 дней. Назовите его менеджеру при заказе.
          Fotoarka — аренда фотозон в Красноярске.
        </p>
      </motion.div>
    </div>
  );
}
