import type { Metadata } from 'next';
import Link from 'next/link';
import { Mail, Phone, ShieldCheck, FileText, Database, Clock, Send, UserCheck, Cookie } from 'lucide-react';
import { SITE } from '@/lib/constants';
import { PageBreadcrumbs, PageHero } from '../_components/landing-sections';

export const metadata: Metadata = {
  title: 'Политика конфиденциальности — Fotoarka',
  description: 'Политика обработки персональных данных сайта fotoarka.ru',
  alternates: { canonical: '/privacy' },
  robots: { index: false, follow: true },
};

type Section = {
  id: string;
  icon: typeof FileText;
  title: string;
  body: React.ReactNode;
};

const sections: Section[] = [
  {
    id: 'general',
    icon: FileText,
    title: '1. Общие положения',
    body: (
      <>
        <p>
          Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональных данных
          пользователей сайта <a href={SITE.url} className="text-gold underline hover:text-foreground">fotoarka.ru</a>{' '}
          (далее — «Сайт»), принадлежащего {SITE.legalName} (далее — «Оператор»).
        </p>
        <p>
          Используя Сайт и оставляя заявку через формы обратной связи, пользователь подтверждает своё согласие
          с условиями настоящей Политики и даёт согласие на обработку своих персональных данных в указанных ниже целях.
        </p>
        <p>
          Политика разработана в соответствии с действующим законодательством Российской Федерации
          о персональных данных.
        </p>
      </>
    ),
  },
  {
    id: 'data',
    icon: Database,
    title: '2. Какие данные мы собираем',
    body: (
      <>
        <p>Через формы заявки на Сайте Оператор может собирать следующие персональные данные:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li><b>Имя</b> — как к вам обращаться при перезвоне;</li>
          <li><b>Телефон</b> — для связи с менеджером;</li>
          <li><b>Email</b> — для отправки предложений и документов (если вы указали его);</li>
          <li><b>Дата мероприятия</b> — желаемая дата проведения события;</li>
          <li><b>Комментарий</b> — повод, количество гостей, адрес и иные сведения, которые вы сообщаете добровольно.</li>
        </ul>
        <p>
          Также автоматически фиксируются технические данные: источник перехода (URL), UTM-метки,
          страница, с которой отправлена заявка. Эти данные не позволяют идентифицировать вас напрямую.
        </p>
      </>
    ),
  },
  {
    id: 'purpose',
    icon: ShieldCheck,
    title: '3. Цели обработки',
    body: (
      <>
        <p>Персональные данные обрабатываются исключительно в следующих целях:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>перезвон менеджера для подтверждения заявки и согласования деталей мероприятия;</li>
          <li>обработка заявок на аренду фотозон, оформление заказа и расчёт стоимости;</li>
          <li>отправка коммерческих предложений, расчётов и информации о наличии фотозон на желаемую дату;</li>
          <li>информирование об акциях, скидках и промокодах (только с вашего согласия);</li>
          <li>улучшение качества сервиса и удобства использования Сайта.</li>
        </ul>
      </>
    ),
  },
  {
    id: 'legal',
    icon: FileText,
    title: '4. Правовое основание обработки',
    body: (
      <>
        <p>
          Обработка персональных данных осуществляется на основании{' '}
          <b>статьи 6 Федерального закона от 27.07.2006 № 152-ФЗ «О персональных данных»</b>,
          а именно — с согласия субъекта персональных данных, данного при отправке формы заявки.
        </p>
        <p>
          Оператор не обрабатывает специальные категории персональных данных (сведения о расовой,
          национальной принадлежности, политических взглядах, религиозных убеждениях, состоянии здоровья,
          интимной жизни) и биометрические персональные данные.
        </p>
      </>
    ),
  },
  {
    id: 'storage',
    icon: Clock,
    title: '5. Хранение данных',
    body: (
      <>
        <p>
          Персональные данные пользователей хранятся в течение срока, необходимого для достижения целей обработки,
          но <b>не более 3 (трёх) лет</b> с даты последней заявки или иного взаимодействия с пользователем.
        </p>
        <p>
          По истечении указанного срока персональные данные уничтожаются, если иное не предусмотрено
          действующим законодательством Российской Федерации (например, необходимость хранения для целей
          бухгалтерского или налогового учёта).
        </p>
      </>
    ),
  },
  {
    id: 'transfer',
    icon: Send,
    title: '6. Передача данных третьим лицам',
    body: (
      <>
        <p>
          Оператор <b>не передаёт</b> ваши персональные данные третьим лицам, за исключением случая,
          прямо предусмотренного настоящей Политикой.
        </p>
        <p>
          Для оперативного уведомления менеджера о новой заявке данные заявки (имя, телефон, дата мероприятия,
          комментарий) могут передаваться в сервис <b>Telegram Messenger</b> в виде служебного сообщения
          ответственному менеджеру Оператора. Такая передача необходима для выполнения вашего запроса
          (перезвон, подтверждение заявки) и осуществляется на основании согласия пользователя.
        </p>
        <p>
          В иных случаях персональные данные могут быть переданы третьим лицам только при соблюдении
          требований законодательства Российской Федерации и с согласия пользователя.
        </p>
      </>
    ),
  },
  {
    id: 'rights',
    icon: UserCheck,
    title: '7. Права пользователя',
    body: (
      <>
        <p>Пользователь имеет право:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>получать информацию об обработке своих персональных данных;</li>
          <li>требовать уточнения, исправления или дополнения своих персональных данных;</li>
          <li>требовать удаления своих персональных данных («право на забвение»);</li>
          <li>отозвать ранее данное согласие на обработку персональных данных;</li>
          <li>обжаловать действия Оператора в уполномоченный орган по защите прав субъектов персональных данных.</li>
        </ul>
        <p>
          Для реализации указанных прав направьте обращение на email{' '}
          <a href={`mailto:${SITE.email}`} className="text-gold underline hover:text-foreground">{SITE.email}</a>{' '}
          с темой «Персональные данные». Обращение рассматривается в срок до 30 дней.
        </p>
      </>
    ),
  },
  {
    id: 'cookies',
    icon: Cookie,
    title: '8. Cookies и аналитика',
    body: (
      <>
        <p>
          Сайт <b>не использует</b> cookie-файлы для отслеживания пользователей и передачи данных третьим лицам.
        </p>
        <p>
          Технически необходимые элементы (например, запоминание состояния корзины или уже открытой формы)
          могут храниться локально в браузере пользователя и не передаются на сервер Оператора в идентифицируемом виде.
        </p>
        <p>
          Аналитика посещаемости, если применяется, работает в обезличенном виде и не позволяет сопоставить
          визит с конкретной заявкой или личностью пользователя.
        </p>
      </>
    ),
  },
  {
    id: 'contacts',
    icon: Mail,
    title: '9. Контакты Оператора',
    body: (
      <>
        <p>По всем вопросам, связанным с обработкой персональных данных, обращайтесь к Оператору:</p>
        <ul className="space-y-2 not-prose">
          <li className="flex items-start gap-2">
            <Mail className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <a href={`mailto:${SITE.email}`} className="hover:text-gold transition-colors">{SITE.email}</a>
          </li>
          <li className="flex items-start gap-2">
            <Phone className="w-4 h-4 text-gold mt-0.5 shrink-0" />
            <a href={`tel:${SITE.phoneRaw}`} className="hover:text-gold transition-colors">{SITE.phone}</a>
          </li>
          <li className="flex items-start gap-2 text-sm">
            <span className="text-gold mt-0.5 shrink-0">→</span>
            <span>{SITE.address}</span>
          </li>
        </ul>
        <p className="mt-3 text-sm text-muted-foreground">
          Ответственный за обработку персональных данных — руководитель Оператора.
        </p>
      </>
    ),
  },
];

export default function PrivacyPage() {
  const lastUpdated = '23 октября 2026';

  return (
    <>
      <PageBreadcrumbs items={[{ name: 'Главная', href: '/' }, { name: 'Политика конфиденциальности' }]} />

      <PageHero
        eyebrow="Документ"
        title={
          <>
            Политика <span className="text-gradient-gold">конфиденциальности</span>
          </>
        }
        intro={
          <>
            Политика обработки персональных данных сайта{' '}
            <a href={SITE.url} className="text-gold underline hover:text-foreground">fotoarka.ru</a>.
            Оператор — {SITE.legalName}. Документ регулирует порядок сбора, использования и защиты данных
            пользователей, оставляющих заявки на аренду фотозон.
          </>
        }
      />

      <section className="container mx-auto max-w-3xl px-4 pb-16">
        <div className="rounded-xl border border-border bg-card/40 p-4 mb-8 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gold" />
            <span>Дата последнего обновления: <b className="text-foreground">{lastUpdated}</b></span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-gold" />
            <span>Документ обязателен для всех пользователей Сайта.</span>
          </div>
        </div>

        <article className="max-w-none space-y-8 text-foreground/90 leading-relaxed">
          {sections.map((s) => (
            <section key={s.id} id={s.id} className="scroll-mt-24">
              <h2 className="flex items-center gap-2 font-display text-xl mb-3 text-foreground">
                <s.icon className="w-5 h-5 text-gold shrink-0" />
                <span>{s.title}</span>
              </h2>
              <div className="space-y-3 text-sm sm:text-base [&_p]:text-muted-foreground [&_li]:text-muted-foreground [&_a]:text-gold [&_b]:text-foreground">
                {s.body}
              </div>
            </section>
          ))}
        </article>

        <div className="mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row gap-3 justify-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-gold transition-colors">← На главную</Link>
          <Link href="/kontakty" className="hover:text-gold transition-colors">Контакты</Link>
          <Link href="/katalog" className="hover:text-gold transition-colors">Каталог фотозон</Link>
        </div>
      </section>
    </>
  );
}
