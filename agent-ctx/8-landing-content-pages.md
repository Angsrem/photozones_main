# Task ID: 8 — Landing & Content Pages

**Agent:** Code (Fullstack Web Dev)
**Task:** Посадочные страницы по поводам + сезонные + контентные (о компании, отзывы, контакты, блог, статья блога, спасибо).

## Work Log

### Созданные файлы (все в `src/app/(public)/...`)

**Shared-компоненты (новые, в `(public)/_components/`):**
- `_components/landing-sections.tsx` — `PageBreadcrumbs`, `PageHero`, `WhyUs`, `EmptyPhotozones` (серверные, переиспользуются на всех посадочных)
- `_components/markdown.tsx` — `Markdown` (client, обёртка над `react-markdown` v10 с премиальной стилизацией h1/h2/h3/p/ul/ol/blockquote/strong/code)

**Посадочные по поводам (4 шт.):**
- `svadby/page.tsx` — WEDDING, H1 «Фотозоны на свадьбу в Красноярске», SEO про рестораны и районы
- `detskie-prazdniki/page.tsx` — BIRTHDAY, H1 «Детские фотозоны на день рождения в Красноярске», тематические (единорог, стиляги), возраст 1-16
- `vypusknie/page.tsx` — GRADUATION, H1 «Фотозоны на выпускной в Красноярске», 9/11 класс + детсад + цифры года
- `korporativy/page.tsx` — CORPORATE, H1 «Корпоративные фотозоны в Красноярске», брендирование/пресс-воллы/конференции

**Сезонные (3 шт. в `/prazdniki/...`):**
- `prazdniki/novyj-god/page.tsx` — NEW_YEAR + промо-блок «2 фотозоны по цене одной»
- `prazdniki/8-marta/page.tsx` — MARCH_8 + промо «Премиум-флористика в подарок»
- `prazdniki/23-fevralya/page.tsx` — FEB_23 + промо «Брендирование в подарок»

Структура всех посадочных: `JsonLd([localBusinessLd, breadcrumbsLd, faqLd])` → `PageBreadcrumbs` → `PageHero` (H1+eyebrow+SEO-вводка) → SEO-блок с гео-ключами → сетка `PhotozoneCard` через `getPhotozones({occasion})` → `OrderButton` с prefill (source, sourcePage, occasion) → `WhyUs` → доп.блок идей/типов → FAQ (5-7 вопросов) → `CtaBand` с prefill.

**Контентные (6 шт.):**
- `o-kompanii/page.tsx` — гарантии (4), шаги (4), районы (`SITE.districts`) + пригороды (`SITE.suburbs`), цифры, FAQ, CtaBand. JSON-LD `localBusinessLd + breadcrumbsLd + faqLd`
- `otzyvy/page.tsx` — `getReviews(100)`, рейтинг-блок с распределением по звёздам, сетка отзывов. JSON-LD `reviewsLd(map) + localBusinessLd + breadcrumbsLd`
- `kontakty/page.tsx` — карточки контактов (телефон/WhatsApp/Telegram/email из `SITE`), адрес + часы, зоны доставки (районы + пригороды с надбавкой), Яндекс.Карта iframe (`https://yandex.ru/map-widget/v1/?ll=92.8704%2C56.0087&z=12`), OrderButton + кнопка «Позвонить». JSON-LD `localBusinessLd + breadcrumbsLd`
- `blog/page.tsx` — список `getArticles()`, карточки с обложкой/датой/excerpt/тегами/ссылкой на `/blog/[slug]`. JSON-LD `breadcrumbsLd`
- `blog/[slug]/page.tsx` — `getArticleBySlug`, `generateStaticParams` + `generateMetadata` (params Promise), 404 через `notFound()`, обложка + Markdown-рендер + хлебные крошки + JSON-LD Article (`headline/image/datePublished/author/publisher`) + CtaBand
- `spasibo/page.tsx` — H1 «Заявка принята!», текст «Перезвоним в течение 15 минут», 3-шаговый блок «Что дальше», кнопки «Позвонить/WhatsApp», ссылка на каталог. metadata `robots: { index: false, follow: false }`. Без CtaBand (заявка уже отправлена).

## Stage Summary

- Все 13 файлов созданы строго в `src/app/(public)/...` (новые файлы + 2 shared-компонента в `_components/`).
- НЕ модифицировались: `globals.css`, `layout.tsx`, существующие компоненты.
- Все посадочные — серверные компоненты (по умолчанию). `'use client'` только для `Markdown` (react-markdown) и существующих client-компонентов (`PhotozoneCard`, `CtaBand`, `OrderButton`, `FaqAccordion`).
- Кнопки «Заказать» везде через `<OrderButton prefill={{ source, sourcePage, occasion }}>` — никаких отдельных форм.
- Цвета: золото `text-gold`/`bg-gold`, коралл `text-coral`. Без indigo/blue.
- `next/image` с alt на всех изображениях (фотозоны в карточках, обложки статей).
- SEO-тексты с гео-ключами: «Красноярск», районы (Центральный, Советский, Свердловский, Октябрьский, Железнодорожный, Ленинский, Кировский), пригороды (Солнечный, Подгорный, Емельяново) — естественные вхождения.
- metadata на каждой странице (title, description, canonical). Для `/blog/[slug]` — `generateMetadata` + `generateStaticParams` + `openGraph`. Для `/spasibo` — `robots: { index: false, follow: false }`.
- `params` в `/blog/[slug]` — Promise, корректно обработан через `const { slug } = await params;`.
- JSON-LD на каждой странице через `<JsonLd data={[...]} />`: `localBusinessLd`, `breadcrumbsLd`, `faqLd` (где FAQ), `reviewsLd` (отзывы), кастомный Article (статья блога).
- FAQ на каждой посадочной: 5-7 вопросов с гео-спецификой (районы, пригород, надбавка 1500 ₽, перезвон за 15 минут и т.д.).
- Промо-блоки на сезонных посадочных захардкожены (текст оффера), кнопка ведёт в OrderButton с prefill occasion.
- `bun run lint` — passed (без ошибок).
- `tsc --noEmit` — без ошибок в новых файлах (ошибки только в pre-existing коде: katalog, admin/stats, examples, prisma/seed, lib/data — не моя зона).
- Готово к ручному тестированию: открыть `/svadby`, `/detskie-prazdniki`, `/vypusknie`, `/korporativy`, `/prazdniki/novyj-god`, `/prazdniki/8-marta`, `/prazdniki/23-fevralya`, `/o-kompanii`, `/otzyvy`, `/kontakty`, `/blog`, `/blog/kak-vybrat-fotozonu-na-svadbu`, `/blog/novogodnie-fotozony-krasnoyarsk`, `/spasibo`.

## Замечания / нюансы
- `/spasibo` остаётся в общем `(public)` layout (header+footer+sticky-CTA+QuickOrderModal) — «минимальный layout» интерпретирован как отсутствие CtaBand на самой странице (как просили). Полный opt-out из layout потребовал бы отдельной route group, что выходит за рамки задачи.
- На сезонных посадочных промо-блоки захардкожены текстом (по ТЗ «можно захардкодить текст»). Не подтягивают Promo из БД, чтобы не зависеть от состояния таблицы.
- Все ссылки в footer/header (на /katalog, /ceny, /kalkulyator, /otzyvy, /o-kompanii, /blog, /kontakty, /prazdniki/*) теперь ведут на существующие страницы — нет битых ссылок из навигации.
