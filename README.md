# ФотоЗона24 — аренда фотозон в Красноярске

Продающий сайт аренды фотозон: публичная часть + админ-панель.

## Технологии

- **Next.js 16** (App Router, TypeScript)
- **Prisma ORM** (SQLite для разработки, PostgreSQL для продакшена)
- **Tailwind CSS 4** + **shadcn/ui**
- **Framer Motion** (анимации)
- **Inter + Unbounded** (шрифты, next/font)

## Структура проекта

```
├── prisma/
│   ├── schema.prisma       # схема БД (SQLite для dev)
│   └── seed.ts             # начальные данные (49 фотозон, отзывы, заявки, менеджер)
├── src/
│   ├── app/
│   │   ├── (public)/        # публичные страницы (главная, каталог, посадочные)
│   │   ├── admin/           # админ-панель (заявки, календарь, фотозоны, акции, отзывы, страницы)
│   │   ├── api/             # API endpoints (leads, reviews, quiz, admin/*)
│   │   ├── layout.tsx       # корневой layout (шрифты, favicon, metadata)
│   │   ├── sitemap.ts       # динамический sitemap.xml
│   │   └── robots.ts        # robots.txt
│   ├── components/site/    # переиспользуемые компоненты (QuickOrderModal, PhotozoneCard, etc.)
│   ├── components/ui/       # shadcn/ui компоненты
│   ├── lib/                 # бизнес-логика (auth, db, leads, notify, quiz, seo, rate-limit)
│   └── hooks/               # React hooks
├── public/                 # статика (изображения, видео, favicon, manifest)
│   ├── images/photozones/   # фото фотозон (AI-генерация + реальные фото)
│   ├── videos/photozones/  # видео фотозон (Ken Burns эффект)
│   └── uploads/reviews/    # фото/видео из отзывов пользователей
├── scripts/                 # служебные скрипты (генерация изображений, seed-отзывы)
├── .env                     # переменные окружения (НЕ коммитить)
├── next.config.ts           # конфиг Next.js (security headers, images)
├── package.json
└── start-dev.sh             # watchdog-скрипт для dev-сервера
```

## Быстрый старт (разработка)

### 1. Установка зависимостей

```bash
bun install
```

### 2. Настройка .env

```bash
# .env уже создан, но для продакшена нужно заполнить:
DATABASE_URL=file:./db/custom.db          # SQLite для dev
ADMIN_JWT_SECRET=<32+ символа>            # openssl rand -base64 48
ADMIN_EMAIL=admin@fotozona24.ru
ADMIN_PASSWORD=<сильный пароль>
TELEGRAM_BOT_TOKEN=<от @BotFather>
TELEGRAM_MANAGER_CHAT_ID=<от @userinfobot>
MANAGER_EMAIL=order@fotozona24.ru
RESEND_API_KEY=<от resend.com>
RESEND_FROM=ФотоЗона24 <noreply@fotozona24.ru>
# NEXT_PUBLIC_YM_ID=<Яндекс.Метрика ID>
```

### 3. Инициализация БД

```bash
bun run db:push        # создать таблицы
bun run db:generate    # сгенерировать Prisma Client
bun run prisma/seed.ts # залить начальные данные (49 фотозон, отзывы, заявки, менеджер)
```

### 4. Запуск dev-сервера

```bash
bun run dev
# или через watchdog (автоперезапуск):
bash start-dev.sh
```

Открыть http://localhost:3000

### 5. Демо-доступ к админке

```
URL: http://localhost:3000/admin/login
Email: admin@fotozona24.ru
Пароль: admin123
```

⚠️ **ВНИМАНИЕ:** В продакшене ОБЯЗАТЕЛЬНО смените пароль через .env (`ADMIN_PASSWORD`)

## Запуск в продакшене

### Вариант 1: VPS + Docker (рекомендуется)

```bash
# 1. Клонировать репозиторий
git clone <repo-url> fotozona24
cd fotozona24

# 2. Создать .env с продакшен-настройками (см. выше)
# Для PostgreSQL:
DATABASE_URL=postgresql://user:password@localhost:5432/fotozona24?schema=public

# 3. Установить зависимости
bun install

# 4. Инициализировать БД
bun run db:push
bun run prisma/seed.ts

# 5. Собрать
bun run build

# 6. Запустить
bun run start
# Сервер будет на порту 3000
```

### Вариант 2: VPS + PM2

```bash
npm install -g pm2
bun run build
pm2 start "bun run start" --name fotozona24
pm2 save
pm2 startup
```

### Nginx/Caddy (обратный прокси)

```nginx
# nginx.conf
server {
    listen 80;
    server_name fotozona24.ru www.fotozona24.ru;
    return 301 https://$host$request_uri;
}
server {
    listen 443 ssl http2;
    server_name fotozona24.ru www.fotozona24.ru;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

## Переключение на PostgreSQL

1. В `prisma/schema.prisma` изменить:
```prisma
datasource db {
  provider = "postgresql"   # было "sqlite"
  url      = env("DATABASE_URL")
}
```

2. В `.env` указать PostgreSQL URL:
```
DATABASE_URL=postgresql://user:password@localhost:5432/fotozona24?schema=public
```

3. Заменить даты в schema: `String` → `DateTime @db.Date` для `eventDate`, `date` в Booking и DateBlock

4. Выполнить:
```bash
bun run db:push
bun run db:generate
bun run prisma/seed.ts
```

## Основные команды

| Команда | Описание |
|---------|----------|
| `bun run dev` | Dev-сервер (http://localhost:3000) |
| `bun run build` | Production-сборка |
| `bun run start` | Запуск production-сервера |
| `bun run lint` | ESLint проверка |
| `bun run db:push` | Применить схему к БД |
| `bun run db:generate` | Сгенерировать Prisma Client |
| `bun run prisma/seed.ts` | Залить начальные данные |
| `bash start-dev.sh` | Dev-сервер с автоперезапуском (watchdog) |

## Функционал

### Публичная часть
- 49 фотозон в каталоге с фильтрами и сортировкой (хиты, цена, рейтинг, отзывы)
- Карточка фотозоны: галерея с lightbox, видео при наведении, опции с пересчётом цены
- Быстрый заказ (модалка, 4 поля, ≤20 секунд)
- Квиз «Подберём фотозону за 30 секунд» (6 шагов, открытый результат)
- Калькулятор стоимости (4-шаговый wizard)
- QR-лендинг с промокодом QR10
- Отзывы: карусель под галереей, фото/видео, форма с антиспамом
- Промокоды за отзывы (реферальная механика)
- Telegram + email уведомления менеджеру

### Админ-панель (/admin)
- Дашборд: KPI, брошенные квизы, статус уведомлений
- Заявки: CRUD, статусы, промокоды, WhatsApp-шаблоны
- Календарь занятости: месячная сетка, блокировки, подбор аналогов
- Фотозоны: CRUD, опции, видео, теги для квиза
- Акции: промо-блоки на страницах
- Отзывы: модерация (публикация/скрытие/удаление)
- Страницы: блочный редактор контента (9 типов блоков)

### Безопасность
- JWT-авторизация (HMAC-SHA256)
- Rate limiting (5-20 запросов/мин на эндпоинты)
- Security headers (CSP, X-Frame-Options, HSTS, nosniff)
- Magic bytes проверка загружаемых файлов
- JSON-LD XSS-защита
- Cookie sameSite=strict, TTL 1 день

## Что НЕ входит в архив

- `node_modules/` (1.2 ГБ) — устанавливается через `bun install`
- `.next/` (176 МБ) — сборка, генерируется через `bun run build`
- `db/custom.db` (300 КБ) — SQLite БД, создаётся через `bun run db:push`
- `.env` — секреты, создаётся вручную
- `upload/` — исходные загруженные фото (уже скопированы в `public/images/`)
