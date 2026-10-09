import { db } from '../src/lib/db';

// Seed 3 лид-магнита: свадебный, выпускной, новогодний.
// PDF пока не создаём — fileUrl указывает на /downloads/<slug>.pdf (заглушка).

const magnets = [
  {
    slug: 'svadba-47-punktov',
    title: '47 пунктов оформления свадьбы в Красноярске',
    description:
      'Чек-лист с 47 пунктами: от выбора фотозоны и арки до света, флористики и реквизита. Поможет не упустить детали и заложить реальный бюджет на декор.',
    fileUrl: '/downloads/svadba-47-punktov.pdf',
    occasion: 'WEDDING',
    isActive: true,
  },
  {
    slug: 'vypusknoj-cheklist',
    title: 'Чек-лист родкомитета: выпускной без хаоса',
    description:
      'Пошаговый чек-лист для родительского комитета: что и за сколько дней до выпускного нужно сделать — от согласования с администрацией школы до фотозоны и реквизита.',
    fileUrl: '/downloads/vypusknoj-cheklist.pdf',
    occasion: 'GRADUATION',
    isActive: true,
  },
  {
    slug: 'ng-20-idey',
    title: '20 идей новогодней фотозоны: от 5 000 ₽',
    description:
      'Подборка из 20 готовых идей новогодней фотозоны под любой бюджет — от компактных домашних вариантов до брендированных пресс-воллов для корпоратива.',
    fileUrl: '/downloads/ng-20-idey.pdf',
    occasion: 'NEW_YEAR',
    isActive: true,
  },
];

async function main() {
  for (const m of magnets) {
    const existing = await db.leadMagnet.findUnique({ where: { slug: m.slug } });
    if (existing) {
      await db.leadMagnet.update({
        where: { slug: m.slug },
        data: {
          title: m.title,
          description: m.description,
          fileUrl: m.fileUrl,
          occasion: m.occasion,
          isActive: m.isActive,
        },
      });
      console.log(`↻ обновлён: ${m.slug}`);
    } else {
      await db.leadMagnet.create({ data: m });
      console.log(`✓ создан: ${m.slug}`);
    }
  }

  const total = await db.leadMagnet.count();
  console.log(`\nИтого лид-магнитов: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
