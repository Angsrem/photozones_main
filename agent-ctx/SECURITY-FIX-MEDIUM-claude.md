# SECURITY-FIX-MEDIUM — security fixes summary

Task: исправление MEDIUM уязвимостей в `/home/z/my-project` (по чек-листу).
Worklog не трогал (по инструкции).

## Что сделано

### 1. Валидация `discountPct` (`src/lib/promo-codes.ts`)
- В `issuePromoCode` заменил `const discountPct = opts?.discountPct ?? 5;` на `let` + проверку:
  ```ts
  let discountPct = opts?.discountPct ?? 5;
  if (!Number.isFinite(discountPct) || discountPct < 1 || discountPct > 50) {
    throw new Error('discountPct must be between 1 and 50');
  }
  ```
- Бросает при значениях NaN/Infinity, < 1, > 50.

### 2. Увеличение энтропии промокода (`src/lib/promo-codes.ts`)
- `generatePromoCode()`: цикл `for (let i = 0; i < 4; i++)` → `i < 6`.
- Обновил комментарий: «FOTO-XXXXXX (6 случайных символов A-Z0-9), ~1.7 млрд комбинаций (32^6)».
- Защищает от брутфорса промокодов (раньше было ~1M комбинаций — реально брутфорсилось 5% скидкой).

### 3. Валидация `discount` в promos (`src/app/api/admin/promos/route.ts`)
- После проверки `title` добавил:
  ```ts
  if (discount !== null && discount !== undefined && (!Number.isFinite(Number(discount)) || Number(discount) < 0 || Number(discount) > 100)) {
    return NextResponse.json({ error: 'Скидка 0–100%' }, { status: 422 });
  }
  ```

### 4. Валидация полей photozone (`src/app/api/admin/photozones/route.ts`)
- В POST добавил:
  ```ts
  const ALLOWED_CATEGORIES = ['FRAME', 'PRESSWALL', 'TEXTILE', 'THEME'];
  const ALLOWED_OCCASIONS = ['WEDDING', 'BIRTHDAY', 'BIRTHDAY_ADULT', 'GRADUATION', 'CORPORATE', 'NEW_YEAR', 'MARCH_8', 'FEB_23', 'OTHER'];
  if (!ALLOWED_CATEGORIES.includes(category)) return NextResponse.json({ error: 'Недопустимая категория' }, { status: 422 });
  const occArr = Array.isArray(occasions) ? occasions.filter((o: any) => typeof o === 'string' && ALLOWED_OCCASIONS.includes(o)) : [];
  if (!Number.isFinite(Number(basePrice)) || Number(basePrice) < 0 || Number(basePrice) > 10_000_000) return NextResponse.json({ error: 'Недопустимая цена' }, { status: 422 });
  ```
- В `data` теперь используется `occArr` вместо сырого `occasions`, чтобы в БД не попадали некорректные значения.
- LIMIT на цену: 0–10 000 000 ₽.

### 5. Валидация `status` booking PATCH (`src/app/api/admin/bookings/route.ts`)
- Добавил перед `db.booking.update`:
  ```ts
  const ALLOWED_BOOKING_STATUSES = ['RESERVED', 'DONE', 'CANCELED'];
  if ('status' in body && !ALLOWED_BOOKING_STATUSES.includes(body.status)) {
    return NextResponse.json({ error: 'Недопустимый статус' }, { status: 422 });
  }
  ```
- Раньше через PATCH можно было записать любой произвольный статус (например, `'FOO'`), что ломало бы фильтры в `/admin/calendar`.

### 6. Валидация month/date в calendar (`src/app/api/admin/calendar/route.ts`)
- Добавил хелперы:
  ```ts
  function isValidDate(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}$/.test(str) && !isNaN(new Date(str).getTime());
  }
  function isValidMonth(str: string): boolean {
    return /^\d{4}-\d{2}$/.test(str);
  }
  ```
- Все три ветки (alternatives / day details / month grid) теперь обёрнуты в `try/catch`:
  - альтернативы: валидация `date` + `try/catch` вокруг `findAlternives`,
  - детали по дню: валидация `date` + `try/catch` вокруг `Promise.all` с Prisma,
  - месячная сетка: валидация `month` (после `!month` check) + `try/catch` вокруг `month.split('-').map(Number)` и Prisma-запросов.
- Все исключения возвращают `500` с понятным сообщением, а не падают весь роут с необработанным rejection.

### 7. Валидация `contact` в quiz POST (`src/app/api/quiz/[id]/route.ts`)
- Заменил `if (!contact)` на:
  ```ts
  const contactStr = String(contact || '').trim();
  if (!contactStr || contactStr.length > 100) return NextResponse.json({ error: 'Некорректный контакт' }, { status: 422 });
  ```
- `contactStr` теперь используется и при записи в `QuizSession.contact`, и в `Lead.phone` (вместо `String(contact)`).
- Защита от пустых/слишком длинных значений (DoS через БД, спам в лиды).

### 8. Path traversal в reviews DELETE (`src/app/api/admin/reviews/[id]/route.ts`)
- Раньше:
  ```ts
  const filePath = path.join(process.cwd(), 'public', url);
  ```
  Это позволяло передать `../../../etc/passwd` (через `photos`/`videos` JSON в БД, если бы его скомпрометировали) и удалить произвольный файл.
- Теперь:
  ```ts
  const PUBLIC_ROOT = path.resolve(process.cwd(), 'public');
  for (const url of [...((review.photos as string[]) || []), ...((review.videos as string[]) || [])]) {
    if (typeof url !== 'string' || !url.startsWith('/uploads/reviews/')) continue;
    const filePath = path.resolve(PUBLIC_ROOT, '.' + url);
    if (!filePath.startsWith(PUBLIC_ROOT + path.sep)) continue;
    try { fs.unlinkSync(filePath); } catch {}
  }
  ```
- Двойная защита: 1) префикс `/uploads/reviews/`, 2) `path.resolve` + проверка `startsWith(PUBLIC_ROOT + path.sep)` от `..`-обхода.

### 9. Удаление `next-auth` из `package.json`
- Удалена строка `"next-auth": "^4.24.11",` (deps не использовался — своя auth в `src/lib/auth.ts`).
- `bun install` → lockfile обновлён, пакет removed.

## Проверки
- `bun run lint` → **0 ошибок, 0 предупреждений** (exit 0).
- `bun install` → ok, удалён 1 пакет (next-auth).

## Файлы изменены
- `src/lib/promo-codes.ts`
- `src/app/api/admin/promos/route.ts`
- `src/app/api/admin/photozones/route.ts`
- `src/app/api/admin/bookings/route.ts`
- `src/app/api/admin/calendar/route.ts`
- `src/app/api/quiz/[id]/route.ts`
- `src/app/api/admin/reviews/[id]/route.ts`
- `package.json` (+ `bun.lock` автоматически)

## Замечания
- В `src/app/api/admin/promos/[id]/route.ts` (PATCH) валидацию discount НЕ добавлял — task явно указывал только `promos/route.ts`. Аналогично для `photozones/[id]/route.ts`. При желании можно дораспространить валидацию на PATCH-роуты (`ALLOWED_CATEGORIES`, `ALLOWED_OCCASIONS`, диапазон `discount`/`basePrice`) — это снизит риск правки через админку с обходом ограничений, но в task этого не было.
- В `reviews/route.ts` (POST загрузки) уже сделана безопасная валидация типов файлов предыдущим агентом (SECURITY-FIX-CRITICAL), в `reviews/[id]/route.ts` PATCH — без файловых операций, безопасен.
- В `dev.log` видны pre-existing ошибки Prisma (`postgresql://` protocol — провайдер в `schema.prisma` указан postgres, но DATABASE_URL не валиден для текущей среды). Это не относится к моим правкам, к MEDIUM-security task не привязано. Был и до моих изменений.
