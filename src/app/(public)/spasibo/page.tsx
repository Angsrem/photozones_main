import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Phone, MessageCircle, ArrowRight, Clock, ShieldCheck, Camera } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Заявка принята — спасибо!',
  description: 'Ваша заявка принята. Менеджер ФотоЗона24 перезвонит вам в течение 15 минут.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/spasibo' },
};

export default function SpasiboPage() {
  return (
    <section className="container mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="text-center">
        <div className="mx-auto mb-6 w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center">
          <CheckCircle2 className="w-11 h-11 text-emerald-400" />
        </div>
        <h1 className="font-display text-4xl sm:text-5xl leading-tight mb-4">Заявка принята!</h1>
        <p className="text-lg text-muted-foreground leading-relaxed mb-2">
          Спасибо за заявку. Менеджер перезвонит в течение{' '}
          <span className="text-foreground font-medium">{SITE.workTimeMin} минут</span>, подтвердим
          наличие на вашу дату или предложим аналогичные варианты.
        </p>
        <p className="text-sm text-muted-foreground mb-8">
          Среднее время перезвона — 7 минут. Если оставили заявку ночью — позвоним утром первыми.
        </p>

        {/* Что дальше */}
        <div className="rounded-2xl border border-border bg-card/50 p-5 mb-8 text-left">
          <div className="flex items-center gap-2 mb-3 text-sm font-medium">
            <Clock className="w-4 h-4 text-gold" /> Что дальше?
          </div>
          <ol className="space-y-2 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
              <span>Менеджер перезвонит на указанный номер в течение {SITE.workTimeMin} минут.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
              <span>Подтвердим наличие фотозоны на дату или подберём аналог под повод и бюджет.</span>
            </li>
            <li className="flex gap-3">
              <span className="w-5 h-5 rounded-full bg-gold/20 text-gold text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
              <span>Согласуем адрес, время монтажа и финальную стоимость. Присылаем договор.</span>
            </li>
          </ol>
          <div className="mt-4 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-gold" />
            <span>Менеджер не разглашает данные третьим лицам.</span>
          </div>
        </div>

        {/* Кнопки действий */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
            <a href={`tel:${SITE.phoneRaw}`}>
              <Phone className="w-4 h-4 mr-2" /> Позвонить самому
            </a>
          </Button>
          <Button asChild variant="outline" className="h-12 px-6">
            <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer">
              <MessageCircle className="w-4 h-4 mr-2" /> Написать в WhatsApp
            </a>
          </Button>
        </div>

        {/* Ссылка на каталог */}
        <div className="mt-8 pt-8 border-t border-border/60">
          <p className="text-sm text-muted-foreground mb-3">
            Пока ждёте звонка — посмотрите другие фотозоны в каталоге:
          </p>
          <Button asChild variant="ghost" className="text-gold hover:bg-transparent hover:text-gold/80">
            <Link href="/katalog">
              <Camera className="w-4 h-4 mr-2" /> Перейти в каталог <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
