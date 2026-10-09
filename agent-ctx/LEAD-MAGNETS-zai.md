# LEAD-MAGNETS — Система лид-магнитов (PDF-гайды за контакт)

**Агент:** LEAD-MAGNETS (fullstack, single-agent задача)
**Статус:** готово

## Что сделано

### 1. Схема БД
- Добавлена модель `LeadMagnet` в `prisma/schema.prisma` (slug, title, description, fileUrl, occasion, isActive, downloads, timestamps)
- `bun run db:push` + `bun run db:generate` — Prisma-клиент обновлён
- **ВАЖНО:** после добавления модели требовался рестарт dev-сервера — старый `PrismaClient` в `globalForPrisma.prisma` не имел getter'а `leadMagnet`. После init-fullstack_1775040338514.sh (повторный запуск) dev-сервер поднялся с новым клиентом.

### 2. Seed 3 лид-магнита (`scripts/seed-lead-magnets.ts`)
- `svadba-47-punktov` — «47 пунктов оформления свадьбы в Красноярске» (occasion: WEDDING, fileUrl: `/downloads/svadba-47-punktov.pdf`)
- `vypusknoj-cheklist` — «Чек-лист родкомитета: выпускной без хаоса» (occasion: GRADUATION, fileUrl: `/downloads/vypusknoj-cheklist.pdf`)
- `ng-20-idey` — «20 идей новогодней фотозоны: от 5 000 ₽» (occasion: NEW_YEAR, fileUrl: `/downloads/ng-20-idey.pdf`)
- Скрипт идемпотентен (upsert по slug).

### 3. API POST `/api/lead-magnets` (`src/app/api/lead-magnets/route.ts`)
- Принимает: `slug`, `name`, `phone` (маска +7), `email` (опционально)
- Валидация: `name` обязательно, `phone` через `isPhoneValid`, `email` регуляркой, `slug` существует и активен (404 если нет)
- Rate-limit: **5 запросов в минуту на IP** (через существующий `rateLimit` + `getClientIp`)
- Создаёт `Lead` со `source='leadmagnet'`, `config: { type, leadMagnetSlug, leadMagnetTitle, email, promoCode: 'QUIZ5', promoDiscount: 5 }`, `comment: 'Email: ...'`, `occasion` из магнита, `eventDate: +14 дней` (заглушка — клиент не обязан указывать дату)
- **Инкрементирует** `LeadMagnet.downloads` через `db.leadMagnet.update({ data: { downloads: { increment: 1 } } })`
- Запускает `sendDripEmail(email, 1, slug, { name, leadId })` для шага 1 (только если email указан) — fire-and-forget, не блокирует ответ
- Возвращает `{ ok, id, fileUrl, title, promoCode: 'QUIZ5', promoDiscount: 5, expiresAt: +5 дней }` (201)
- `GET /api/lead-magnets` — публичный список активных магнитов (для SSR-компонентов)

### 4. API GET `/api/admin/lead-magnets` (`src/app/api/admin/lead-magnets/route.ts`)
- Защищён сессией (`getSession()`) — без сессии 401
- Возвращает `{ items, totalDownloads, activeCount, total }`
- Список отсортирован по downloads desc, включает все поля (slug, title, description, fileUrl, occasion, isActive, downloads)

### 5. Компонент `LeadMagnetBlock` (`src/components/site/lead-magnet-block.tsx`)
- **Серверный** — тянет магнит из БД по `slug` (props). Если не найден/неактивен — рендерит `null` (молча).
- Карточка: золотая обёртка `border-gold/30 + bg-gradient-to-br from-gold/10`, иконка «PDF» в круге, бейдж «Бесплатный гайд», заголовок, описание, кнопка «Скачать PDF» (открывает модалку)
- Кнопка передаёт в клиентскую модалку `{ slug, title, fileUrl, occasion, sourcePage }`

### 6. Модалка `LeadMagnetModal` (`src/components/site/lead-magnet-modal.tsx`)
- **Клиентская** (`'use client'`) — обёртка над shadcn `Dialog`
- Форма: имя*, телефон* (через существующий `PhoneInput` с маской +7), email (опционально)
- Валидация на клиенте перед POST; дублирует серверную (имя/телефон/email)
- POST `/api/lead-magnets` с `{ slug, name, phone, email, sourcePage, occasion, utm, referrer }`
- **Success-экран**: иконка ✓, заголовок «Готово! Вот ваш PDF», кнопка-ссылка `<a href={fileUrl} download>` (реальное скачивание), блок промокода QUIZ5 со сроком (5 дней), подсказка про перезвон 15 мин, кнопка «Спасибо!»
- Анимации framer-motion (fade + spring для иконки успеха)
- Тап-таргеты ≥ 44px (input h-12 = 48px, button h-12)
- Доступность: `Dialog`, `DialogTitle`, `DialogDescription`, `aria-label`

### 7. Размещение на посадочных
- `/svadby` — `LeadMagnetBlock slug="svadba-47-punktov"` (после `QuizStrip`, перед сеткой фотозон)
- `/vypusknie` — `LeadMagnetBlock slug="vypusknoj-cheklist"` (после `QuizStrip`, перед сеткой фотозон)
- `/prazdniki/novyj-god` — `LeadMagnetBlock slug="ng-20-idey"` (после `QuizStrip`, перед промо-блоком)
- `sourcePage` передаётся для аналитики (попадает в `Lead.sourcePage`)

### 8. Дожим-цепочка (3 касания) — `src/lib/notify.ts`
- Добавлен импорт `db` из `@/lib/db` (для подтягивания магнита в `sendDripEmail`)
- `sendDripEmail(to, step, leadMagnetSlug, ctx)` — функции-заготовки (без cron, для демо/ручного вызова)
  - **Шаг 1 (сразу)**: PDF + промокод QUIZ5. Тема: «Ваш PDF «<title>» + промокод QUIZ5». Кнопка «⬇ Скачать PDF» (ссылка на `SITE.url + fileUrl`), блок промокода, упоминание перезвона 15 мин
  - **Шаг 2 (+2 дня)**: «Успеем рассчитать под вашу дату». Кнопки «Открыть калькулятор» + «В каталог», напоминание что QUIZ5 ещё действует
  - **Шаг 3 (+5 дней)**: «Промокод QUIZ5 истекает завтра». Кнопки «Выбрать фотозону» + «Позвонить», текст «если не актуально — просто не отвечайте»
- HTML-шаблоны в фирменном стиле (золотой заголовок, коралловый фон для финального шага)
- Если `RESEND_API_KEY` не задан — fallback в лог (как и для других email в `notify.ts`)
- Шаг 1 вызывается автоматически из POST `/api/lead-magnets` (если email указан), шаги 2-3 — для будущего cron/очереди

### 9. Админ-дашборд (`src/app/admin/page.tsx`)
- В `Promise.all` при загрузке добавлен запрос `/api/admin/lead-magnets` (с `.catch(() => null)` — не падает если эндпоинт недоступен)
- Новый блок «Лид-магниты · PDF-гайды» (между «Брошенные квизы» и графиком по статусам):
  - Заголовок с иконкой `FileDown`, сводка «Скачиваний всего: N · активных гайдов: X из Y»
  - Бейдж общего числа скачиваний
  - Список магнитов: название + бейдж повода (Свадьба/Выпускной/Новый год) + бейдж «Скрыт» если неактивен, slug + fileUrl мелким шрифтом, прогресс-бар (по максимальному downloads), число скачиваний справа
  - Прокрутка `max-h-80 overflow-y-auto`
  - Мапа `OCCASION_LABELS` для красивых подписей (аналогично `lib/notify.ts`)

## Проверки

### `bun run lint` — ✅ 0 ошибок, 0 предупреждений

### curl-тесты (dev-сервер на порту 3000):
1. `GET /api/lead-magnets` → 200, 3 магнита с `{ slug, title, description, occasion }` ✓
2. `POST /api/lead-magnets` (валидные данные + email) → 201, `{ ok, id, fileUrl, title, promoCode: 'QUIZ5', promoDiscount: 5, expiresAt }` ✓
3. `POST` с пустым `name` → 422 «Укажите имя» ✓
4. `POST` с коротким `phone` → 422 «Введите корректный телефон» ✓
5. `POST` с несуществующим `slug` → 404 «Лид-магнит не найден или снят с публикации» ✓
6. `POST` с невалидным `email` → 422 «Некорректный email» ✓
7. **Rate-limit 5/мин**: после 5 запросов — 429 «Слишком много запросов. Попробуйте позже.» ✓
8. `GET /api/admin/lead-magnets` без сессии → 401 ✓
9. `GET /api/admin/lead-magnets` после `/api/admin/login` (admin@fotozona24.ru / admin123) → 200, `{ items: [...3 магнита...], totalDownloads: 2, activeCount: 3, total: 3 }` ✓ (downloads инкрементированы)
10. `GET /svadby` → 200, в HTML присутствуют «Бесплатный гайд», «47 пунктов», «svadba-47-punktov», «Скачать PDF» ✓
11. `GET /vypusknie` → 200, присутствуют «Чек-лист родкомитета», «vypusknoj-cheklist» ✓
12. `GET /prazdniki/novyj-god` → 200, присутствуют «20 идей новогодней», «ng-20-idey» ✓
13. `GET /admin` с cookie-сессией → 200 (рендерит `Проверка доступа` — дашборд клиентский, данные подгружаются после hydration через `/api/admin/me` + `/api/admin/stats` + `/api/admin/lead-magnets`) ✓
14. `GET /api/admin/leads?limit=2` после тестовых POST → лиды со `source='leadmagnet'`, `occasion` из магнита, `config: { type, leadMagnetSlug, leadMagnetTitle, email, promoCode, promoDiscount }` ✓
15. dev.log: после тестовых POST видны `[notify:drip] step 1 → <email> (magnet=<slug>, lead=<id>)` + `[notify:email] ... Ваш PDF «<title>» + промокод QUIZ5` (fallback в лог, т.к. нет RESEND_API_KEY) ✓

### Проверка ошибок в dev.log — нет runtime-ошибок после всех изменений

## Заметка следующим агентам
- Файл PDF не создан — `fileUrl` указывает на `/downloads/<slug>.pdf` (заглушка). Когда PDF будет готов, нужно положить в `public/downloads/`. Ссылка `SITE.url + fileUrl` уже используется в drip-email шаге 1.
- `Lead.eventDate` обязательный по схеме — для лид-магнита подставляется `+14 дней` как заглушка. Если позже появится дата в форме, можно прокинуть через API.
- `sendDripEmail` — заготовка без cron. Шаг 1 уже вызывается автоматически. Шаги 2 и 3 нужно вызывать из cron (например, через `node-cron` или внешний триггер) — для демо можно дёрнуть вручную.
- Если в `LeadMagnetBlock` передать несуществующий/неактивный `slug` — компонент вернёт `null` (молча). Это поведение — для безопасного размещения на посадочных без ручного удаления при скрытии магнита.
- Админ-блок «Лид-магниты» получает данные через `/api/admin/lead-magnets`. Эндпоинт возвращает `totalDownloads/activeCount/total` — можно использовать для KPI-карточки в будущем.
- Промокод `QUIZ5` (5%) захардкожен в API и drip-шаблонах. Если появится персональный промокод (как `FOTO-XXXX` из `ORCHESTRATOR-16`), можно интегрировать через `LeadPromoCodes` вместо хардкода.
