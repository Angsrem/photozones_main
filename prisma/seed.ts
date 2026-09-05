import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

const IMG = (n: string) => `/images/photozones/${n}.png`;

async function main() {
  console.log('Seeding...');

  // ===== Менеджер =====
  await db.manager.upsert({
    where: { email: 'admin@fotozona24.ru' },
    update: {},
    create: {
      email: 'admin@fotozona24.ru',
      name: 'Анна Менеджер',
      phone: '+7 (391) 219-00-24',
      passwordHash: hashPassword('admin123'),
      role: 'ADMIN',
    },
  });

  // ===== Фотозоны =====
  const zones = [
    {
      slug: 'love-installyaciya', title: 'LOVE-инсталляция',
      description: 'Светящиеся буквы LOVE на премиальной подложке из флористики и лёгкой ткани. Главный хит свадебного сезона в Красноярске — создаёт эффект «дорогой» фотозоны и собирает лучшие кадры вечера.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 14900, sizeW: 3, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 1,
      images: [IMG('love'), IMG('svadebnaya-flora')],
      includes: ['Доставка по Красноярску', 'Монтаж за 1 час', 'Демонтаж', 'Аренда до 5 часов', 'Подсветка'],
    },
    {
      slug: 'novogodnyaya-mishura', title: 'Новогодняя мишура',
      description: 'Плотная стена из мерцающей мишуры и шаров — новогодняя фотозона для корпоративов и семейных праздников. Доступна в золотом, серебряном и красном исполнении.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 11900, sizeW: 3, sizeH: 2.5, hit: true, badge: 'HIT', sortOrder: 2,
      images: [IMG('novyj-god')],
      includes: ['Доставка', 'Монтаж и демонтаж', 'Аренда до 4 часов', 'Гирлянда'],
    },
    {
      slug: 'stilyagi', title: 'Стиляги',
      description: 'Яркая ретро-фотозона в стиле 50-х: виниловые пластинки, неон, горошек, силуэт ретро-авто. Идеально для тематических дней рождения и корпоративов.',
      category: 'THEME', occasions: ['BIRTHDAY', 'CORPORATE'],
      basePrice: 12900, sizeW: 3, sizeH: 2.4, hit: false, badge: 'NEW', sortOrder: 3,
      images: [IMG('stilyagi')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Реквизит'],
    },
    {
      slug: 'bukvy-i-cifry', title: 'Буквы и цифры',
      description: 'Светящиеся объёмные буквы и цифры — соберите имя, дату или возраст. Универсальная фотозона для любого повода: свадьба, день рождения, выпускной.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'GRADUATION', 'CORPORATE'],
      basePrice: 8900, sizeW: 2.5, sizeH: 2, hit: true, badge: 'HIT', sortOrder: 4,
      images: [IMG('bukvy-tsifry')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'До 8 символов'],
    },
    {
      slug: 'press-wall-premium', title: 'Пресс-волл «Премиум»',
      description: 'Пресс-волл с живой зеленью и флористикой — брендирование под логотип заказчика. Статусное решение для корпоративов, конференций и свадеб в Красноярске.',
      category: 'PRESSWALL', occasions: ['CORPORATE', 'WEDDING'],
      basePrice: 19900, sizeW: 4, sizeH: 2.4, hit: false, badge: null, sortOrder: 5,
      images: [IMG('press-wall')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Печать логотипа'],
    },
    {
      slug: 'svadebnaya-flora', title: 'Свадебная флора',
      description: 'Арка из живых роз и эвкалипта с драпировкой из шёлка. Классическая свадебная фотозона для выездной регистрации и банкета в ресторанах Красноярска.',
      category: 'TEXTILE', occasions: ['WEDDING'],
      basePrice: 24900, sizeW: 3.5, sizeH: 2.6, hit: true, badge: 'HIT', sortOrder: 6,
      images: [IMG('svadebnaya-flora'), IMG('love')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Живая флористика'],
    },
    {
      slug: 'edonorog', title: 'Волшебный единорог',
      description: 'Детская фотозона «Единорог»: пастельные шары, облака, звёзды и радуга. Делает день рождения ребёнка настоящей сказкой — понравится и малышам, и родителям.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 9900, sizeW: 2.8, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 7,
      images: [IMG('detskaya-edinorog')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 4 часов', 'Шары-дополнение'],
    },
    {
      slug: 'korporativ-brand', title: 'Корпоратив с брендом',
      description: 'Брендированная фотозона для корпоративов с геометрическими панелями и подсветкой в цветах компании. Логотип печатаем на баннере. Для конференций и юбилеев компаний.',
      category: 'PRESSWALL', occasions: ['CORPORATE'],
      basePrice: 22900, sizeW: 4, sizeH: 2.5, hit: false, badge: 'NEW', sortOrder: 8,
      images: [IMG('korporativ-brand')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Печать логотипа', 'Подсветка'],
    },
    {
      slug: 'vesna-8-marta', title: 'Весна — 8 марта',
      description: 'Нежная фотозона к 8 марта: пионы, тюльпаны, пастельные шары и золотые акценты. Праздничный весенний оффер для корпоративов и девичников.',
      category: 'THEME', occasions: ['MARCH_8', 'CORPORATE'],
      basePrice: 13400, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 9,
      images: [IMG('8-marta')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов'],
    },
    {
      slug: 'muzhskaya-23-fevralya', title: 'Мужской характер — 23 февраля',
      description: 'Фотозона к 23 февраля в хаки-золотой гамме: медали, звёзды, строгие формы. Для корпоративных поздравлений и школьных праздников.',
      category: 'THEME', occasions: ['FEB_23', 'CORPORATE'],
      basePrice: 13400, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 10,
      images: [IMG('23-fevralya')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов'],
    },
    {
      slug: 'vypusknoj-zvezdy', title: 'Выпускной — звёзды',
      description: 'Праздничная фотозона для выпускных 9 и 11 классов, детсада: золотые звёзды, шары в цветах школы, цифры года выпуска. Эффектное завершение учебного года.',
      category: 'THEME', occasions: ['GRADUATION'],
      basePrice: 10400, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 11,
      images: [IMG('vypusknoj')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 4 часов', 'Цифры года'],
    },
    {
      slug: 'tekstil-shampan', title: 'Текстильная «Шампань»',
      description: 'Универсальная текстильная фотозона в шампань- ivory гамме с мягкой подсветкой. Лаконичное премиальное решение для любого торжества в Красноярске.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 10900, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 12,
      images: [IMG('tekstilnaya-uzhur')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Подсветка'],
    },
    {
      slug: 'neon-party', title: 'Neon Party',
      description: 'Неоновая фотозона для вечеринок и молодёжных дней рождения: светящиеся надписи, неоновые трубки, тёмный фон. Эффектно смотрится на фото и видео.',
      category: 'THEME', occasions: ['BIRTHDAY', 'CORPORATE'],
      basePrice: 13900, sizeW: 3, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 13,
      images: [IMG('neon-party')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Неон-подсветка'],
    },
    {
      slug: 'rustic-garden', title: 'Rustic Garden',
      description: 'Фотозона в стиле рустик и бохо: деревянные паллеты, полевые цветы, фонарики и гирлянда. Для свадеб и дней рождения на природе и в лофтах.',
      category: 'FRAME', occasions: ['WEDDING', 'BIRTHDAY'],
      basePrice: 11900, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 14,
      images: [IMG('rustic-garden')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Реквизит'],
    },
    {
      slug: 'shary-arka', title: 'Арка из шаров',
      description: 'Большая арка из шаров в палитре заказчика — органика из латексных и фольгированных шаров. Универсальная фотозона для любого повода.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'GRADUATION', 'CORPORATE'],
      basePrice: 12400, sizeW: 3.2, sizeH: 2.5, hit: false, badge: null, sortOrder: 15,
      images: [IMG('shary-arka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов'],
    },
  ];

  for (const z of zones) {
    const existing = await db.photoZone.findUnique({ where: { slug: z.slug } });
    const data = {
      title: z.title, description: z.description, category: z.category,
      occasions: z.occasions as any, basePrice: z.basePrice, sizeW: z.sizeW, sizeH: z.sizeH,
      images: z.images as any, includes: z.includes as any, badge: z.badge, hit: z.hit,
      isActive: true, sortOrder: z.sortOrder,
    };
    if (existing) {
      await db.photoZone.update({ where: { slug: z.slug }, data, elements: { deleteMany: {} } });
    } else {
      await db.photoZone.create({ data: { ...data, slug: z.slug } });
    }
  }

  // ===== Элементы =====
  const elements = [
    { name: 'Световые буквы LOVE', price: 3900, slug: 'love-installyaciya' },
    { name: 'Буквы имени (до 6 символов)', price: 2900, slug: 'bukvy-i-cifry' },
    { name: 'Цифры года (комплект)', price: 1900, slug: 'bukvy-i-cifry' },
    { name: 'Неоновая надпись', price: 3500, slug: 'neon-party' },
    { name: 'Композиция из шаров (50 шт)', price: 2500, slug: 'shary-arka' },
    { name: 'Гирлянда «Звёздное небо»', price: 1500, slug: 'tekstil-shampan' },
    { name: 'Пресс-волл баннер с логотипом', price: 4500, slug: 'press-wall-premium' },
    { name: 'Флористика (доп. композиция)', price: 3200, slug: 'svadebnaya-flora' },
    { name: 'Реквизит для фотосессии', price: 900, slug: 'stilyagi' },
    { name: 'Доп. час аренды', price: 800, slug: 'love-installyaciya' },
  ];
  for (const e of elements) {
    const pz = await db.photoZone.findUnique({ where: { slug: e.slug } });
    await db.element.create({
      data: { name: e.name, price: e.price, photozoneId: pz?.id },
    });
  }

  // ===== Отзывы =====
  const reviews = [
    { author: 'Екатерина С.', event: 'Свадьба', rating: 5, text: 'Заказывали LOVE-инсталляцию на свадьбу в ресторан «Гранд». Поставили за час, всё идеально, гости в восторге! Фотографии получились как из журнала. Красноярск, спасибо!', photos: [] },
    { author: 'Дмитрий и Ольга', event: 'Свадьба', rating: 5, text: 'Свадебная флора — просто вау. Живые розы, монтаж аккуратный. Менеджер перезвонил через 10 минут после заявки, всё подтвердили на нужную дату.', photos: [] },
    { author: 'Марина К.', event: 'День рождения', rating: 5, text: 'Брали фотозону «Стиляги» на юбилей. Ярко, весело, реквизит в комплекте. Ребята молодцы, привезли вовремя в Советский район.', photos: [] },
    { author: 'ООО «Сибирь-Трейд»', event: 'Корпоратив', rating: 5, text: 'Корпоративная фотозона с нашим логотипом к новому году. Брендировали, всё чётко. 120 сотрудников — все сфоткались. Рекомендуем.', photos: [] },
    { author: 'Анна П.', event: 'Детский праздник', rating: 5, text: 'Единорог на день рождения дочки — восторг! Дети фотографировались весь вечер. Доставили в Октябрьский район без проблем.', photos: [] },
    { author: 'Школа №47', event: 'Выпускной', rating: 5, text: 'Фотозона на выпускной 11 класса. Звёзды, шары, цифры года. Доступно и красиво, дети довольны. Спасибо за оперативность.', photos: [] },
    { author: 'Сергей В.', event: 'Корпоратив 23 февраля', rating: 4, text: 'Брали фотозону к 23 февраля. Стильно, мужской характер. Единственное — хотелось бы больше реквизита, но в целом отлично.', photos: [] },
    { author: 'Юлия Р.', event: '8 марта', rating: 5, text: 'Весенняя фотозона в офис на 8 марта. Цветы свежие, шары нежные. Девушки в восторге. Перезвонили быстро, подтвердили дату.', photos: [] },
    { author: 'Игорь М.', event: 'День рождения', rating: 5, text: 'Neon Party на 30-летие — это огонь! Неоновые надписи, тёмный фон, на фото смотрится шикарно. Монтаж за 40 минут.', photos: [] },
    { author: 'Наталья Б.', event: 'Свадьба', rating: 5, text: 'Текстильная фотозона «Шампань» — классика, подошла под любую декорацию зала. Премиально и аккуратно. Красноярск, рекомендую!', photos: [] },
  ];
  for (const r of reviews) {
    await db.review.create({ data: { ...r, photos: r.photos as any, isPublished: true } });
  }

  // ===== Тестовые заявки =====
  const pzLove = await db.photoZone.findUnique({ where: { slug: 'love-installyaciya' } });
  const pzNy = await db.photoZone.findUnique({ where: { slug: 'novogodnyaya-mishura' } });
  const pzEd = await db.photoZone.findUnique({ where: { slug: 'edonorog' } });
  const d = (offset: number) => {
    const x = new Date(); x.setDate(x.getDate() + offset); return x.toISOString().slice(0, 10);
  };
  const leads = [
    { name: 'Иван Петров', phone: '+7 (913) 555-12-34', eventDate: d(14), occasion: 'WEDDING', photozoneId: pzLove?.id, source: '/katalog/love-installyaciya', sourcePage: '/katalog/love-installyaciya', status: 'NEW', comment: 'Свадьба на 40 человек, ресторан в Центральном районе.' },
    { name: 'Светлана', phone: '+7 (950) 421-88-09', eventDate: d(30), occasion: 'NEW_YEAR', photozoneId: pzNy?.id, source: '/prazdniki/novyj-god', sourcePage: '/prazdniki/novyj-god', status: 'CALLED', comment: 'Корпоратив 30 человек.' },
    { name: 'Олег', phone: '+7 (902) 100-77-21', eventDate: d(7), occasion: 'BIRTHDAY', photozoneId: pzEd?.id, source: '/detskie-prazdniki', sourcePage: '/detskie-prazdniki', status: 'CONFIRMED', comment: 'День рождения 6 лет, Подгорный.' },
    { name: 'Мария', phone: '+7 (923) 338-11-50', eventDate: d(2), occasion: 'BIRTHDAY', source: '/kalkulyator', sourcePage: '/kalkulyator', status: 'NEW', comment: 'Расчёт из калькулятора.', config: { occasion: 'BIRTHDAY', style: 'neon', base: 'frame-m', extras: ['neon'], date: d(2), address: 'Красноярск, Свободный пр.', surcharge: 0 }, priceEstimate: 13900 },
    { name: 'Алексей', phone: '+7 (913) 909-44-10', eventDate: d(45), occasion: 'CORPORATE', source: '/korporativy', sourcePage: '/korporativy', status: 'NEW', comment: 'Корпоратив 80 человек, нужен бренд.' },
    { name: 'Татьяна', phone: '+7 (960) 771-23-05', eventDate: d(-3), occasion: 'WEDDING', source: '/svadby', sourcePage: '/svadby', status: 'DONE', comment: 'Свадьба прошла отлично.' },
    { name: 'Денис', phone: '+7 (983) 158-90-66', eventDate: d(21), occasion: 'GRADUATION', source: '/vypusknie', sourcePage: '/vypusknie', status: 'DECLINED', comment: 'Дата занята, подобрали аналог.' },
  ];
  for (const l of leads) {
    const created = await db.lead.create({
      data: {
        name: l.name, phone: l.phone, eventDate: l.eventDate, occasion: l.occasion,
        comment: l.comment, photozoneId: l.photozoneId ?? null, source: l.source,
        sourcePage: l.sourcePage, status: l.status as any,
        utm: { source: 'google', medium: 'cpc', campaign: 'krasnoyarsk_photozones' } as any,
        config: (l as any).config ?? null, priceEstimate: (l as any).priceEstimate ?? null,
      } as any,
    });
    // для CONFIRMED/DONE — создаём бронирование
    if ((l.status === 'CONFIRMED' || l.status === 'DONE') && l.photozoneId) {
      await db.booking.create({
        data: {
          leadId: created.id, photozoneId: l.photozoneId, date: l.eventDate,
          status: l.status === 'DONE' ? 'DONE' : 'RESERVED', note: 'Из заявки',
        },
      });
    }
  }

  // ===== Промо =====
  await db.promo.create({
    data: {
      title: 'Раннее бронирование — скидка 10%',
      description: 'При заказе фотозоны за 30 дней до мероприятия — скидка 10% на аренду.',
      discount: 10, isActive: true, pages: ['/', '/katalog', '/ceny'] as any,
    },
  });
  await db.promo.create({
    data: {
      title: 'Новогодний оффер: 2 фотозоны по цене одной',
      description: 'При заказе двух новогодних фотозон — вторая со скидкой 50%.',
      discount: 50, isActive: true, pages: ['/prazdniki/novyj-god'] as any,
    },
  });

  // ===== Блог =====
  await db.article.upsert({
    where: { slug: 'kak-vybrat-fotozonu-na-svadbu' },
    update: {},
    create: {
      slug: 'kak-vybrat-fotozonu-na-svadbu',
      title: 'Как выбрать фотозону на свадьбу в Красноярске: гид 2025',
      excerpt: 'Размеры, стиль, площадка и бюджет — разбираем, какую фотозону выбрать для свадьбы в Красноярске, чтобы гости остались в восторге.',
      cover: IMG('svadebnaya-flora'),
      tags: ['свадьба', 'фотозона', 'красноярск'] as any,
      content: `# Как выбрать фотозону на свадьбу\n\nВыбор свадебной фотозоны в Красноярске зависит от площадки, стиля торжества и бюджета. Главное правило — фотозона должна стать смысловым центром зала, а не «приложением».\n\n## 1. Определите площадку\n\nДля ресторанов Красноярска подойдут пресс-воллы и текстильные фотозоны высотой 2,4–2,6 м. Для выездных регистраций на природе — арки и флористика.\n\n## 2. Подберите стиль\n\nКлассика — свадебная флора и LOVE-инсталляция. Современные решения — неон и текстиль «Шампань».\n\n## 3. Размер\n\nОптимальная ширина фотозоны — 3 м, чтобы помещалась группа из 4–6 человек.\n\n## 4. Бюджет\n\nВ Красноярске аренда свадебной фотозоны стартует от 14 900 ₽ с доставкой и монтажом.\n\n## 5. Бронирование\n\nЗаказывайте фотозону заранее — за 30–60 дней до даты, особенно в сезон май–сентябрь.`,
    },
  });
  await db.article.upsert({
    where: { slug: 'novogodnie-fotozony-krasnoyarsk' },
    update: {},
    create: {
      slug: 'novogodnie-fotozony-krasnoyarsk',
      title: 'Новогодние фотозоны в Красноярске: что выбрать для корпоратива',
      excerpt: 'Обзор новогодних фотозон для корпоративов в Красноярске: мишура, пресс-воллы с брендом, тематические инсталляции.',
      cover: IMG('novyj-god'),
      tags: ['новый год', 'корпоратив', 'фотозона'] as any,
      content: `# Новогодние фотозоны в Красноярске\n\nНовогодний корпоратив — главный декабрьский повод для аренды фотозоны. Разбираем популярные решения.\n\n## Мишура и шары\n\nПлотная стена из мерцающей мишуры — классика, которая всегда работает.\n\n## Брендированный пресс-волл\n\nДля корпоративов — добавьте логотип компании. Печать баннера включена в стоимость.\n\n## Сроки\n\nБронируйте новогоднюю фотозону в Красноярске до середины ноября — декабрь разбирают быстро.`,
    },
  });

  console.log('Seed complete.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
