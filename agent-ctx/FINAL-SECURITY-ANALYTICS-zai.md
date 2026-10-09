# FINAL-SECURITY-ANALYTICS — security + analytics final

Task ID: FINAL-SECURITY-ANALYTICS
Agent: main (Z.ai Code)

## Что сделано

### 1. SSR Middleware для /admin (Edge runtime)
- `src/middleware.ts` (новый). Edge runtime, Web Crypto API.
- Дублирует секрет-резолвер из `src/lib/auth.ts` (нельзя импортировать в Edge — там Node.js `crypto`).
- HMAC-SHA256 через `crypto.subtle.importKey` + `crypto.subtle.sign`.
- Base64url через `btoa/atob` + `TextEncoder/TextDecoder` (Edge-safe, без `Buffer.from('…','base64url')`).
- Constant-time string compare своей реализацией.
- Проверяет `exp` из JSON-тела токена.
- `/admin/login` пропускается без проверки (early `NextResponse.next()`).
- Matcher: `['/admin/:path*']`.
- Замечание: Next.js 16.1 выводит deprecation-warning про `middleware.ts` в пользу `proxy.ts` — middleware всё ещё работает полностью.

### 2. 2FA TOTP для админа

- `prisma/schema.prisma` — добавлено `Manager.totpSecret String?`. `bun run db:push` выполнен.
- `src/lib/totp.ts` (новый):
  - `generateSecret()` — 20 случайных байт → base32 (32 символа).
  - `generateCode(secret, atTimeMs?)` — RFC 6238 (HMAC-SHA1, 30-сек окно, 6 цифр).
  - `verifyCode(secret, code, atTimeMs?)` — ±1 окно, constant-time compare.
  - `otpAuthUrl(secret, email)` — otpauth:// URL для QR (без QR-библиотеки).
- `POST /api/admin/login` — поддержка `totpCode`: если `totpSecret` задан → требует код, иначе 401 с `needsTotp:true`.
- `GET /api/admin/settings` (новый) — `{manager, has2fa}`.
- `POST /api/admin/settings` (новый) — `action: 'generate' | 'confirm' | 'disable'`:
  - `generate` → возвращает `{secret, otpAuthUrl, previewCode}` (без сохранения).
  - `confirm` + `{secret, code}` → валидирует код, сохраняет секрет.
  - `disable` + `{password}` → проверяет пароль, очищает секрет.
- `src/app/admin/login/page.tsx` — UI поля для 6-значного кода, показывается когда API вернул `needsTotp:true`. Блокирует email/пароль, моноширинный инпут с `autoComplete=one-time-code`.
- `src/app/admin/settings/page.tsx` (новый):
  - Профиль менеджера.
  - Карточка 2FA с бейджем статуса, кнопками Включить/Отключить.
  - Включение: 2 шага (показать секрет + ввести код → подтвердить).
  - Отключение: форма с паролем (защита от случайного отключения).
- `src/app/admin/layout.tsx` — добавлен пункт «Настройки» в навигацию.

### 3. Аналитика в дашборде

- `GET /api/admin/stats` — добавлены:
  - `quiz.quizStarts` (QuizSession.count)
  - `quiz.quizCompletes` (QuizSession с непустым recommendedIds, длина > 0)
  - `quiz.quizAbandons` (QuizPartial.count минус converted:true)
  - `quiz.quizByStep` (QuizPartial grouped by step)
  - `quiz.quizFunnelConversion` (round(starts/(starts+abandons)*100))
  - `leadMagnetLeads` (Lead.count where source='leadmagnet')
- `src/app/admin/page.tsx` — новый блок «Аналитика»:
  - Воронка квиза (3 mini-KPI: Начали/Дошли/Бросили + бар-чарт «Бросили на шаге»).
  - Конверсия лид-магнитов (Скачиваний/Стало лидами + топ-3 по скачиваниям).
  - Компонент `FunnelMini`.

## Self-verify

Полный цикл через curl, в одном bash-процессе (чтобы dev-сервер не падал):

**Middleware**:
- `/admin` без cookie → 307 redirect `/admin/login` ✓
- `/admin/login` без cookie → 200 ✓
- `/admin` с валидным cookie → 200 ✓
- `/admin` с испорченным sig → 307 ✓

**2FA**:
- Логин (totpSecret null) → 200 ✓
- GET settings → has2fa:false ✓
- POST generate → {secret, otpAuthUrl, previewCode} ✓
- POST confirm (правильный код) → ok:true, has2fa:true ✓
- GET settings → has2fa:true ✓
- Логин без totpCode → 401 needsTotp:true ✓
- Логин с неверным totpCode → 401 needsTotp:true ✓
- Логин с верным totpCode (сгенерирован через node) → 200 ✓
- POST disable (пароль) → ok:true, has2fa:false ✓

**Аналитика**:
- GET /api/admin/stats — quiz zeros, leadMagnetLeads:2 ✓
- POST /api/quiz-partial step=3 → 201 ✓
- POST /api/quiz-partial step=1 → 201 ✓
- GET /api/admin/stats после — quizAbandons:2, quizByStep:[{step:1,count:1},{step:3,count:1}] ✓

**Lint**: `bun run lint` → EXIT=0, 0 ошибок ✓

## Файлы
- `src/middleware.ts` (новый)
- `src/lib/totp.ts` (новый)
- `prisma/schema.prisma` (расширен)
- `src/app/api/admin/login/route.ts` (расширен)
- `src/app/api/admin/settings/route.ts` (новый)
- `src/app/admin/login/page.tsx` (расширен)
- `src/app/admin/settings/page.tsx` (новый)
- `src/app/admin/layout.tsx` (новый пункт навигации)
- `src/app/api/admin/stats/route.ts` (расширен)
- `src/app/admin/page.tsx` (новый блок «Аналитика»)

## Замечания
- Next.js 16.1 deprecation-warning про middleware.ts в пользу proxy.ts — пока работает.
- ADMIN_JWT_SECRET env не задан в .env — dev fallback в обоих местах (auth.ts и middleware.ts) идентичен, токены валидируются. В prod обязательно.
- 5 тестовых QuizPartial записей созданы (шаги 1, 2×3, 3, 5) — сохранятся в sandbox-БД, можно очистить `db.quizPartial.deleteMany({})`.
- 2FA без QR-библиотеки: пользователь добавляет base32-секрет в приложение вручную, или вводит preview-код для проверки.
- Полные детали — в `worklog.md` (раздел FINAL-SECURITY-ANALYTICS).
