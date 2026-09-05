# Worklog — ФотоЗона24 (аренда фотозон в Красноярске)

## Общий контекст для всех агентов

Проект: продающий сайт аренды фотозон. Next.js 16 App Router + TypeScript + Tailwind 4 + shadcn/ui + Prisma (SQLite) + Framer Motion. Тёмная премиальная палитра (золото `text-gold`/`bg-gold`, коралл `text-coral`). Шрифт display — `font-display` (Playfair), обычный — Geist.

### ВАЖНЫЕ правила
- Публичные страницы рендерятся в route-group `src/app/(public)/` (layout уже есть с хедером/футером/sticky-CTA/модалкой быстрого заказа). **Не дублируйте layout.** Просто кладите page.tsx в нужную папку.
- Все публичные page.tsx — **серверные компоненты** по умолчанию. 'use client' только там, где нужны хуки/события.
- КЛИЕНТУ НИГДЕ не показываем занятость дат. Только менеджер в /admin.
- Кнопка «Заказать» везде открывает модалку быстрого заказа через `<OrderButton prefill={...}>` или `openQuickOrder({...})` (из `@/components/site/quick-order-store`). НЕ делайте отдельные формы на страницах — используйте модалку.
- Используйте существующие shadcn/ui компоненты из `src/components/ui/*`.
- Изображения — через `next/image`. Папки: `/images/photozones/<slug>.png`, `/images/hero.png`. Seed фотозон уже ссылается на эти пути.
- Sticky footer уже обеспечен layout'ом (`min-h-screen flex flex-col` + `mt-auto` на футере). Не ломайте.
- Мобильные отступы: основной контент имеет `pb-20 sm:pb-0` (место под sticky CTA на мобилке).

### Доступные shared-компоненты (импортируйте, не создавайте дубли)
- `@/components/site/photozone-card` → `PhotozoneCard({ pz, index })`, `TrustBadges({ className })`, `SectionHeading({ eyebrow, title, subtitle, center })`
- `@/components/site/quick-order-modal` → `OrderButton({ prefill, children, className, variant, size })`
- `@/components/site/quick-order-store` → `openQuickOrder(prefill)` (для client-компонентов)
- `@/components/site/cta-band` → `CtaBand({ title, subtitle, prefill })`
- `@/components/site/faq-accordion` → `FaqAccordion({ items: {q,a}[] })`
- `@/components/site/phone-input` → `PhoneInput`
- `@/components/seo/json-ld` → `JsonLd({ data: object | object[] })`

### Data access (серверные запросы к БД)
- `@/lib/data` → `getPhotozones({ category?, occasion?, search?, sort?, limit? })`, `getPhotozoneBySlug(slug)`, `getReviews(limit)`, `getArticles()`, `getArticleBySlug(slug)`, `asStringArray(json)` 
- `@/lib/db` → `db` (Prisma client). Модели: PhotoZone, Element, Lead, Booking, DateBlock, Promo, Review, Article, Manager.
- `@/lib/constants` → `SITE` (телефон/email/адрес/районы/...), `NAV_LINKS`, `OCCASIONS`, `CATEGORIES`, `LEAD_STATUSES`, `BOOKING_STATUSES`
- `@/lib/format` → `formatPrice(n)`, `formatPriceFrom(n)`, `formatDateRu(iso)`, `formatDateShort(iso)`, `todayISO()`, `addDaysISO(n)`, `pluralize(n, forms)`
- `@/lib/seo` → `localBusinessLd()`, `productLd(p)`, `breadcrumbsLd(items)`, `faqLd(qa)`, `reviewsLd(reviews)`

### Поля PhotoZone (Prisma)
id, slug, title, description, category (FRAME|PRESSWALL|TEXTILE|THEME), occasions (Json:string[]), basePrice (int, "от"), sizeW, sizeH (float), images (Json:string[]), includes (Json:string[]), badge ('HIT'|'NEW'|null), hit (bool), isActive, sortOrder, elements[] (relation: {id,name,price}).

### SEO-паттерн для страницы
```tsx
import type { Metadata } from 'next';
export const metadata: Metadata = {
  title: '...', // попадёт в шаблон "%s — ФотоЗона24 Красноярск"
  description: '...',
  alternates: { canonical: '/put' },
};
// JSON-LD рендерить в теле страницы: <JsonLd data={[localBusinessLd(), breadcrumbsLd([...]), faqLd(qa)]} />
```

### Контакты (из SITE)
Телефон: +7 (391) 219-00-24, WhatsApp: 79999990024, Telegram: fotozona24_krsk, email: order@fotozona24.ru, адрес: г. Красноярск, ул. Парижской Коммуны, 33, часы: Ежедневно 9:00–21:00. Районы: Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский. Пригороды: Солнечный, Подгорный, Емельяново.

### Тестовые данные (seed уже залит)
15 фотозон с slug'ами: love-installyaciya, novogodnyaya-mishura, stilyagi, bukvy-i-cifry, press-wall-premium, svadebnaya-flora, edonorog, korporativ-brand, vesna-8-marta, muzhskaya-23-fevralya, vypusknoj-zvezdy, tekstil-shampan, neon-party, rustic-garden, shary-arka. 10 отзывов, 7 заявок (разные статусы), 2 промо, 2 статьи, 1 менеджер (admin@fotozona24.ru / admin123).

---

## Task ID: 9 — Калькулятор-визард `/kalkulyator` и заглушка `/konstruktor`

**Агент:** кодовая задача (fullstack-раздел). Файлы:
- `src/app/(public)/kalkulyator/page.tsx` — серверная страница (metadata, JSON-LD, hero, рендер wizard, TrustBadges, CtaBand, phone-CTA).
- `src/app/(public)/kalkulyator/calculator-wizard.tsx` — `'use client'` 4-шаговый wizard.
- `src/app/(public)/konstruktor/page.tsx` — серверная заглушка конструктора (этап 2).

### `/kalkulyator` — Калькулятор стоимости (wizard)
- **4 шага** с прогресс-баром (`Progress` + кастомный stepper с состояниями active/done):
  1. **Повод** — карточки-радио (Свадьба / День рождения / Выпускной / Корпоратив / Сезонный праздник). Значения `WEDDING/BIRTHDAY/GRADUATION/CORPORATE` тянутся из `OCCASIONS`, `SEASONAL` добавлен как обобщающий сезонный повод.
  2. **Стиль** — радио (Классика/Флора, Неон, Рустик/Бохо, Сезонная, Брендовая). Каждый стиль имеет `modifier`, влияющий на базу: 0 / +2000 / +1500 / +1000 / +3000 ₽.
  3. **Основа + доп. элементы** — выбор основы (Каркасная S 8900 / M 12900 / L 17900, Пресс-волл 15900, Текстильная 10900) + чекбоксы допов (Световые буквы +3900, Неоновая надпись +3500, Шары 50шт +2500, Гирлянда +1500, Печать логотипа +4500, Доп. час +800).
  4. **Дата и адрес** — `<input type="date" min={today()}>` (min считается в рендере + `suppressHydrationWarning` от SSR/CSR-мисматча на границе суток; lint-clean, без `setState` в `useEffect`) + инпут адреса + чекбокс «Пригород» (`SITE.suburbSurcharge = 1500`) с подсказкой-списком пригородов из `SITE.suburbs`.
- Кнопки «Назад»/«Далее», на шаге 4 — «Рассчитать» → результат с breakdown.
- **Результат**: ориентировочная цена = base + styleModifier + Σaddons + suburb. Показан большой total + детальный breakdown (повод/стиль/основа/каждый доп/пригород/дата/адрес) + дисклеймер «Расчёт ориентировочный. Точную цену менеджер назовёт по телефону за 15 минут.»
- Кнопка «Зафиксировать расчёт и заказать» → `openQuickOrder({ source:'kalkulyator', sourcePage:'/kalkulyator', occasion, priceEstimate, config: { полный объект: occasion, occasionLabel, style, styleLabel, base{value,label,desc,price}, addons[], date, address, isSuburb, suburbSurcharge, breakdown{base,style,addons,suburb,total} } })`.
- Состояния доверия: hero-строка (Расчёт за 1 мин / 100+ меропр. / 4.9★) + `TrustBadges` под wizard.
- Анимации перехода шагов — `framer-motion` `AnimatePresence mode="wait"` (slide-x + fade), результат — slide-y.
- Все тап-таргеты ≥ 44px: кнопки `h-12` (48px), карточки-радио `min-h-[88px]`, аддон-строки `min-h-[56px]`.
- **metadata**: title «Калькулятор стоимости фотозоны в Красноярске», canonical `/kalkulyator`. JSON-LD: `localBusinessLd()` + `breadcrumbsLd([Главная → Калькулятор])`.

### `/konstruktor` — Заглушка конструктора (этап 2)
- H1 «Конструктор фотозон — скоро» (со «скоро» в `text-gradient-gold`).
- Текст про готовящийся интерактивный конструктор + призыв оставить заявку.
- Иллюстрация-заглушка: gradient-блок 4:3 с иконкой `Wand2`, pulse-индикатор «В разработке».
- 2× `OrderButton` с `prefill={{ source:'konstruktor-stub', sourcePage:'/konstruktor', config:{ type:'konstructor-request' } }}` (в hero и в inline-карточке «Хочу конструктор — перезвоните мне») — открывают модалку из layout.
- Список «Что будет в конструкторе»: Выбор основы / Добавление элементов / Живая цена / Сохранение конфигурации (4 карточки с иконками + нумерацией).
- `CtaBand` внизу (prefill `source:'konstruktor-cta'`).
- **metadata**: title «Конструктор фотозон в Красноярске — скоро», canonical `/konstruktor`. JSON-LD: `localBusinessLd()` + `breadcrumbsLd([Главная → Конструктор])`.

### Цвета и техника
- Палитра строго по дизайн-системе: `text-gold`/`bg-gold`/`text-gradient-gold`/`text-coral`. Без indigo/blue.
- Импорты только из разрешённых модулей (`@/lib/constants`, `@/lib/format`, `@/components/site/*`, `@/components/seo/json-ld`, `@/lib/seo`, `@/components/ui/*`).
- Не модифицировал `globals.css`, `layout.tsx`, shared-компоненты.
- `bun run lint` — **0 ошибок, 0 предупреждений**. Build не запускался.
- Smoke-тест curl: `/kalkulyator` → 200, `/konstruktor` → 200, ключевой контент рендерится, canonical/title корректны.

### Заметка следующим агентам
- Wizard полностью клиентский, данные шагов захардкожены внутри `calculator-wizard.tsx` (цены реалистичные, не из БД). При появлении `Element`/цен из БД — заменить `ADDON_OPTIONS`/`BASE_OPTIONS` на данные из `db`.
- `config` в `openQuickOrder` содержит весь объект расчёта — он попадает в `Lead.config` (JSON) через `/api/leads` (модалка уже сериализует `prefill.config`). Менеджер в `/admin` сможет увидеть конфигурацию.
- `occasion='SEASONAL'` — обобщённое значение; если нужно уточнить (Новый год/8 марта/23 февраля), это делается на стороне менеджера по комментарию или расширением шага 1.

---

## Task ID: 7 — Публичные страницы `/katalog`, `/katalog/[slug]`, `/ceny`

**Агент:** кодовая задача (fullstack-раздел). Файлы:
- `src/app/(public)/katalog/page.tsx` — серверная страница каталога (metadata, JSON-LD, hero, фильтры, сетка, пустое состояние, CtaBand).
- `src/app/(public)/katalog/catalog-filters.tsx` — `'use client'` панель фильтров (поиск + категория + повод + сортировка, обновление URL query).
- `src/app/(public)/katalog/[slug]/page.tsx` — серверная карточка фотозоны (generateMetadata + generateStaticParams + notFound + JSON-LD Product/Breadcrumbs/LocalBusiness).
- `src/app/(public)/katalog/[slug]/gallery.tsx` — `'use client'` переключаемая галерея (основное фото + превью с активным состоянием).
- `src/app/(public)/ceny/page.tsx` — серверная страница тарифов (3 карточки, таблица «что входит», блок доплат, CTA на калькулятор, CtaBand, FAQ+faqLd).

### `/katalog` — Каталог всех фотозон
- **Хлебные крошки** (Главная → Каталог) через shadcn `Breadcrumb`.
- **H1** «Каталог фотозон в Красноярске» + SEO-абзац с гео-ключами (районы: Центральный, Советский, Свердловский, Октябрьский; «монтаж за 1 час», «перезвоним за 15 минут»).
- **Счётчик** в eyebrow: «N фотозон/фотозоны/фотозон» через `pluralize`.
- **Фильтры** (`CatalogFilters`, `'use client'`): 4 контрола в `grid lg:grid-cols-4`:
  - Поиск по названию (`<Input type="search">` с иконкой Search, debounce не нужен — фильтрация серверная при submit URL).
  - Категория (`Select` из `CATEGORIES`: FRAME/PRESSWALL/TEXTILE/THEME + «Все категории»).
  - Повод (`Select` из `OCCASIONS` + «Любой повод»).
  - Сортировка (`Select`: Сначала хиты / Новинки / Цена ↑ / Цена ↓).
  - Все изменения мгновенно `router.push` через `useTransition` (sticky-панель с `backdrop-blur`).
  - Кнопка «Сбросить фильтры» появляется только когда есть активные фильтры.
- **Валидация на сервере**: `searchParams` — Promise в Next 16; значения проверяются against `CATEGORIES`/`OCCASIONS`/`['hit','new','price-asc','price-desc']`, иначе игнорируются (защита от мусора в URL).
- **Сетка карточек**: `grid gap-5 sm:grid-cols-2 lg:grid-cols-3`, каждая через `<PhotozoneCard pz={...} index={i} />`.
- **Строка активных фильтров** над сеткой («Показываем: Текстильная фотозона · Свадьба · «flora»»).
- **Пустое состояние**: иконка `SearchX` в золотом круге, заголовок «Ничего не нашли», 2 кнопки — `<OrderButton>` (prefill `source:'catalog-empty'`, передаётся `occasion` если выбран) и «Сбросить фильтры» (Link на `/katalog`).
- **CtaBand** внизу (prefill `source:'catalog-cta'`).
- **JSON-LD**: `localBusinessLd()` + `breadcrumbsLd([Главная → Каталог])`.
- **metadata**: title «Каталог фотозон в Красноярске — аренда с доставкой», description с гео, canonical `/katalog`.

### `/katalog/[slug]` — Карточка фотозоны + быстрый заказ
- **generateStaticParams**: `db.photoZone.findMany({ where:{ isActive:true }, select:{ slug:true } })` → все slug пререндерятся.
- **generateMetadata**: берёт `pz.title`, обрезает description до 158 символов + «…», canonical `/katalog/{slug}`, OpenGraph images из `pz.images`.
- **404**: `notFound()` если фотозона не найдена или `isActive:false`. Smoke-тест `/katalog/non-existent-slug` → 404.
- **params** — `Promise<{ slug: string }>` (Next 16, await).
- **Layout**: `grid lg:grid-cols-[1.2fr_1fr]` — слева галерея, справа sticky-сайдбар с инфо и кнопкой заказа.
- **Галерея** (`PhotozoneGallery`, `'use client'`): основное фото 4:3 + превью-grid (4-5 колонок), активное превью подсвечивается `border-gold` + `ring-gold/30`. Переключение по клику, доступные `aria-label` и `aria-current`.
- **Бейджи**: HIT/NEW из `pz.badge` (золотой), категория (outline gold), до 3 поводов.
- **H1** + цена «от N ₽» (`formatPriceFrom`) + размер (Ruler-иконка «3 × 2.4 м»).
- **Описание** полный текст.
- **«Что входит в стоимость»** — карточка с checklist из `asStringArray(pz.includes)`, иконка `Layers`, 2 колонки на sm+.
- **«Дополнительные элементы»** — список из `pz.elements` с ценами через `formatPrice`, divide-y.
- **CTA-блок (десктоп)** в сайдбаре: trust-строка (перезвон 15 мин / договор), `<OrderButton>` (`bg-gold`, `w-full`), кнопка-тел `tel:` (SITE.phoneRaw), подпись про доставку.
- **Похожие фотозоны**: `getPhotozones({ category, sort:'hit', limit:4 })` → фильтрую текущую, беру 3, рендерю `<PhotozoneCard>` grid 3 колонки.
- **CtaBand** с prefill из `orderPrefill` (source меняю на `'photozone-cta'`).
- **Sticky order bar (мобильные)**: `sm:hidden fixed bottom-0 z-40` — цена «от N ₽» + `<OrderButton>` (prefill `source:'photozone-card'`, `sourcePage:'/katalog/'+slug`). z-40 поверх глобального sticky CTA (z-30), `pb-[calc(0.75rem+env(safe-area-inset-bottom))]` учитывает safe-area.
- **Хлебные крошки**: Главная → Каталог → Название.
- **JSON-LD**: `localBusinessLd()` + `productLd({title, slug, description, basePrice, images})` + `breadcrumbsLd([3 элемента])`.
- **prefill для всех кнопок**: `{ photozoneId, photozoneTitle, photozoneImage, photozonePrice, source:'photozone-card', sourcePage:'/katalog/'+slug }`.

### `/ceny` — Тарифы + калькулятор CTA
- **Хлебные крошки** (Главная → Цены).
- **H1** «Цены на аренду фотозон в Красноярске» + лид-абзац.
- **3 тарифа** карточками (`Card`):
  - **Эконом** от 8 900 ₽ — световые буквы/цифры, базовая текстильная 2.5×2 м. Для дней рождений и семейных праздников.
  - **Стандарт** от 12 900 ₽ (badge «Самое популярное» в золоте, рамка `border-2 border-gold`, `lg:-mt-4` — слегка приподнят) — тематические фотозоны (мишура, стиляги, neon party). Для свадеб/юбилеев/корпоративов до 80 чел.
  - **Премиум** от 19 900 ₽ — пресс-волл с брендом, свадебная флора, LOVE-инсталляция. Для корпоративов от 100 чел и свадеб.
  - У каждой: иконка (Wallet/Star/Crown), цена (formatPrice), теглайн, описание, блок «Что входит» (checklist с `Check`-иконкой), блок «Для кого подходит», `<OrderButton>` с `prefill source:'ceny-{tier}'`, `priceEstimate`.
- **Таблица «Что входит в стоимость»** через shadcn `Table`: 7 строк × 4 колонки (Услуга / Эконом / Стандарт / Премиум), `Check` (золото) для включённых, `X` (muted/40) для невключённых. Колонка «Стандарт» подсвечена `text-gold`.
- **Блок «Доплаты»**: 3 карточки (Доставка в пригород +1 500 ₽ / Доп. час +800 ₽ / Печать логотипа +4 500 ₽) с иконками и подсказками (Солнечный, Подгорный, Емельяново).
- **CTA на калькулятор**: gradient-блок `border-gold/30` с заголовком, описанием и 2 кнопками — «Открыть калькулятор» (Link на `/kalkulyator`, `bg-gold`) и «Позвонить» (`tel:`).
- **CtaBand** внизу (prefill `source:'ceny-cta'`).
- **FAQ** (5 вопросов) через `FaqAccordion` + подпись с кнопками «Смотреть каталог» и «Позвонить».
- **JSON-LD**: `localBusinessLd()` + `breadcrumbsLd([Главная → Цены])` + `faqLd(FAQ)`.
- **metadata**: title «Цены на аренду фотозон в Красноярске — тарифы Эконом/Стандарт/Премиум», description, canonical `/ceny`.

### Цвета и техника
- Палитра строго по дизайн-системе: `text-gold`/`bg-gold`/`border-gold`/`text-gradient-gold`/`text-coral`. Без indigo/blue.
- Все картинки — `next/image` с осмысленным alt (в `PhotozoneGallery` — «{title} — фото N» / «{title} — превью N»).
- Серверные компоненты по умолчанию; `'use client'` только для `CatalogFilters` и `PhotozoneGallery`.
- Импорты только из разрешённых модулей: `@/lib/data`, `@/lib/db`, `@/lib/constants`, `@/lib/format`, `@/lib/seo`, `@/components/site/*`, `@/components/seo/json-ld`, `@/components/ui/*`.
- Не модифицировал `globals.css`, `layout.tsx`, существующие shared-компоненты.
- `bun run lint` — **0 ошибок, 0 предупреждений**. Build не запускался.
- Smoke-тесты curl: `/katalog` → 200 (H1 + card-hover рендерятся), `/katalog/love-installyaciya` → 200 (3 JSON-LD: LocalBusiness/Product/BreadcrumbList, элементы, «Похожие»), `/ceny` → 200 (Эконом/Стандарт/Премиум, 3 JSON-LD), `/katalog?category=TEXTILE&occasion=WEDDING&sort=price-asc&search=flora` → 200, `/katalog?search=zzzzz_nonexistent_zzzzz` → пустое состояние «Ничего не нашли», `/katalog/non-existent-slug` → 404.

### Заметка следующим агентам
- `CatalogFilters` использует `defaultValue` для search-инпута + `onChange` → router.push (фильтрация серверная при изменении URL). Если захотите debounce — обернуть `onChange` в `setTimeout`/`useDeferredValue`.
- Мобильный sticky order bar на `/katalog/[slug]` имеет z-40 (поверх глобального sticky CTA z-30). Если на какой-то странице потребуется аналогичный sticky-bar, тот же приём (z-40 + `sm:hidden`).
- В `generateMetadata` description обрезается до 158 символов + «…» — это укладывается в 160, как требует задача.
- `generateStaticParams` возвращает все активные slug — все карточки фотозон пререндерятся статики.

## Task ID: 8 — Landing & Content Pages (Code)

**Agent:** Code (Fullstack Web Dev)
**Task:** Посадочные по поводам (4), сезонные (3), контентные (о компании, отзывы, контакты, блог, статья блога, спасибо).

### Work Log
- Создано **13 файлов** в `src/app/(public)/...` + **2 shared-компонента** в `(public)/_components/`.
- **Shared (новые):** `_components/landing-sections.tsx` (`PageBreadcrumbs`, `PageHero`, `WhyUs`, `EmptyPhotozones` — серверные) и `_components/markdown.tsx` (`Markdown` — client, react-markdown v10 с премиальной стилизацией).
- **Посадочные по поводам:** `svadby` (WEDDING), `detskie-prazdniki` (BIRTHDAY), `vypusknie` (GRADUATION), `korporativy` (CORPORATE). Структура: `JsonLd([localBusinessLd, breadcrumbsLd, faqLd])` → breadcrumbs → hero (H1+eyebrow+intro) → SEO-блок с гео-ключами → `getPhotozones({occasion})` сеткой `PhotozoneCard` → `OrderButton` (prefill source/sourcePage/occasion) → `WhyUs` → доп.блок → FAQ (5-7) → `CtaBand`.
- **Сезонные:** `prazdniki/novyj-god` (NEW_YEAR) + промо «2 фотозоны по цене одной», `prazdniki/8-marta` (MARCH_8) + промо «Премиум-флористика в подарок», `prazdniki/23-fevralya` (FEB_23) + промо «Брендирование в подарок». Та же структура + захардкоженный промо-блок.
- **Контентные:**
  - `o-kompanii` — гарантии (4), шаги (4), районы + пригороды, цифры, FAQ, CtaBand. JSON-LD `localBusinessLd + breadcrumbsLd + faqLd`.
  - `otzyvy` — `getReviews(100)`, рейтинг-блок с распределением по звёздам, сетка отзывов. JSON-LD `reviewsLd + localBusinessLd + breadcrumbsLd`.
  - `kontakty` — карточки контактов (телефон/WhatsApp/Telegram/email из `SITE`), адрес + часы, зоны доставки, Яндекс.Карта iframe, OrderButton + «Позвонить». JSON-LD `localBusinessLd + breadcrumbsLd`.
  - `blog` — список `getArticles()`, карточки. JSON-LD `breadcrumbsLd`.
  - `blog/[slug]` — `getArticleBySlug`, `generateStaticParams` + `generateMetadata` (params Promise), `notFound()` 404, Markdown-рендер, JSON-LD Article, CtaBand.
  - `spasibo` — H1 «Заявка принята!», 3-шаговый блок, кнопки «Позвонить/WhatsApp», ссылка на каталог. metadata `robots: { index: false, follow: false }`. Без CtaBand.

### Stage Summary
- **НЕ модифицированы** `globals.css`, `layout.tsx`, существующие компоненты.
- Все посадочные — серверные компоненты. `'use client'` только для `Markdown` и существующих client-компонентов.
- Все «Заказать» — через `<OrderButton prefill={{ source, sourcePage, occasion }}>` (никаких отдельных форм, кроме случаев где логически нужна модалка — используется та же модалка).
- Цвета: золото `text-gold`/`bg-gold`, коралл `text-coral`. Без indigo/blue.
- `next/image` с alt везде.
- SEO-тексты с естественными гео-вхождениями: Красноярск, районы (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский), пригороды (Солнечный, Подгорный, Емельяново), надбавка 1500 ₽, перезвон 15 мин.
- metadata на каждой странице (title, description, canonical). `/blog/[slug]` — `generateMetadata` + `generateStaticParams` + `openGraph`. `/spasibo` — noindex.
- `params` в `/blog/[slug]` — Promise, корректно `const { slug } = await params;`.
- **Проверки:**
  - `bun run lint` — ✅ passed (без ошибок/ворнингов).
  - `tsc --noEmit` — без ошибок в новых файлах (ошибки только в pre-existing коде вне моей зоны: katalog, admin/stats, examples, prisma/seed, lib/data).
- Подробный отчёт: `/agent-ctx/8-landing-content-pages.md`.

### Замечания
- `/spasibo` остаётся в общем `(public)` layout (header+footer+sticky-CTA) — «минимальный layout» = отсутствие CtaBand на самой странице. Полный opt-out потребовал бы отдельной route group.
- Промо-блоки на сезонных — захардкожены текстом (по ТЗ). Не подтягивают Promo из БД.
- Все ссылки в header/footer теперь ведут на существующие страницы — нет битых ссылок.

---

## Task ID: 10 — Закрытая админ-панель (`/admin`)

**Агент:** admin-panel. **Статус:** готово.

### Что сделано
- `src/app/admin/layout.tsx` — клиентский layout: проверка сессии через `/api/admin/me`, редирект на `/admin/login` при 401, светлая тема-обёртка `<div className="light min-h-screen bg-background text-foreground">`, десктоп-сайдбар (Дашборд/Заявки/Календарь/Фотозоны), мобильный `Sheet`, шапка с аватаром менеджера и кнопкой «Выйти». Страница `/admin/login` рендерится без сайдбара.
- `src/app/admin/login/page.tsx` — форма входа (email+password, pre-fill демо-данных), POST `/api/admin/login`, при успехе `router.replace('/admin')`.
- `src/app/admin/page.tsx` — дашборд: 4 KPI-карточки (всего/новые/подтверждены/конверсия), BarChart по статусам (recharts), списки «по источникам» и «популярные фотозоны» с прогресс-барами, последние 7 заявок.
- `src/app/admin/leads/page.tsx` — табы статусов, поиск (debounce), диапазон дат, sticky-header таблица, клик по строке → `Dialog` с деталями + формой смены статуса (Select), выбором фотозоны (Select), `Textarea` заметки, кнопками **tel:** и **wa.me**, обработкой 409-конфликта.
- `src/app/admin/calendar/page.tsx` — месячная сетка 6×7 (Пн–Вс), переключатель месяца, фильтр по фотозоне, цветные точки броней, блокировки, счётчики заявок. Клик по дню → `Dialog` с бронированиями/блокировками/заявками, формой блокировки (POST type=block), формой добавления брони (POST type=booking), панелью «Свободные аналоги» (`alternativesFor`).
- `src/app/admin/photozones/page.tsx` — CRUD: таблица с превью, поиск, кнопка «Добавить», `Dialog`-редактор со всеми полями (включая occasions-чекбоксы, images/includes построчно, Switch для hit/isActive, элементы name+price), `AlertDialog` для удаления.
- `src/app/admin/_lib.ts` — общие типы и хелперы (`api()`, `waLink`, `telLink`, `phoneDigits`, статус-стили для светлой темы).

### Исправлено в существующем API
- `src/app/api/admin/stats/route.ts` — добавлены явные `_count` и `orderBy` в `db.lead.groupBy` для `photozoneId` и `source` (без них Prisma падала с `P2019` из-за дефолтной сортировки по `id`, не входящему в `by`). Без фикса дашборд падал с 500.

### Тесты
- `bun run lint` — чисто.
- Все 5 роутов (`/admin/login`, `/admin`, `/admin/leads`, `/admin/calendar`, `/admin/photozones`) — 200.
- API (с сессией): login/me/stats/leads/calendar(month)/calendar(date)/calendar(alternativesFor)/photozones — все 200, данные корректны.
- Демо-доступ подтверждён: `admin@fotozona24.ru / admin123` → менеджер «Анна Менеджер» (ADMIN).

### Известные ограничения
1. Элементы фотозоны (Element) при создании/редактировании не сохраняются — существующий API `POST/PATCH /api/admin/photozones` не принимает `elements`. UI показывает подсказку: сначала создайте фотозону, потом добавьте элементы. Чтобы починить — нужно расширить API (в задании запрещено создавать новые).
2. Пагинация заявок на клиенте не сделана (API отдаёт до 200, скролл с `max-h-[70vh] overflow-y-auto`). Для демо-объёма (7 заявок) достаточно.
3. Цвета точек фотозон в календаре — детерминированы из хеша id, не настраиваются.
4. Recharts-цвета зашиты вручную (для светлой темы ок).

### Контакты для следующих агентов
- Светлая тема — обёртка `<div className="light ...">`, переменные берутся из `.light` блока в `globals.css`.
- Все импорты общих хелперов: `'./_lib'` для `admin/page.tsx` и `'../_lib'` для вложенных (`admin/leads/page.tsx`, `admin/calendar/page.tsx`, `admin/photozones/page.tsx`, `admin/login/page.tsx`).
- Авторизация — httpOnly cookie; в `api()` обязательно `credentials: 'include'`.

---
Task ID: ORCHESTRATOR (final)
Agent: main (Z.ai Code)
Task: Оркестрация проекта аренды фотозон в Красноярске — сборка, интеграция subagents, self-verify

Work Log:
- Спроектирована и залита Prisma-схема (PhotoZone, Element, Lead, Booking, DateBlock, Promo, Review, Article, Manager) + db:push
- Seed: 15 фотозон, 10 элементов, 10 отзывов, 7 заявок (с бронированиями), 2 промо, 2 статьи, менеджер admin@fotozona24.ru/admin123
- Дизайн-система: тёмная премиум-палитра (золото oklch(0.82 0.13 84) + коралл), Playfair Display для заголовков, кастомный скроллбар, glass-эффекты
- Foundation: lib (auth scrypt+HMAC JWT, notify telegram/email, leads, data, seo, format, constants), shared-компоненты (QuickOrderModal+store, SiteHeader, SiteFooter, StickyCta, PhotozoneCard, CtaBand, FaqAccordion, PhoneInput, JsonLd)
- API: /api/leads (POST), /api/photozones, /api/photozones/[slug], /api/admin/{login,me,leads,leads/[id],calendar,bookings,photozones,photozones/[id],stats}
- Главная страница (hero с AI-изображением, оффер, occasions, лучшие фотозоны, как работаем, отзывы, CtaBand, FAQ)
- Запущены 4 параллельных subagent'а (Task 7-10): каталог+карточка+цены, посадочные+контент, калькулятор+конструктор, админ-панель
- Расширил API /api/admin/photozones/[id] для синхронизации элементов (create/update/delete)
- Фикс критического бага: /api/admin/stats возвращал count как объект ({source:1}) из-за groupBy _count → React падал на рендере {s.count}. Исправлено на _count:{_all:true} + маппинг в число
- Заменил recharts в дашборде на CSS-бары (надёжнее + легче)
- SEO: app/sitemap.ts (динамический: статики + фотозоны + статьи), app/robots.ts, удалён статичный public/robots.txt
- Изображения: AI-генерация (hero, love, svadebnaya-flora — 3 готовых), остальные 12 — брендовые градиентные placeholder'ы через sharp с названием фотозоны
- Self-verify через agent-browser (все golden paths): главная рендерится; модалка быстрого заказа → заполнение → отправка → экран успеха; заявка попадает в БД и видна в /admin/leads; логин admin@fotozona24.ru/admin123 → дашборд/заявки/календарь/фотозоны; мобильный sticky-CTA; каталог (15 карточек) с фильтрами; калькулятор-визард 4 шага → расчёт 12 900 ₽ → «Зафиксировать» открывает модалку с config+ценой
- lint: 0 ошибок; все 21 маршрут возвращают 200; runtime-ошибок в dev.log нет

Stage Summary:
- Проект полностью функционален и проверен в браузере end-to-end
- Ключевые критерии приёмки закрыты: заявка ≤ 3 кликов с любой страницы; занятость дат нигде не показывается клиенту (только /admin); менеджер видит календарь по фотозонам/элементам/дням с блокировками и подбором аналогов; уведомления Telegram+email (fallback в лог без ключей); заявки хранятся с источником/utm/составом; мобильная адаптация + sticky CTA; /admin закрыт авторизацией (JWT cookie)
- Демо-доступ админки: admin@fotozona24.ru / admin123
- Известное ограничение окружения: dev-сервер нестабилен между bash-вызовами (внешний SIGKILL) — в превью панели должен работать под супервизором окружения
