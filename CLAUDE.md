# ФотоЗона24 — проект для AI-агентов

## Что это

Продающий сайт аренды фотозон в Красноярске. Публичная часть + закрытая админ-панель. Next.js 16 (App Router) + TypeScript + Prisma + SQLite.

## Технологии

| Компонент | Технология |
|-----------|-----------|
| Framework | Next.js 16 (App Router) |
| Язык | TypeScript 5 |
| Стили | Tailwind CSS 4 + shadcn/ui (New York) |
| БД | Prisma ORM + SQLite (готово к PostgreSQL) |
| Анимации | Framer Motion |
| Шрифты | Inter (текст) + Unbounded (заголовки) через next/font |
| Иконки | Lucide React |
| Авторизация | JWT (HMAC-SHA256), 2FA TOTP |
| Безопасность | Rate limiting, CSP, magic bytes, SSR middleware |

## Структура проекта

```
├── prisma/
│   ├── schema.prisma          # 11 моделей: Manager, PhotoZone, Element, Lead, Booking, DateBlock, Promo, PromoCode, QuizSession, Review, Article, Page, QuizPartial, LeadMagnet
│   └── seed.ts                # Seed: 48 фотозон, 62 отзыва, 7 заявок, менеджер
├── src/
│   ├── app/
│   │   ├── (public)/          # Публичные страницы (route group)
│   │   │   ├── page.tsx       # Главная
│   │   │   ├── katalog/       # Каталог + карточка [slug]
│   │   │   ├── svadby/        # Посадочная свадьбы
│   │   │   ├── detskie-prazdniki/
│   │   │   ├── vypusknie/
│   │   │   ├── korporativy/
│   │   │   ├── prazdniki/     # novyj-god, 8-marta, 23-fevralya
│   │   │   ├── ceny/          # Тарифы + калькулятор
│   │   │   ├── kalkulyator/   # Wizard 4 шага
│   │   │   ├── kviz/          # Квиз 6 шагов + открытый результат
│   │   │   ├── konstruktor/   # Конструктор фотозон (4 шага, live-цена)
│   │   │   ├── otzyvy/        # Отзывы + форма + промокоды
│   │   │   ├── kontakty/
│   │   │   ├── o-kompanii/
│   │   │   ├── blog/          # [slug] с markdown
│   │   │   ├── podborka/[id]/ # Постоянная ссылка на квиз-подборку
│   │   │   ├── qr/            # QR-лендинг с промокодом
│   │   │   └── spasibo/       # После заявки
│   │   ├── admin/             # Админ-панель
│   │   │   ├── page.tsx       # Дашборд (KPI, воронка квиза, лид-магниты)
│   │   │   ├── leads/         # Заявки CRUD + промокоды + WhatsApp-шаблоны
│   │   │   ├── calendar/      # Календарь занятости
│   │   │   ├── photozones/    # CRUD фотозон + опции
│   │   │   ├── promo/         # Акции
│   │   │   ├── reviews/       # Модерация отзывов
│   │   │   ├── pages/         # Блочный редактор контента
│   │   │   └── settings/      # 2FA TOTP
│   │   ├── api/               # 25+ API роутов
│   │   ├── sitemap.ts         # Динамический sitemap
│   │   └── robots.ts
│   ├── components/
│   │   ├── site/              # Бизнес-компоненты
│   │   └── ui/                # shadcn/ui (50+ компонентов)
│   ├── lib/                   # Бизнес-логика
│   │   ├── auth.ts            # JWT + 2FA + cookie
│   │   ├── db.ts              # Prisma client
│   │   ├── leads.ts           # Создание лидов + подбор аналогов
│   │   ├── notify.ts          # Telegram + email + дожим-цепочка
│   │   ├── promo-codes.ts     # Генерация + валидация промокодов
│   │   ├── quiz.ts            # Мэтчинг квиза (каскадный фильтр)
│   │   ├── rate-limit.ts      # In-memory rate limiter
│   │   ├── totp.ts            # 2FA TOTP (RFC 6238)
│   │   ├── seo.ts             # JSON-LD генераторы (8 типов)
│   │   ├── analytics.ts       # DataLayer события
│   │   └── constants.ts       # SITE config, NAV_LINKS, OCCASIONS
│   └── middleware.ts          # SSR защита /admin (Edge, Web Crypto)
├── public/
│   ├── images/photozones/     # 48 фотозон (AI + реальные фото)
│   ├── videos/photozones/     # 15 Ken Burns видео
│   ├── guides/                # 3 HTML-гайда
│   ├── downloads/             # 3 PDF-гайда
│   └── favicon*
├── deploy.sh                  # Скрипт деплоя на VPS
├── DEPLOY.md                  # Инструкция деплоя
└── next.config.ts             # Security headers, CSP, images
```

## Ключевые механики

### Быстрый заказ
Модалка (≤20 сек, 4 поля: имя/телефон+7/дата/комментарий). Доступна с любой страницы. POST /api/leads → Telegram + email менеджеру.

### Квиз «Подберём за 30 секунд»
6 шагов → 3 карточки (Эконом/Хит/Премиум) с ОТКРЫТЫМ результатом (без формы-шлюза). Промокод QUIZ5. Постоянная ссылка /podborka/[id] (90 дней). Partial-лиды сохраняются.

### Конструктор фотозон
4 шага: основа → стиль → доп.элементы (из БД) → дата/адрес. Live-цена, sticky-бар. → openQuickOrder с config.

### Лид-магниты (3 PDF)
«47 пунктов свадьбы» / «Чек-лист родкомитета» / «20 идей НГ». Форма → PDF + промокод QUIZ5. Дожим-цепочка 3 касания.

### Промокоды за отзывы
Менеджер выдаёт FOTO-XXXX (6 символов, 5%, 12 мес). WhatsApp-шаблоны (6 сценариев). Валидация в форме заказа.

### Календарь занятости
Месячная сетка. Бронирования + блокировки + заявки. Подбор свободных аналогов. Авто-бронь при CONFIRMED.

### Редактор страниц
9 типов блоков: heading, paragraph, list, image, CTA, quote, FAQ, stats, divider. Inline-редактирование.

## Модели БД (14)

| Модель | Назначение |
|--------|-----------|
| Manager | Админы (email, passwordHash, totpSecret) |
| PhotoZone | 48 фотозон (slug, title, category, occasions, basePrice, images, videos, styles, sizeClass) |
| Element | Доп. опции (name, price, image, category, photozoneId?) |
| Lead | Заявки (name, phone, eventDate, source, utm, config, status) |
| Booking | Бронирования (leadId, photozoneId, date, status) |
| DateBlock | Ручные блокировки дат |
| Promo | Акции (title, discount, code, pages, isActive) |
| PromoCode | Персональные промокоды (code, discountPct, leadId, expiresAt, status) |
| QuizSession | Сессии квиза (answers, recommendedIds, promoCode, views) |
| QuizPartial | Брошенные квизы (answers, step, converted) |
| Review | Отзывы (author, text, photos, videos, rating, photozoneId) |
| Article | Блог (slug, title, content, cover) |
| Page | Редактируемые страницы (slug, blocks JSON) |
| LeadMagnet | PDF-гайды (slug, title, fileUrl, downloads) |

## Безопасность

| Мера | Где |
|------|-----|
| JWT HMAC-SHA256 | src/lib/auth.ts |
| 2FA TOTP | src/lib/totp.ts + /admin/settings |
| SSR middleware | src/middleware.ts (Edge, Web Crypto) |
| Rate limiting | src/lib/rate-limit.ts (5-20 req/мин) |
| Security headers | next.config.ts (CSP, HSTS, X-Frame, nosniff) |
| Magic bytes | /api/reviews (проверка файлов) |
| JSON-LD XSS | src/components/seo/json-ld.tsx (экранирование) |
| Cookie sameSite=strict | src/lib/auth.ts |

## Команды

| Команда | Описание |
|---------|----------|
| `bun run dev` | Dev-сервер (порт 3000) |
| `bun run build` | Production-сборка |
| `bun run start` | Запуск production |
| `bun run lint` | ESLint |
| `bun run db:push` | Применить схему к БД |
| `bun run db:generate` | Сгенерировать Prisma Client |
| `bun run prisma/seed.ts` | Залить начальные данные |
| `./deploy.sh root@IP` | Деплой на VPS |

## Демо-доступ

```
URL: /admin/login
Email: admin@fotozona24.ru
Пароль: admin123
```

⚠️ В production сменить через .env (ADMIN_PASSWORD + ADMIN_JWT_SECRET)

## Деплой

VPS (RUVDS 149₽, 512МБ RAM, SQLite):
```bash
./deploy.sh root@IP_СЕРВЕРА
```
Автоматически: сборка → загрузка → swap 2ГБ → SQLite → PM2 (лимит 384МБ)

## Переменные окружения (.env)

```env
DATABASE_URL=file:./db/custom.db
ADMIN_JWT_SECRET=<32+ символа>
ADMIN_EMAIL=admin@fotozona24.ru
ADMIN_PASSWORD=<сильный пароль>
TELEGRAM_BOT_TOKEN=<от @BotFather>
TELEGRAM_MANAGER_CHAT_ID=<от @userinfobot>
MANAGER_EMAIL=order@fotozona24.ru
RESEND_API_KEY=<от resend.com>
RESEND_FROM=ФотоЗона24 <noreply@fotozona24.ru>
```

## Что НЕ делать

- НЕ использовать `output: "standalone"` (мешает деплою)
- НЕ коммитить `.env` (в .gitignore)
- НЕ использовать Turbopack (OOM на 512МБ)
- НЕ использовать PostgreSQL на 512МБ VPS (SQLite экономит 150МБ RAM)
- НЕ запускать `next build` на VPS 512МБ (собирать локально)
