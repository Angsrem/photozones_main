# Fotoarka — выжимка для AI

**Сайт аренды фотозон в Красноярске.** Next.js 16 + TypeScript + Prisma + SQLite.

## Кратко
- 48 фотозон в каталоге с фильтрами, сортировкой, галереей, видео, доп. опциями
- Быстрый заказ (модалка, 4 поля, Telegram+email уведомления)
- Квиз (6 шагов → 3 карточки, открытый результат, промокод QUIZ5)
- Конструктор фотозон (4 шага, live-цена, доп. опции из БД)
- 3 PDF лид-магнита с дожим-цепочкой
- Промокоды за отзывы (FOTO-XXXX, WhatsApp-шаблоны)
- Админка: дашборд, заявки, календарь, фотозоны CRUD, акции, отзывы, страницы, 2FA
- SEO: JSON-LD (8 типов), sitemap, robots, GEO-ключи
- Безопасность: JWT, 2FA, rate limit, CSP, SSR middleware, magic bytes

## Стек
Next.js 16 App Router | TypeScript | Tailwind 4 + shadcn/ui | Prisma + SQLite | Framer Motion | Inter + Unbounded

## Запуск
```bash
bun install && bun run db:push && bun run prisma/seed.ts && bun run dev
```
Админка: /admin/login → admin@fotoarka.ru / admin123

## Деплой
```bash
./deploy.sh root@IP    # VPS 512МБ, SQLite, PM2, swap 2ГБ, лимит 384МБ RAM
```

## Ключевые файлы
- `src/lib/auth.ts` — JWT + 2FA + cookie
- `src/lib/leads.ts` — создание заявок + подбор аналогов
- `src/lib/quiz.ts` — мэтчинг квиза (каскадный фильтр)
- `src/lib/notify.ts` — Telegram + email + дожим
- `src/lib/promo-codes.ts` — генерация + валидация
- `src/middleware.ts` — SSR защита /admin
- `prisma/schema.prisma` — 14 моделей
- `next.config.ts` — security headers + CSP
- `deploy.sh` — деплой на VPS
