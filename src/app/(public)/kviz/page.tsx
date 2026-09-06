import type { Metadata } from 'next';
import { JsonLd } from '@/components/seo/json-ld';
import { localBusinessLd, breadcrumbsLd } from '@/lib/seo';
import { QuizWizard } from './quiz-wizard';

export const metadata: Metadata = {
  title: 'Подбор фотозоны за 30 секунд — квиз | ФотоЗона24 Красноярск',
  description: 'Ответьте на 5 вопросов — покажем 3 подходящие фотозоны под ваш повод и бюджет. Бонус за прохождение: промокод на скидку 5%. Без спама.',
  alternates: { canonical: '/kviz' },
};

export default function KvizPage() {
  return (
    <>
      <JsonLd data={[localBusinessLd(), breadcrumbsLd([{ name: 'Главная', url: '/' }, { name: 'Подбор фотозоны', url: '/kviz' }])]} />
      <QuizWizard />
    </>
  );
}
