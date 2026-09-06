# Task ID: 7 — Public pages: /katalog, /katalog/[slug], /ceny

**Agent:** fullstack-dev (catalog + photozone card + prices)

## Task

Build 3 public routes for the FotoZona24 selling site (Next.js 16 App Router):
1. `/katalog` — full catalog with server-side filtering (category / occasion / sort / search)
2. `/katalog/[slug]` — single photozone card with gallery, includes, elements, similar zones, sticky order bar
3. `/ceny` — 3-tier pricing page (Econom / Standart / Premium), comparison table, add-ons, calculator CTA, FAQ

Hard rules: no edits to `globals.css` / `layout.tsx` / existing components; use existing shared components (`PhotozoneCard`, `OrderButton`, `CtaBand`, `FaqAccordion`, `JsonLd`); server components by default; gold/coral palette (no indigo/blue); `next/image` everywhere; canonical + JSON-LD per page; `params`/`searchParams` are Promises in Next 16.

## Work Log

### Read context
- Read `/home/z/my-project/worklog.md` (full context: design system, shared components, data access helpers, SEO patterns, PhotoZone fields, seed data).
- Explored existing structure: `src/app/(public)/layout.tsx` (header/footer/QuickOrderModal/StickyCta), `src/app/(public)/page.tsx` (home page pattern reference), `src/lib/data.ts` (`getPhotozones`, `getPhotozoneBySlug`, `asStringArray`), `src/lib/seo.ts` (`localBusinessLd`, `productLd`, `breadcrumbsLd`, `faqLd`), `src/lib/constants.ts` (`SITE`, `CATEGORIES`, `OCCASIONS`), `src/lib/format.ts` (`formatPrice`, `formatPriceFrom`, `pluralize`), shared components (`photozone-card`, `quick-order-modal`, `quick-order-store`, `cta-band`, `faq-accordion`, `json-ld`), shadcn UI components (`button`, `badge`, `card`, `table`, `breadcrumb`, `select`, `input`, `separator`, `accordion`).
- Verified Prisma schema (`PhotoZone` with `images`, `includes`, `occasions` as Json, `elements` relation) and seed data (15 zones with images, includes, badges).

### Files created

1. **`src/app/(public)/katalog/catalog-filters.tsx`** (`'use client'`)
   - 4 controls in `grid lg:grid-cols-4`: search input (with `Search` icon), category `Select`, occasion `Select`, sort `Select`.
   - All changes push to URL via `useRouter` + `useTransition` (instant feedback, `Loader2` spinner on pending).
   - Sticky panel (`sticky top-3 z-20`) with `backdrop-blur`.
   - "Сбросить фильтры" button appears only when filters are active.

2. **`src/app/(public)/katalog/page.tsx`** (server)
   - `searchParams: Promise<...>` awaited in Next 16.
   - Validates query values against `CATEGORIES`/`OCCASIONS`/sort whitelist (defense against garbage).
   - Calls `getPhotozones({ category, occasion, sort, search })`.
   - Breadcrumbs (Главная → Каталог), H1 with `text-gradient-gold`, SEO intro paragraph with geo keywords (districts, mount time, callback time).
   - Counter: "N фотозон/фотозоны/фотозон" via `pluralize`.
   - Active filters summary line above grid.
   - Grid `sm:grid-cols-2 lg:grid-cols-3` of `PhotozoneCard`.
   - Empty state with `SearchX` icon, `OrderButton` (prefill `source:'catalog-empty'` + occasion), reset Link.
   - CtaBand, JSON-LD (`localBusinessLd` + `breadcrumbsLd`).
   - metadata: title + description + canonical `/katalog`.

3. **`src/app/(public)/katalog/[slug]/gallery.tsx`** (`'use client'`)
   - Main image 4:3 + thumbnail grid (4-5 cols).
   - Active thumb: `border-gold` + `ring-gold/30`; inactive: `opacity-70`.
   - `aria-label` and `aria-current` on thumbnails for accessibility.

4. **`src/app/(public)/katalog/[slug]/page.tsx`** (server)
   - `params: Promise<{ slug: string }>` awaited.
   - `generateStaticParams` from `db.photoZone.findMany({ where: { isActive: true }, select: { slug: true } })`.
   - `generateMetadata` with title=zone title, description=first 158 chars + "…", canonical `/katalog/{slug}`, OpenGraph image.
   - `notFound()` if not found or inactive.
   - Layout `grid lg:grid-cols-[1.2fr_1fr]`: gallery left, sticky sidebar right.
   - Sidebar: badges (HIT/NEW, category, occasions), H1, price `formatPriceFrom`, size with Ruler icon, description, "Что входит" card (checklist), "Дополнительные элементы" list with prices, CTA block (OrderButton + tel button).
   - "Похожие" section: `getPhotozones({ category, sort: 'hit', limit: 4 })` filtered to exclude current, sliced to 3.
   - Mobile sticky order bar (`sm:hidden fixed bottom-0 z-40`) — covers global sticky CTA (z-30) on this page; includes price + OrderButton.
   - Breadcrumbs (Главная → Каталог → Title).
   - JSON-LD: `localBusinessLd` + `productLd` + `breadcrumbsLd`.
   - Prefill: `{ photozoneId, photozoneTitle, photozoneImage, photozonePrice, source: 'photozone-card', sourcePage: '/katalog/' + slug }`.

5. **`src/app/(public)/ceny/page.tsx`** (server)
   - Breadcrumbs (Главная → Цены), H1 with gradient.
   - 3 tier cards via shadcn `Card`: Эконом (8 900 ₽, Wallet icon), Стандарт (12 900 ₽, Star icon, "Самое популярное" badge, `border-2 border-gold`, `lg:-mt-4`), Премиум (19 900 ₽, Crown icon).
   - Each: price (`formatPrice`), tagline, description, "Что входит" checklist, "Для кого подходит", `<OrderButton>` with prefill `source:'ceny-{tier}'`, `priceEstimate`.
   - Comparison `Table`: 7 rows × 4 columns, `Check` (gold) for included, `X` (muted/40) for not; "Стандарт" column header in gold.
   - "Доплаты" section: 3 cards (пригород +1 500 ₽, доп. час +800 ₽, печать логотипа +4 500 ₽) with notes.
   - Calculator CTA: gradient block with Link to `/kalkulyator` (gold button) + tel link.
   - CtaBand (prefill `source:'ceny-cta'`).
   - FAQ (5 questions) via `FaqAccordion` + footer with "Смотреть каталог" and "Позвонить" buttons.
   - JSON-LD: `localBusinessLd` + `breadcrumbsLd` + `faqLd`.
   - metadata: title + description + canonical `/ceny`.

### Lint and smoke tests
- `bun run lint` — **0 errors, 0 warnings**.
- Did NOT run `bun run build` (per instructions).
- curl smoke tests (all passed):
  - `GET /katalog` → 200 (H1 + card-hover rendered)
  - `GET /katalog/love-installyaciya` → 200 (3 JSON-LD: LocalBusiness + Product + BreadcrumbList; elements; "Похожие")
  - `GET /ceny` → 200 (Эконом/Стандарт/Премиум rendered; 3 JSON-LD scripts)
  - `GET /katalog?category=TEXTILE&occasion=WEDDING&sort=price-asc&search=flora` → 200
  - `GET /katalog?search=zzzzz_nonexistent_zzzzz` → 200 with empty state "Ничего не нашли" + "Подобрать фотозону"
  - `GET /katalog/non-existent-slug` → 404

## Stage Summary

Three public routes delivered, all server-rendered with proper Next 16 async `params`/`searchParams` handling. Filters work via URL query (shareable links). Photozone card has sticky order bar on mobile that visually overrides the global sticky CTA on this page (z-40 > z-30). All `OrderButton` usages carry proper prefill (`source` + `sourcePage` + `photozoneId/Title/Image/Price` for cards, `priceEstimate` for tariffs). JSON-LD complete on every page (LocalBusiness + Breadcrumbs + Product/FAQ as relevant). Zero lint errors. No modifications to globals.css / layout.tsx / existing shared components.
