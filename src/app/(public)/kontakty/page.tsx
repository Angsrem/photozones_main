import type { Metadata } from 'next';
import { CtaBand } from '@/components/site/cta-band';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { SITE } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Phone, MessageCircle, Send, Mail, MapPin, Clock, Building2, Truck, Sparkles } from 'lucide-react';
import { OrderButton } from '@/components/site/quick-order-modal';
import { PageBreadcrumbs, PageHero } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Контакты ФотоЗона24 — телефон, адрес, доставка в Красноярске',
  description:
    'Контакты ФотоЗона24 в Красноярске: телефон +7 (391) 219-00-24, WhatsApp, Telegram, email. Адрес: ул. Парижской Коммуны, 33. Районы и пригороды доставки. Работаем ежедневно 9:00–21:00.',
  alternates: { canonical: '/kontakty' },
};

export default function KontaktyPage() {
  const contacts = [
    {
      icon: Phone,
      label: 'Телефон',
      value: SITE.phone,
      href: `tel:${SITE.phoneRaw}`,
      note: 'Ежедневно 9:00–21:00',
    },
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: `+${SITE.whatsapp}`,
      href: `https://wa.me/${SITE.whatsapp}`,
      note: 'Быстрый ответ в чате',
    },
    {
      icon: Send,
      label: 'Telegram',
      value: `@${SITE.telegram}`,
      href: `https://t.me/${SITE.telegram}`,
      note: 'Заказ и консультация',
    },
    {
      icon: Mail,
      label: 'Email',
      value: SITE.email,
      href: `mailto:${SITE.email}`,
      note: 'Для юр. лиц и документов',
    },
  ];

  return (
    <>
      <JsonLd
        data={[
          localBusinessLd(),
          breadcrumbsLd([
            { name: 'Главная', url: '/' },
            { name: 'Контакты', url: '/kontakty' },
          ]),
        ]}
      />

      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Контакты' }]} />

      <PageHero
        eyebrow="Контакты"
        title={
          <>
            Контакты <span className="text-gradient-gold">ФотоЗона24</span>
          </>
        }
        intro={
          <>
            Свяжитесь с нами любым удобным способом — телефон, WhatsApp, Telegram, email. Работаем
            ежедневно с 9:00 до 21:00. Перезвоним за 15 минут и подтвердим дату или подберём аналог.
          </>
        }
      />

      {/* Карточки контактов */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {contacts.map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className="group rounded-2xl border border-border bg-card/50 p-5 card-hover"
            >
              <div className="w-10 h-10 rounded-xl bg-gold/15 flex items-center justify-center mb-3">
                <c.icon className="w-5 h-5 text-gold" />
              </div>
              <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{c.label}</div>
              <div className="font-medium text-base group-hover:text-gold transition-colors break-words">
                {c.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">{c.note}</div>
            </a>
          ))}
        </div>
      </section>

      {/* Адрес + часы + карта */}
      <section className="container mx-auto max-w-7xl px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-border bg-card/50 p-6">
            <h2 className="font-display text-2xl mb-4">Адрес и часы работы</h2>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Адрес офиса</div>
                  <div>{SITE.address}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Часы работы</div>
                  <div>{SITE.hours}</div>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-5 h-5 text-gold mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wide mb-0.5">Телефон</div>
                  <a href={`tel:${SITE.phoneRaw}`} className="hover:text-gold transition-colors">{SITE.phone}</a>
                </div>
              </li>
            </ul>

            <div className="mt-6 pt-6 border-t border-border/60">
              <h3 className="font-display text-lg mb-3">Зоны доставки</h3>
              <div className="mb-4">
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Building2 className="w-4 h-4 text-gold" /> Районы Красноярска
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SITE.districts.map((d) => (
                    <span key={d} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {d}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2 mb-2 text-sm font-medium">
                  <Truck className="w-4 h-4 text-coral" /> Пригороды
                  <span className="text-xs text-muted-foreground font-normal">
                    (надбавка {SITE.suburbSurcharge.toLocaleString('ru-RU')} ₽)
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {SITE.suburbs.map((s) => (
                    <span key={s} className="text-xs px-2 py-1 rounded-md bg-muted text-muted-foreground">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <OrderButton
                prefill={{ source: 'kontakty', sourcePage: '/kontakty' }}
                className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold flex-1"
              >
                <Sparkles className="w-5 h-5 mr-2" /> Оставить заявку
              </OrderButton>
              <Button asChild variant="outline" className="h-12 px-6">
                <a href={`tel:${SITE.phoneRaw}`}>
                  <Phone className="w-4 h-4 mr-2" /> Позвонить
                </a>
              </Button>
            </div>
          </div>

          {/* Яндекс.Карта */}
          <div className="rounded-2xl overflow-hidden border border-border bg-card/30 min-h-[420px]">
            <iframe
              title="Карта — ФотоЗона24 на карте Красноярска"
              src="https://yandex.ru/map-widget/v1/?ll=92.8704%2C56.0087&z=12"
              className="w-full h-full min-h-[420px]"
              loading="lazy"
              allowFullScreen
            />
          </div>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl px-4 pb-16">
        <CtaBand
          title="Остались вопросы? Перезвоним за 15 минут"
          subtitle="Оставьте заявку — менеджер свяжется с вами, подтвердит дату или подберёт аналог. Без обязательств."
          prefill={{ source: 'kontakty-cta', sourcePage: '/kontakty' }}
        />
      </section>
    </>
  );
}
