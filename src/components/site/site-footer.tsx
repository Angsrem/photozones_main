import Link from 'next/link';
import { Phone, MessageCircle, Send, MapPin, Clock, Mail, Camera } from 'lucide-react';
import { SITE, NAV_LINKS } from '@/lib/constants';

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border/60 bg-card/30">
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-8 md:grid-cols-4">
          {/* О компании */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="flex items-center justify-center w-9 h-9 rounded-lg bg-gold text-primary-foreground">
                <Camera className="w-5 h-5" />
              </span>
              <span className="font-display text-xl">ФотоЗона<span className="text-gold">24</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Аренда фотозон в Красноярске и пригороде. Свадьбы, дни рождения,
              корпоративы, сезонные праздники. Доставка, монтаж и демонтаж включены.
            </p>
            <div className="flex gap-2 mt-4">
              <a href={`https://wa.me/${SITE.whatsapp}`} target="_blank" rel="noopener noreferrer"
                aria-label="WhatsApp" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <MessageCircle className="w-4 h-4" />
              </a>
              <a href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener noreferrer"
                aria-label="Telegram" className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <Send className="w-4 h-4" />
              </a>
              <a href={`tel:${SITE.phoneRaw}`} aria-label="Позвонить"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-accent transition-colors">
                <Phone className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Навигация */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Каталог</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/katalog" className="hover:text-gold transition-colors">Все фотозоны</Link></li>
              <li><Link href="/svadby" className="hover:text-gold transition-colors">Свадебные</Link></li>
              <li><Link href="/detskie-prazdniki" className="hover:text-gold transition-colors">Детские</Link></li>
              <li><Link href="/vypusknie" className="hover:text-gold transition-colors">Выпускные</Link></li>
              <li><Link href="/korporativy" className="hover:text-gold transition-colors">Корпоративы</Link></li>
              <li><Link href="/ceny" className="hover:text-gold transition-colors">Цены и тарифы</Link></li>
              <li><Link href="/kalkulyator" className="hover:text-gold transition-colors">Калькулятор</Link></li>
            </ul>
          </div>

          {/* Сезон / ещё */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Сезон и инфо</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/prazdniki/novyj-god" className="hover:text-gold transition-colors">Новогодние фотозоны</Link></li>
              <li><Link href="/prazdniki/8-marta" className="hover:text-gold transition-colors">Фотозоны на 8 марта</Link></li>
              <li><Link href="/prazdniki/23-fevralya" className="hover:text-gold transition-colors">Фотозоны на 23 февраля</Link></li>
              <li><Link href="/otzyvy" className="hover:text-gold transition-colors">Отзывы</Link></li>
              <li><Link href="/o-kompanii" className="hover:text-gold transition-colors">О компании</Link></li>
              <li><Link href="/blog" className="hover:text-gold transition-colors">Блог</Link></li>
              <li><Link href="/kontakty" className="hover:text-gold transition-colors">Контакты</Link></li>
              <li><Link href="/privacy" className="hover:text-gold transition-colors">Политика конфиденциальности</Link></li>
            </ul>
          </div>

          {/* Контакты */}
          <div>
            <h3 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">Контакты</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <a href={`tel:${SITE.phoneRaw}`} className="hover:text-gold transition-colors">{SITE.phone}</a>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <a href={`mailto:${SITE.email}`} className="hover:text-gold transition-colors">{SITE.email}</a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{SITE.address}</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="w-4 h-4 text-gold mt-0.5 shrink-0" />
                <span>{SITE.hours}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border/60 flex flex-col sm:flex-row justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} {SITE.legalName}. Все права защищены.</p>
          <div className="flex gap-4">
            <span>Красноярск и пригород</span>
            <span>Доставка · Монтаж · Демонтаж</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
