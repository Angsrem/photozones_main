'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Sparkles, Heart, Cake, GraduationCap, Building2, Snowflake, Flower2, Shield,
  PartyPopper, ArrowRight, ArrowLeft, Loader2, CheckCircle2, Copy, Send,
  MessageCircle, Phone, Mail, Gift, Users, Wallet, Calendar, ChevronRight,
} from 'lucide-react';
import { useQuickOrder } from '@/components/site/quick-order-store';
import { formatPriceFrom } from '@/lib/format';
import { SITE } from '@/lib/constants';
import { track } from '@/lib/analytics';

type Answers = {
  occasion: string;
  childAge?: string;
  style?: string;
  guests?: string;
  budget?: string;
  date?: string;
};

type Recommended = {
  id: string; slug: string; title: string; basePrice: number;
  images: string[]; sizeW: number | null; sizeH: number | null;
  includes: string[]; badge: string | null; hit: boolean;
};

const OCCASIONS = [
  { value: 'WEDDING', label: 'Свадьба', sub: 'Торжество, банкет, церемония', icon: Heart },
  { value: 'BIRTHDAY', label: 'Детский день рождения', sub: 'Праздник ребёнку', icon: Cake },
  { value: 'BIRTHDAY_ADULT', label: 'Взрослый ДР / юбилей', sub: 'Тематическая вечеринка', icon: PartyPopper },
  { value: 'GRADUATION', label: 'Выпускной', sub: 'Детсад, школа, вуз', icon: GraduationCap },
  { value: 'CORPORATE', label: 'Корпоратив', sub: 'Событие компании', icon: Building2 },
  { value: 'NEW_YEAR', label: 'Новый год', sub: 'Сезонный праздник', icon: Snowflake },
  { value: 'MARCH_8', label: '8 марта', sub: 'Весенний праздник', icon: Flower2 },
  { value: 'FEB_23', label: '23 февраля', sub: 'Мужской праздник', icon: Shield },
  { value: 'OTHER', label: 'Другое / ещё не решил(а)', sub: 'Поможем выбрать', icon: Sparkles },
];

const CHILD_AGES = [
  { value: '1-3', label: '1–3 года', sub: 'Мягкие безопасные конструкции' },
  { value: '4-7', label: '4–7 лет', sub: 'Мультгерои, единороги, принцессы' },
  { value: '8-12', label: '8–12 лет', sub: 'Космос, квесты, яркие темы' },
  { value: '13-17', label: '13–17 лет', sub: '«Взрослый» стиль: неон, диско' },
];

// Стили по поводам (Q3)
const STYLES_BY_OCCASION: Record<string, { value: string; label: string; emoji: string }[]> = {
  WEDDING: [
    { value: 'romantic', label: 'Нежная романтика', emoji: '💐' },
    { value: 'minimal', label: 'Современный минимализм', emoji: '◻️' },
    { value: 'party', label: 'Стильная вечеринка', emoji: '🥂' },
    { value: 'rustic', label: 'Рустик / природа', emoji: '🌿' },
  ],
  BIRTHDAY: [
    { value: 'kids-fairytale', label: 'Мультгерои и сказки', emoji: '🦄' },
    { value: 'party', label: 'Яркая вечеринка', emoji: '🎈' },
    { value: 'minimal', label: 'Универсальная', emoji: '✨' },
  ],
  BIRTHDAY_ADULT: [
    { value: 'party', label: 'Яркая вечеринка', emoji: '🥳' },
    { value: 'neon', label: 'Неон / диско', emoji: '🌃' },
    { value: 'romantic', label: 'Элегантная классика', emoji: '🥂' },
    { value: 'minimal', label: 'Минимализм', emoji: '◻️' },
  ],
  GRADUATION: [
    { value: 'classic', label: '«Прощай, школа»', emoji: '🎓' },
    { value: 'party', label: 'Стильная вечеринка', emoji: '🎉' },
    { value: 'minimal', label: 'Тумбл-стенд', emoji: '📱' },
  ],
  CORPORATE: [
    { value: 'brand', label: 'Строгий брендинг', emoji: '💼' },
    { value: 'party', label: 'Креативная вечеринка', emoji: '🎊' },
    { value: 'minimal', label: 'Пресс-волл для фото', emoji: '📸' },
  ],
  NEW_YEAR: [
    { value: 'classic', label: 'Классика (ель, золото)', emoji: '🎄' },
    { value: 'disco', label: 'Диско-серебро', emoji: '🪩' },
    { value: 'rustic', label: 'Скандинавский тёплый', emoji: '🪵' },
  ],
  MARCH_8: [
    { value: 'romantic', label: 'Цветы и нежность', emoji: '🌸' },
    { value: 'minimal', label: 'Минимализм', emoji: '◻️' },
    { value: 'party', label: 'Яркая вечеринка', emoji: '🎈' },
  ],
  FEB_23: [
    { value: 'classic', label: 'Классика / хаки', emoji: '🎖️' },
    { value: 'brand', label: 'Строгий стиль', emoji: '💼' },
    { value: 'party', label: 'Мужская вечеринка', emoji: '🍺' },
  ],
  OTHER: [
    { value: 'party', label: 'Яркая вечеринка', emoji: '🎉' },
    { value: 'romantic', label: 'Романтика', emoji: '💐' },
    { value: 'minimal', label: 'Минимализм', emoji: '◻️' },
    { value: 'classic', label: 'Классика', emoji: '⭐' },
  ],
};

const GUESTS = [
  { value: 'до15', label: 'До 15 человек', sub: 'Компактные зоны 2×2 м' },
  { value: '15-50', label: '15–50 человек', sub: 'Средние конструкции' },
  { value: '50-150', label: '50–150 человек', sub: 'Пресс-воллы от 3 м' },
  { value: '150+', label: 'Больше 150', sub: 'Масштабные инсталляции' },
];

const BUDGETS = [
  { value: 'до5000', label: 'До 5 000 ₽' },
  { value: '5000-10000', label: '5 000 – 10 000 ₽' },
  { value: '10000-20000', label: '10 000 – 20 000 ₽' },
  { value: '20000+', label: 'Больше 20 000 ₽' },
  { value: 'unknown', label: 'Пока не знаю — подскажите' },
];

// Карточка результата
function RecCard({ z, role, date, quizAnswers, sessionId }: {
  z: Recommended; role: 'economy' | 'hit' | 'premium'; date?: string; quizAnswers: Answers; sessionId?: string;
}) {
  const openOrder = useQuickOrder((s) => s.openOrder);
  const img = (z.images?.[0]) || '/images/photozones/love.jpg';
  const roleMeta = {
    economy: { label: '💚 Выгодно', desc: 'Оптимально по цене' },
    hit: { label: '💛 Наш хит', desc: 'Самая заказываемая' },
    premium: { label: '💜 Премиум', desc: 'Эффект «вау»' },
  }[role];

  return (
    <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card">
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image src={img} alt={z.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
        <div className="absolute top-3 left-3">
          <Badge className="bg-background/90 text-foreground border-0 backdrop-blur">{roleMeta.label}</Badge>
        </div>
        {z.badge && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gold text-primary-foreground border-0">{z.badge === 'HIT' ? 'Хит' : 'Новинка'}</Badge>
          </div>
        )}
      </div>
      <div className="p-4 flex flex-col flex-1">
        <div className="text-xs text-muted-foreground mb-1">{roleMeta.desc}</div>
        <h3 className="font-display text-lg leading-tight mb-1">{z.title}</h3>
        <div className="text-gold font-semibold mb-2">{formatPriceFrom(z.basePrice)}</div>
        {z.sizeW && z.sizeH && <div className="text-xs text-muted-foreground mb-3">Размер: {z.sizeW} × {z.sizeH} м</div>}
        <Button
          onClick={() => {
            if (sessionId) track({ event: 'quiz_card_click', cardId: z.id, role, sessionId });
            openOrder({
              photozoneId: z.id,
              photozoneTitle: z.title,
              photozoneImage: img,
              photozonePrice: z.basePrice,
              source: 'quiz',
              sourcePage: sessionId ? `/podborka/${sessionId}` : '/kviz',
              occasion: quizAnswers.occasion,
              priceEstimate: z.basePrice,
              config: { quizAnswers, recommendedId: z.id, role, sessionId, promoCode: 'QUIZ5' },
            });
          }}
          className="mt-auto h-11 bg-gold text-primary-foreground hover:bg-gold/90 w-full"
        >
          <Sparkles className="w-4 h-4 mr-1.5" /> Заказать
        </Button>
      </div>
    </div>
  );
}

export function QuizWizard() {
  const sp = useSearchParams();
  const presetOccasion = sp.get('occasion');
  const presetSource = sp.get('source') || '/kviz';

  const [step, setStep] = React.useState(0); // 0=старт, 1..6=вопросы, 7=результат
  const [answers, setAnswers] = React.useState<Answers>({
    occasion: presetOccasion && OCCASIONS.some((o) => o.value === presetOccasion) ? presetOccasion : '',
  });
  const [loading, setLoading] = React.useState(false);
  const [result, setResult] = React.useState<{ sessionId: string; promoCode: string; recommended: Recommended[] } | null>(null);
  const [saveContact, setSaveContact] = React.useState('');
  const [saving, setSaving] = React.useState(false);
  const [partialId, setPartialId] = React.useState<string | null>(null);
  const partialSentRef = React.useRef(false);

  // Если есть presetOccasion — пропускаем Q1, начинаем с Q2 (или сразу Q3 для не-детских)
  React.useEffect(() => {
    if (presetOccasion && OCCASIONS.some((o) => o.value === presetOccasion)) {
      setStep(presetOccasion === 'BIRTHDAY' ? 2 : 3);
      // частичный старт уже на шаге 2/3 — фиксируем partial
      track({ event: 'quiz_start', source: presetSource });
    }
  }, [presetOccasion, presetSource]);

  // Tracking шагов + сохранение partial при достижении шага >= 2
  React.useEffect(() => {
    if (step >= 1) {
      track({ event: 'quiz_step', step, source: presetSource });
    }
    // сохраняем partial начиная с шага 2 (есть occasion)
    if (step >= 2 && !partialId && !partialSentRef.current && answers.occasion) {
      partialSentRef.current = true;
      fetch('/api/quiz-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, step, source: presetSource }),
      })
        .then((r) => r.json())
        .then((d) => { if (d.id) setPartialId(d.id); })
        .catch(() => {});
    }
  }, [step]);

  // Сохранить обновлённые ответы в существующем partial (debounce)
  React.useEffect(() => {
    if (!partialId || step < 2) return;
    const t = setTimeout(() => {
      fetch('/api/quiz-partial', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, step, source: presetSource }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [answers, step, partialId, presetSource]);

  // При размонтировании (закрытии вкладки) — отправить событие abandoned
  React.useEffect(() => {
    const onUnload = () => {
      if (step >= 2 && step < 7 && !result) {
        track({ event: 'quiz_abandoned', step, source: presetSource });
      }
    };
    window.addEventListener('beforeunload', onUnload);
    return () => window.removeEventListener('beforeunload', onUnload);
  }, [step, result, presetSource]);

  const occasionObj = OCCASIONS.find((o) => o.value === answers.occasion);
  const styles = answers.occasion ? STYLES_BY_OCCASION[answers.occasion] || STYLES_BY_OCCASION.OTHER : [];

  // количество шагов зависит от повода (детский — +1 шаг для возраста)
  const totalSteps = answers.occasion === 'BIRTHDAY' ? 6 : 5;
  const progressPct = result ? 100 : step === 0 ? 0 : Math.round(((step - 1) / totalSteps) * 100);

  const goNext = () => setStep((s) => Math.min(s + 1, 7));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const finish = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/quiz', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, source: presetSource, partialId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка');
      setResult(data);
      setStep(7);
      track({ event: 'quiz_result_viewed', sessionId: data.sessionId, source: presetSource });
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось подобрать фотозоны');
    } finally {
      setLoading(false);
    }
  };

  const canNext = () => {
    if (step === 1) return !!answers.occasion;
    if (step === 2) return !!answers.childAge;
    if (step === 3) return !!answers.style;
    if (step === 4) return !!answers.guests;
    if (step === 5) return !!answers.budget;
    return true;
  };

  const handleNext = () => {
    // Q6 (дата) — последний шаг, finish
    if ((answers.occasion === 'BIRTHDAY' && step === 6) || (answers.occasion !== 'BIRTHDAY' && step === 5)) {
      finish();
    } else {
      goNext();
    }
  };

  const copyLink = async () => {
    if (!result) return;
    const url = `${window.location.origin}/podborka/${result.sessionId}`;
    try {
      await navigator.clipboard.writeText(url);
      toast.success('Ссылка скопирована!');
      track({ event: 'quiz_saved', sessionId: result.sessionId, channel: 'link' });
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  const sendToSelf = async () => {
    if (!result || !saveContact.trim()) return;
    setSaving(true);
    const c = saveContact.trim();
    const channel = /@/.test(c) ? 'email' : c.startsWith('+7') || /^\d/.test(c) ? 'whatsapp' : 'email';
    try {
      await fetch(`/api/quiz/${result.sessionId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contact: c, channel }),
      });
      toast.success('Подборка отправлена!');
      setSaveContact('');
      track({ event: 'quiz_saved', sessionId: result.sessionId, channel: channel as any });
    } catch {
      toast.error('Не удалось отправить');
    } finally {
      setSaving(false);
    }
  };

  const waDeepLink = result?.recommended?.[0]
    ? `https://wa.me/${SITE.whatsapp}?text=${encodeURIComponent(`Здравствуйте! Хочу фотозону «${result.recommended[0].title}» (подборка с сайта Fotoarka)`)}` : `https://wa.me/${SITE.whatsapp}`;

  return (
    <div className="min-h-[calc(100vh-4rem)]] flex flex-col">
      {/* Прогресс-бар */}
      {step > 0 && step <= 6 && (
        <div className="sticky top-16 z-20 border-b border-border bg-background/80 backdrop-blur">
          <div className="container mx-auto max-w-3xl px-4 py-2.5">
            <div className="flex items-center gap-3">
              <button onClick={goBack} className="text-muted-foreground hover:text-foreground p-1" aria-label="Назад">
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                <motion.div className="h-full bg-gold" animate={{ width: `${progressPct}%` }} transition={{ duration: 0.3 }} />
              </div>
              <span className="text-xs text-muted-foreground w-10 text-right">
                {step}/{totalSteps}
              </span>
            </div>
          </div>
        </div>
      )}

      <div className="container mx-auto max-w-3xl px-4 py-8 flex-1">
        <AnimatePresence mode="wait">
          {/* ===== СТАРТ ===== */}
          {step === 0 && (
            <motion.div key="start" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gold/15 mb-5">
                <Sparkles className="w-8 h-8 text-gold" />
              </div>
              <h1 className="font-display text-3xl sm:text-4xl mb-3">Подберём идеальную фотозону за 30 секунд</h1>
              <p className="text-muted-foreground mb-6 max-w-xl mx-auto">
                Ответьте на 5 простых вопросов — покажем 3 варианта под ваш повод и бюджет.
                Результат сразу на экране, без обязательств. Бонус за прохождение: <b className="text-gold">промокод на скидку 5%</b> 🎁
              </p>
              <Button onClick={() => { track({ event: 'quiz_start', source: presetSource }); setStep(1); }} className="h-14 px-8 bg-gold text-primary-foreground hover:bg-gold/90 text-base font-semibold">
                Начать подбор <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <div className="flex items-center justify-center gap-4 mt-6 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Без спама</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> Результат сразу</span>
                <span className="flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5 text-gold" /> 30 секунд</span>
              </div>
            </motion.div>
          )}

          {/* ===== Q1: ПОВОД ===== */}
          {step === 1 && (
            <motion.div key="q1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow="Шаг 1 из 5" title="Какой у вас повод?" icon={PartyPopper} />
              <div className="grid sm:grid-cols-2 gap-2.5">
                {OCCASIONS.map((o) => (
                  <OptionCard key={o.value} selected={answers.occasion === o.value} onClick={() => { setAnswers({ ...answers, occasion: o.value, childAge: undefined, style: undefined }); }}>
                    <o.icon className="w-5 h-5 text-gold shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{o.label}</div>
                      <div className="text-xs text-muted-foreground">{o.sub}</div>
                    </div>
                  </OptionCard>
                ))}
              </div>
              <NavButtons onNext={goNext} disabled={!canNext()} />
            </motion.div>
          )}

          {/* ===== Q2: ДЕТСКИЙ ВОЗРАСТ (только BIRTHDAY) ===== */}
          {step === 2 && answers.occasion === 'BIRTHDAY' && (
            <motion.div key="q2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow="Шаг 2 из 6" title="Сколько лет имениннику?" icon={Cake} />
              <div className="grid sm:grid-cols-2 gap-2.5">
                {CHILD_AGES.map((a) => (
                  <OptionCard key={a.value} selected={answers.childAge === a.value} onClick={() => setAnswers({ ...answers, childAge: a.value })}>
                    <div className="text-left">
                      <div className="font-medium">{a.label}</div>
                      <div className="text-xs text-muted-foreground">{a.sub}</div>
                    </div>
                  </OptionCard>
                ))}
              </div>
              <NavButtons onNext={goNext} onBack={goBack} disabled={!canNext()} />
            </motion.div>
          )}

          {/* ===== Q3: СТИЛЬ ===== */}
          {((step === 3 && answers.occasion !== 'BIRTHDAY') || (step === 3 && answers.occasion === 'BIRTHDAY' && answers.childAge)) && step === 3 && (
            <motion.div key="q3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow={`Шаг ${answers.occasion === 'BIRTHDAY' ? 3 : 2} из ${totalSteps}`} title="Какая атмосфера ближе?" icon={Sparkles} />
              <div className="grid sm:grid-cols-2 gap-2.5">
                {styles.map((s) => (
                  <OptionCard key={s.value} selected={answers.style === s.value} onClick={() => setAnswers({ ...answers, style: s.value })}>
                    <span className="text-2xl">{s.emoji}</span>
                    <span className="font-medium">{s.label}</span>
                  </OptionCard>
                ))}
              </div>
              <NavButtons onNext={goNext} onBack={goBack} disabled={!canNext()} />
            </motion.div>
          )}

          {/* ===== Q4: ГОСТИ ===== */}
          {step === 4 && (
            <motion.div key="q4" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow={`Шаг ${answers.occasion === 'BIRTHDAY' ? 4 : 3} из ${totalSteps}`} title="Сколько примерно гостей?" icon={Users} />
              <div className="grid sm:grid-cols-2 gap-2.5">
                {GUESTS.map((g) => (
                  <OptionCard key={g.value} selected={answers.guests === g.value} onClick={() => setAnswers({ ...answers, guests: g.value })}>
                    <div className="text-left">
                      <div className="font-medium">{g.label}</div>
                      <div className="text-xs text-muted-foreground">{g.sub}</div>
                    </div>
                  </OptionCard>
                ))}
              </div>
              <NavButtons onNext={goNext} onBack={goBack} disabled={!canNext()} />
            </motion.div>
          )}

          {/* ===== Q5: БЮДЖЕТ ===== */}
          {step === 5 && (
            <motion.div key="q5" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow={`Шаг ${answers.occasion === 'BIRTHDAY' ? 5 : 4} из ${totalSteps}`} title="Какой бюджет на фотозону?" icon={Wallet} />
              <div className="grid sm:grid-cols-2 gap-2.5">
                {BUDGETS.map((b) => (
                  <OptionCard key={b.value} selected={answers.budget === b.value} onClick={() => setAnswers({ ...answers, budget: b.value })}>
                    <span className="font-medium">{b.label}</span>
                  </OptionCard>
                ))}
              </div>
              <NavButtons onNext={goNext} onBack={goBack} disabled={!canNext()} />
            </motion.div>
          )}

          {/* ===== Q6: ДАТА (опционально) ===== */}
          {((answers.occasion === 'BIRTHDAY' && step === 6) || (answers.occasion !== 'BIRTHDAY' && step === 6)) && (
            <motion.div key="q6" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <QuestionHeader eyebrow={`Шаг ${totalSteps} из ${totalSteps}`} title="На какую дату планируете?" icon={Calendar} />
              <p className="text-sm text-muted-foreground mb-4">Это необязательно — можно пропустить. Дата нужна только чтобы менеджер был готов.</p>
              <Input type="date" value={answers.date || ''} onChange={(e) => setAnswers({ ...answers, date: e.target.value })} className="h-14 text-base mb-3" />
              <div className="flex gap-3">
                <Button variant="outline" onClick={goBack} className="h-12 px-6"><ArrowLeft className="w-4 h-4 mr-1" /> Назад</Button>
                <Button onClick={finish} disabled={loading} className="flex-1 h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
                  {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Sparkles className="w-5 h-5 mr-2" />}
                  {loading ? 'Подбираем...' : 'Показать подборку'}
                </Button>
                <Button variant="ghost" onClick={finish} disabled={loading} className="h-12 px-4 text-muted-foreground">Пропустить</Button>
              </div>
            </motion.div>
          )}

          {/* ===== РЕЗУЛЬТАТ ===== */}
          {step === 7 && result && (
            <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/15 mb-3">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400" />
                </div>
                <h1 className="font-display text-3xl sm:text-4xl mb-2">Вот что мы подобрали</h1>
                <p className="text-muted-foreground">
                  {occasionObj?.label}
                  {answers.guests && ` · ${GUESTS.find((g) => g.value === answers.guests)?.label}`}
                  {answers.style && ` · ${styles.find((s) => s.value === answers.style)?.label}`}
                  {answers.budget && answers.budget !== 'unknown' && ` · ${BUDGETS.find((b) => b.value === answers.budget)?.label}`}
                </p>
              </div>

              {/* Промокод */}
              <div className="mb-5 rounded-xl border border-gold/30 bg-gold/10 p-4 flex items-center gap-3 justify-center">
                <Gift className="w-6 h-6 text-gold shrink-0" />
                <div className="text-sm">
                  Промокод <b className="text-gold font-mono text-base">{result.promoCode}</b> — скидка 5%, активен 7 дней. Назовите менеджеру при заказе.
                </div>
              </div>

              {/* 3 карточки */}
              <div className="grid gap-4 sm:grid-cols-3 mb-6">
                {result.recommended[0] && <RecCard z={result.recommended[0]} role="economy" date={answers.date} quizAnswers={answers} sessionId={result.sessionId} />}
                {result.recommended[1] && <RecCard z={result.recommended[1]} role="hit" date={answers.date} quizAnswers={answers} sessionId={result.sessionId} />}
                {result.recommended[2] && <RecCard z={result.recommended[2]} role="premium" date={answers.date} quizAnswers={answers} sessionId={result.sessionId} />}
              </div>

              {result.recommended.length === 0 && (
                <div className="text-center py-10 text-muted-foreground mb-6">
                  Не удалось подобрать — оставьте заявку, менеджер подберёт вручную.
                </div>
              )}

              {/* Блок «Сохранить подборку» */}
              <div className="rounded-2xl border border-border bg-card/50 p-5 mb-5">
                <h3 className="font-display text-lg mb-1">Хотите вернуться позже или показать мужу / родкомитету?</h3>
                <p className="text-sm text-muted-foreground mb-4">Отправим подборку вам или скопируйте постоянную ссылку (живёт 90 дней).</p>
                <div className="flex flex-col sm:flex-row gap-2 mb-3">
                  <Input
                    value={saveContact}
                    onChange={(e) => setSaveContact(e.target.value)}
                    placeholder="Телефон или email"
                    className="h-12 flex-1"
                  />
                  <Button onClick={sendToSelf} disabled={saving || !saveContact.trim()} className="h-12 px-6 bg-gold text-primary-foreground hover:bg-gold/90">
                    {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
                    Отправить мне
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <a href={waDeepLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="w-4 h-4 mr-1.5" /> WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" size="sm" className="h-10">
                    <a href={`https://t.me/${SITE.telegram}`} target="_blank" rel="noopener noreferrer">
                      <Send className="w-4 h-4 mr-1.5" /> Telegram
                    </a>
                  </Button>
                  <Button onClick={copyLink} variant="outline" size="sm" className="h-10">
                    <Copy className="w-4 h-4 mr-1.5" /> Скопировать ссылку
                  </Button>
                  <Button asChild variant="ghost" size="sm" className="h-10">
                    <Link href="/katalog"><ChevronRight className="w-4 h-4 mr-1" /> Весь каталог</Link>
                  </Button>
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground">
                Менеджер свяжется в течение 15 минут в рабочее время и подтвердит варианты на вашу дату
                {answers.date ? '' : ' — если что-то будет занято, сразу предложим аналоги'}.
              </div>

              <div className="text-center mt-4">
                <Button variant="ghost" onClick={() => { setStep(0); setResult(null); setAnswers({ occasion: '' }); }} className="text-muted-foreground">
                  Пройти квиз заново
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function QuestionHeader({ eyebrow, title, icon: Icon }: { eyebrow: string; title: string; icon: any }) {
  return (
    <div className="mb-5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold mb-2">
        <Icon className="w-4 h-4" /> {eyebrow}
      </div>
      <h2 className="font-display text-2xl sm:text-3xl">{title}</h2>
    </div>
  );
}

function OptionCard({ selected, onClick, children }: { selected: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all min-h-[64px] ${
        selected ? 'border-gold bg-gold/10' : 'border-border bg-card hover:border-gold/50'
      }`}
    >
      {children}
    </button>
  );
}

function NavButtons({ onNext, onBack, disabled }: { onNext: () => void; onBack?: () => void; disabled: boolean }) {
  return (
    <div className="flex gap-3 mt-6">
      {onBack && (
        <Button variant="outline" onClick={onBack} className="h-12 px-6"><ArrowLeft className="w-4 h-4 mr-1" /> Назад</Button>
      )}
      <Button onClick={onNext} disabled={disabled} className="flex-1 h-12 bg-gold text-primary-foreground hover:bg-gold/90 font-semibold">
        Далее <ArrowRight className="w-5 h-5 ml-2" />
      </Button>
    </div>
  );
}
