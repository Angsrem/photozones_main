import { db } from './db';
import type { PhotoZone } from '@prisma/client';

// ===== Типы ответов квиза =====
export type QuizAnswers = {
  occasion: string;          // WEDDING | BIRTHDAY | GRADUATION | CORPORATE | NEW_YEAR | MARCH_8 | FEB_23 | OTHER
  childAge?: string | null;  // 1-3 | 4-7 | 8-12 | 13-17 (только для BIRTHDAY)
  style?: string;            // romantic | minimal | neon | party | rustic | retro | brand | kids-fairytale | classic | disco
  guests?: string;           // до15 | 15-50 | 50-150 | 150+
  budget?: string;           // до5000 | 5000-10000 | 10000-20000 | 20000+ | unknown
  date?: string | null;      // ISO дата или null
};

export const QUIZ_PROMO_CODE = 'QUIZ5';

// Соответствие гостей → минимальный sizeClass
const GUESTS_TO_SIZE: Record<string, string> = {
  'до15': 'S',
  '15-50': 'M',
  '50-150': 'L',
  '150+': 'XL',
};
const SIZE_ORDER = ['S', 'M', 'L', 'XL'];

// Бюджет → [min, max] в рублях
const BUDGET_RANGE: Record<string, [number, number]> = {
  'до5000': [0, 5000],
  '5000-10000': [5000, 10000],
  '10000-20000': [10000, 20000],
  '20000+': [20000, 1_000_000],
};

function sizeClassOk(pzSize: string | null, minSize: string): boolean {
  if (!pzSize) return true; // если не указан — пропускаем
  if (!minSize) return true;
  const a = SIZE_ORDER.indexOf(pzSize);
  const b = SIZE_ORDER.indexOf(minSize);
  if (a < 0 || b < 0) return true;
  return a >= b;
}

// Мэтчинг: фильтр по occasion → childAge → style → sizeClass, ослабление каскадно
export async function matchPhotozones(answers: QuizAnswers): Promise<PhotoZone[]> {
  const all = await db.photoZone.findMany({
    where: { isActive: true },
    orderBy: [{ hit: 'desc' }, { sortOrder: 'asc' }],
  });

  const minSize = answers.guests ? GUESTS_TO_SIZE[answers.guests] : '';

  // Каскадный фильтр: пробуем по всем условиям, если пусто — ослабляем
  const stages: { name: string; fn: (z: PhotoZone) => boolean }[] = [];

  // Полный фильтр
  stages.push({
    name: 'full',
    fn: (z) => {
      const occ = Array.isArray(z.occasions) ? (z.occasions as string[]) : [];
      if (answers.occasion !== 'OTHER' && !occ.includes(answers.occasion)) return false;
      if (answers.occasion === 'BIRTHDAY' && answers.childAge) {
        const ca = Array.isArray(z.childAge) ? (z.childAge as string[]) : [];
        // если у зоны указан childAge — проверяем; если не указан — пропускаем (универсальная)
        if (ca.length && !ca.includes(answers.childAge)) return false;
      }
      if (answers.style) {
        const st = Array.isArray(z.styles) ? (z.styles as string[]) : [];
        if (st.length && !st.includes(answers.style)) return false;
      }
      if (minSize && !sizeClassOk(z.sizeClass, minSize)) return false;
      return true;
    },
  });
  // Ослабление: стиль не обязателен
  stages.push({
    name: 'no-style',
    fn: (z) => {
      const occ = Array.isArray(z.occasions) ? (z.occasions as string[]) : [];
      if (answers.occasion !== 'OTHER' && !occ.includes(answers.occasion)) return false;
      if (minSize && !sizeClassOk(z.sizeClass, minSize)) return false;
      return true;
    },
  });
  // Ослабление: только повод
  stages.push({
    name: 'occasion-only',
    fn: (z) => {
      const occ = Array.isArray(z.occasions) ? (z.occasions as string[]) : [];
      if (answers.occasion === 'OTHER') return true;
      return occ.includes(answers.occasion);
    },
  });
  // Фоллбэк: все
  stages.push({ name: 'all', fn: () => true });

  for (const stage of stages) {
    const filtered = all.filter(stage.fn);
    if (filtered.length >= 3) return filtered;
  }
  return all;
}

// Сборка тройки: Эконом / Хит / Премиум (якорение цен)
export function buildRecommendation(zones: PhotoZone[], budget: string): { economy: PhotoZone | null; hit: PhotoZone | null; premium: PhotoZone | null } {
  if (zones.length === 0) return { economy: null, hit: null, premium: null };

  // Бюджет: если unknown — берём медиану по выборке
  let lo = 0, hi = Infinity;
  if (budget && budget !== 'unknown' && BUDGET_RANGE[budget]) {
    [lo, hi] = BUDGET_RANGE[budget];
  } else {
    const prices = zones.map((z) => z.basePrice).sort((a, b) => a - b);
    const med = prices[Math.floor(prices.length / 2)] || 15000;
    lo = Math.round(med * 0.7);
    hi = Math.round(med * 1.5);
  }

  // Хит: первая с hit=true в бюджете, иначе ближайшая к середине бюджета
  const inBudget = zones.filter((z) => z.basePrice >= lo && z.basePrice <= hi);
  const hit = inBudget.find((z) => z.hit) || inBudget[0]
    || zones.find((z) => z.hit)
    || zones[Math.floor(zones.length / 2)];

  // Эконом: на 20-30% ниже бюджета (lo * 0.7), самая дешёвая ниже lo
  const belowBudget = zones.filter((z) => z.basePrice < lo).sort((a, b) => b.basePrice - a.basePrice);
  const economy = belowBudget[0] || zones.slice().sort((a, b) => a.basePrice - b.basePrice)[0];

  // Премиум: на 15-30% выше бюджета (hi * 1.2), самая дешёвая выше hi
  const aboveBudget = zones.filter((z) => z.basePrice > hi).sort((a, b) => a.basePrice - b.basePrice);
  const premium = aboveBudget[0] || zones.slice().sort((a, b) => b.basePrice - a.basePrice)[0];

  // Уникальные
  const used = new Set<string>();
  const pick = (z: PhotoZone | null) => {
    if (!z) return null;
    if (used.has(z.id)) {
      const alt = zones.find((x) => !used.has(x.id));
      if (!alt) return null;
      used.add(alt.id);
      return alt;
    }
    used.add(z.id);
    return z;
  };
  return { economy: pick(economy), hit: pick(hit), premium: pick(premium) };
}

export async function runQuiz(answers: QuizAnswers): Promise<{ recommended: PhotoZone[]; all: PhotoZone[] }> {
  const matched = await matchPhotozones(answers);
  const rec = buildRecommendation(matched, answers.budget || 'unknown');
  const recommended = [rec.economy, rec.hit, rec.premium].filter(Boolean) as PhotoZone[];
  return { recommended, all: matched };
}
