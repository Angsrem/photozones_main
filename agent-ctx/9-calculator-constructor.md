# Task ID: 9 — Калькулятор `/kalkulyator` + заглушка `/konstruktor`

**Агент:** fullstack-код (Next.js 16 App Router). Статус: **готово**.

## Что сделано

### 1. `/kalkulyator` — Калькулятор стоимости (wizard)
- `src/app/(public)/kalkulyator/page.tsx` — серверная: metadata (title «Калькулятор стоимости фотозоны в Красноярске», canonical `/kalkulyator`), JSON-LD (`localBusinessLd` + `breadcrumbsLd`), hero, рендер `<CalculatorWizard>`, `TrustBadges`, `CtaBand`, phone-CTA.
- `src/app/(public)/kalkulyator/calculator-wizard.tsx` — `'use client'`, 4 шага:
  1. Повод (карточки-радио: Свадьба/День рождения/Выпускной/Корпоратив/Сезонный праздник; значения из `OCCASIONS` + `SEASONAL`).
  2. Стиль (Классика/Флора, Неон, Рустик/Бохо, Сезонная, Брендовая; каждый влияет на базу: +0/+2000/+1500/+1000/+3000).
  3. Основа (Каркасная S/M/L 8900/12900/17900, Пресс-волл 15900, Текстильная 10900) + чекбоксы допов (Световые буквы 3900, Неон 3500, Шары 2500, Гирлянда 1500, Печать логотипа 4500, Доп. час 800).
  4. Дата (`<input type=date min=today>`) + адрес + чекбокс «Пригород» (+`SITE.suburbSurcharge`=1500, подсказка со списком `SITE.suburbs`).
- Прогресс-бар + кастомный stepper (active/done). Анимации `framer-motion` `AnimatePresence mode="wait"`.
- Результат: total = base + styleModifier + Σaddons + suburb; breakdown по строкам; дисклеймер «Расчёт ориентировочный...».
- Кнопка «Зафиксировать расчёт и заказать» → `openQuickOrder({ source:'kalkulyator', sourcePage:'/kalkulyator', occasion, priceEstimate, config:{...весь объект} })`.

### 2. `/konstruktor` — Заглушка (этап 2)
- `src/app/(public)/konstruktor/page.tsx` — серверная: metadata (title «Конструктор фотозон в Красноярске — скоро», canonical `/konstruktor`), JSON-LD (`localBusinessLd` + `breadcrumbsLd`).
- H1 «Конструктор фотозон — скоро», текст-описание, иллюстрация-заглушка (gradient-блок с `Wand2` + pulse-индикатор).
- `OrderButton` (2×) с `prefill={{ source:'konstruktor-stub', sourcePage:'/konstruktor', config:{ type:'konstructor-request' } }}`.
- Список «Что будет в конструкторе»: 4 карточки (Выбор основы / Добавление элементов / Живая цена / Сохранение конфигурации).
- `CtaBand` внизу.

## Проверки
- `bun run lint` — 0 ошибок, 0 предупреждений.
- Lint-fix: убрал `setState` в `useEffect` для `minDate` (правило `react-hooks/set-state-in-effect`) — теперь `minDate = todayISO()` считается в рендере, на `<input>` добавлен `suppressHydrationWarning`.
- curl smoke-тест: `/kalkulyator` → 200, `/konstruktor` → 200; контент и canonical/title корректны.
- Build не запускался (по требованию).

## Ограничения соблюдены
- Не модифицировал `globals.css`, `layout.tsx`, shared-компоненты.
- Палитра: только `gold`/`coral`/`text-gradient-gold`, без indigo/blue.
- Тап-таргеты ≥ 44px (кнопки `h-12`, карточки `min-h-[88px]`, аддоны `min-h-[56px]`).
- Импорты только из разрешённых модулей.

## Заметки
- Цены шагов захардкожены в `calculator-wizard.tsx` (реалистичные, не из БД). При появлении БД-цен — заменить `ADDON_OPTIONS`/`BASE_OPTIONS`.
- `config` в `openQuickOrder` сериализуется в `Lead.config` (JSON) через `/api/leads` (модалка уже это делает).
- `occasion='SEASONAL'` — обобщённое значение для сезонных праздников.
