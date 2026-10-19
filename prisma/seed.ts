import { db } from '../src/lib/db';
import { hashPassword } from '../src/lib/auth';

// Хелперы путей изображений (все .png — сгенерированы без людей)
const IMG = (n: string) => `/images/photozones/${n}.png`;
const IMGD = (folder: string, n: string) => `/images/photozones/${folder}/${n}.png`;

async function main() {
  console.log('Seeding...');

  // ===== Менеджер =====
  // В production пароль обязательно задаётся через ADMIN_PASSWORD.
  // Для sandbox/dev используем 'admin123' как fallback (явно из env).
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@fotozona24.ru';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  await db.manager.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: 'Анна Менеджер',
      phone: '+7 (391) 219-00-24',
      passwordHash: hashPassword(adminPassword),
      role: 'ADMIN',
    },
  });

  // ===== 53 фотозоны =====
  // calc_price = Σ(elements) + доставка (2000) + монтаж (3000 фикс если subtotal < 15000, иначе 20%)
  // base_price = round(calc_price × 0.85 / 10) × 10 − 10  (× 0.85 = −15% + психологическая −10₽)
  const zones = [
    // ===== HIT (sortOrder 1-6) =====
    {
      slug: 'love-installyaciya', title: 'LOVE-инсталляция',
      description: 'Светящиеся буквы LOVE на премиальной подложке из флористики и лёгкой ткани. Главный хит свадебного сезона в Красноярске — создаёт эффект «дорогой» фотозоны и собирает лучшие кадры вечера.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 23250, sizeW: 3, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 1,
      images: [IMG('love'), IMG('svadebnaya-flora')],
      includes: ['Доставка по Красноярску (туда+обратно)', 'Монтаж и демонтаж', 'Аренда до 1 суток', 'Подсветка'],
    },
    {
      slug: 'svadebnaya-flora', title: 'Свадебная флора',
      description: 'Арка из живых роз и эвкалипта с драпировкой из шёлка ivory. Классическая свадебная фотозона для выездной регистрации и банкета в ресторанах Красноярска.',
      category: 'TEXTILE', occasions: ['WEDDING'],
      basePrice: 21410, sizeW: 3.5, sizeH: 2.6, hit: true, badge: 'HIT', sortOrder: 2,
      images: [IMG('svadebnaya-flora'), IMG('love')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Живая флористика'],
    },
    {
      slug: 'novogodnyaya-mishura', title: 'Новогодняя мишура',
      description: 'Плотная стена из мерцающей мишуры на каркасе — новогодняя фотозона для корпоративов и семейных праздников. Доступна в золотом, серебряном и красном исполнении.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 21000, sizeW: 3, sizeH: 2.5, hit: true, badge: 'HIT', sortOrder: 3,
      images: [IMG('novyj-god')],
      includes: ['Доставка', 'Монтаж и демонтаж', 'Аренда до 4 часов', 'Гирлянда'],
    },
    {
      slug: 'bukvy-i-cifry', title: 'Буквы и цифры',
      description: 'Светящиеся объёмные буквы и цифры — соберите имя, дату или возраст. Универсальная фотозона для любого повода: свадьба, день рождения, выпускной.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'GRADUATION', 'CORPORATE'],
      basePrice: 9600, sizeW: 2.5, sizeH: 2, hit: true, badge: 'HIT', sortOrder: 4,
      images: [IMG('bukvy-tsifry')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'До 8 символов'],
    },
    {
      slug: 'edonorog', title: 'Волшебный единорог',
      description: 'Детская фотозона «Единорог»: пастельные шары, облака, звёзды и радуга. Делает день рождения ребёнка настоящей сказкой — понравится и малышам, и родителям.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 24570, sizeW: 2.8, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 5,
      images: [IMG('detskaya-edinorog')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 4 часов', 'Шары-дополнение'],
    },
    {
      slug: 'neon-party', title: 'Neon Party',
      description: 'Неоновая фотозона для вечеринок и молодёжных дней рождения: светящиеся надписи, неоновые трубки, тёмный фон. Эффектно смотрится на фото и видео.',
      category: 'THEME', occasions: ['BIRTHDAY', 'CORPORATE'],
      basePrice: 27020, sizeW: 3, sizeH: 2.4, hit: true, badge: 'HIT', sortOrder: 6,
      images: [IMG('neon-party')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Неон-подсветка'],
    },

    // ===== NEW (sortOrder 7-14) =====
    {
      slug: 'stilyagi', title: 'Стиляги',
      description: 'Яркая ретро-фотозона в стиле 50-х: виниловые пластинки, неон, горошек, силуэт ретро-авто. Идеально для тематических дней рождения и корпоративов.',
      category: 'THEME', occasions: ['BIRTHDAY', 'CORPORATE'],
      basePrice: 22840, sizeW: 3, sizeH: 2.4, hit: false, badge: 'NEW', sortOrder: 7,
      images: [IMG('stilyagi')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Реквизит'],
    },
    {
      slug: 'korporativ-brand', title: 'Корпоратив с брендом',
      description: 'Брендированная фотозона для корпоративов с геометрическими панелями и подсветкой в цветах компании. Логотип печатаем на баннере. Для конференций и юбилеев компаний.',
      category: 'PRESSWALL', occasions: ['CORPORATE'],
      basePrice: 31000, sizeW: 4, sizeH: 2.5, hit: false, badge: 'NEW', sortOrder: 8,
      images: [IMG('korporativ-brand')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Печать логотипа', 'Подсветка'],
    },
    {
      slug: 'paillettes-gold', title: 'Стена из пайеток «Золото»',
      description: 'Премиальная стена из мерцающих золотых пайеток с неоновой надписью и студийным светом. Эффект «дорогого» дизайна для свадеб, юбилеев и бренд-ивентов.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 29980, sizeW: 3, sizeH: 2.4, hit: false, badge: 'NEW', sortOrder: 9,
      images: [IMG('paillettes-gold')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка', 'Неоновая надпись'],
    },
    {
      slug: 'paillettes-silver', title: 'Стена из пайеток «Серебро»',
      description: 'Серебряная стена из пайеток с холодным световым акцентом и звёздной гирляндой. Универсальное решение для зимних свадеб и корпоративов.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'NEW_YEAR'],
      basePrice: 31510, sizeW: 3, sizeH: 2.4, hit: false, badge: 'NEW', sortOrder: 10,
      images: [IMG('paillettes-silver')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'paillettes-black-gold', title: 'Стена из пайеток «Чёрное золото»',
      description: 'Драматичная чёрно-золотая стена из пайеток с неоновым акцентом. Премиальный выбор для юбилеев, бренд-активаций и статусных корпоративов.',
      category: 'TEXTILE', occasions: ['BIRTHDAY', 'CORPORATE', 'NEW_YEAR'],
      basePrice: 33750, sizeW: 3, sizeH: 2.4, hit: false, badge: 'NEW', sortOrder: 11,
      images: [IMG('paillettes-black-gold')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка', 'Неоновая надпись', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'flower-wall-white-roses', title: 'Цветочная стена «Белые розы»',
      description: 'Премиальная цветочная стена 2.5×2.5 м из белых роз и эвкалипта. Классическое решение для свадеб и статусных дней рождения в Красноярске.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY'],
      basePrice: 24270, sizeW: 2.5, sizeH: 2.5, hit: false, badge: 'NEW', sortOrder: 12,
      images: [IMG('flower-wall-white-roses')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка'],
    },
    {
      slug: 'flower-wall-peon-pink', title: 'Цветочная стена «Пионы розовые»',
      description: 'Розовая стена из пионов 2.5×2.5 м с зеленью. Нежное решение для девичников, 8 марта, свадеб и дней рождения.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'MARCH_8'],
      basePrice: 21610, sizeW: 2.5, sizeH: 2.5, hit: false, badge: 'NEW', sortOrder: 13,
      images: [IMG('flower-wall-peon-pink')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка'],
    },
    {
      slug: 'flower-wall-red-roses', title: 'Цветочная стена «Красные розы»',
      description: 'Бордовая стена из красных роз 2.5×2.5 м. Драматичное и романтичное решение для свадеб, юбилеев и корпоративов.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 20900, sizeW: 2.5, sizeH: 2.5, hit: false, badge: 'NEW', sortOrder: 14,
      images: [IMG('flower-wall-red-roses')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'LED-подсветка'],
    },

    // ===== TPL-01 Мольберт-классика (sortOrder 15-21) =====
    {
      slug: 'dr-molebert-shary', title: 'День рождения: мольберт + шары',
      description: 'Базовый набор для дня рождения: деревянный мольберт с цифрами возраста и композиция из 30 пастельных шаров. Лёгкая и быстрая фотозона для дома или небольшого зала.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 10260, sizeW: 1.6, sizeH: 1.8, hit: false, badge: null, sortOrder: 15,
      images: [IMGD('dop', 'den-rozhdeniya-molebert-shary')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры возраста'],
    },
    {
      slug: 'yubilej-molebert-shary', title: 'Юбилей: мольберт и шары 50',
      description: 'Юбилейная фотозона: мольберт с цифрами возраста, надписью «Юбилей» и 50 шаров в пастельной гамме. Универсальный выбор для 30-, 40-, 50-летия.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 13400, sizeW: 1.6, sizeH: 1.8, hit: false, badge: null, sortOrder: 16,
      images: [IMGD('yubilei', 'yubilej-molebert-shary')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры возраста', 'Надпись «Юбилей»'],
    },
    {
      slug: 'yubilej-45-chyorno-zoloto', title: 'Юбилей 45: чёрно-золотая',
      description: 'Премиальный мольберт для 45-летия в чёрно-золотой гамме: надпись «Юбилей», цифры 45, 30 шаров чёрно-золото. Статусный вариант для ресторана.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 12570, sizeW: 1.8, sizeH: 2, hit: false, badge: null, sortOrder: 17,
      images: [IMGD('dop', 'yubilej-45-chyorno-zoloto')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры 45', 'Надпись «Юбилей»'],
    },
    {
      slug: 'yubilej-50-izumrud-zoloto', title: 'Юбилей 50: изумруд-золото',
      description: 'Премиальный мольберт для 50-летия в изумрудно-золотой гамме с флористикой из эвкалипта. Статусное решение для ресторана или банкетного зала.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 14100, sizeW: 1.8, sizeH: 2, hit: false, badge: null, sortOrder: 18,
      images: [IMGD('dop', 'yubilej-50-izumrud-zoloto')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры 50', 'Флористика эвкалипт', 'Надпись «Юбилей»'],
    },
    {
      slug: 'yubilej-50-sin-zoloto-lyuks', title: 'Юбилей 50: сине-золотая люкс',
      description: 'Премиум-сборка для 50-летия: мольберт, цифры 50, надпись «Юбилей», 50 шаров люкс, флористика эвкалипт и LED-подсветка. Самая статусная мольберт-фотозона.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 18860, sizeW: 1.8, sizeH: 2, hit: false, badge: null, sortOrder: 19,
      images: [IMGD('dop', 'yubilej-50-sin-zoloto-lyuks')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Цифры 50', 'Флористика эвкалипт', 'LED-подсветка', 'Надпись «Юбилей»'],
    },
    {
      slug: 'yubilej-zvezdy-shary', title: 'Звёзды и шары (юбилей)',
      description: 'Юбилейная фотозона: мольберт, 5 больших золотых звёзд, 50 шаров пастель и надпись «Юбилей». Эффектное решение для 25-, 30-, 50-летия.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 14760, sizeW: 2, sizeH: 2.2, hit: false, badge: null, sortOrder: 20,
      images: [IMGD('yubilei', 'yubilej-zvezdy-shary')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', '5 больших звёзд', 'Надпись «Юбилей»'],
    },
    {
      slug: 'dr-asimmetriya-shary', title: 'ДР асимметрия + шары',
      description: 'Асимметричный декор: мольберт со смещённой композиций, 50 шаров и неоновая надпись «Happy Birthday». Современный выбор для молодёжного дня рождения.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 15680, sizeW: 2.2, sizeH: 2.2, hit: false, badge: null, sortOrder: 21,
      images: [IMGD('dop', 'dr-asimmetriya-shary')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Неоновая надпись'],
    },

    // ===== TPL-02 Буквы-цифры (sortOrder 22) =====
    {
      slug: 'yubilej-klassika-molebert', title: 'Юбилей-классика (мольберт)',
      description: 'Классический юбилейный мольберт-премиум с надписью «Юбилей» и 30 шаров пастель. Универсальное решение для любого юбилея.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 10450, sizeW: 1.8, sizeH: 2, hit: false, badge: null, sortOrder: 22,
      images: [IMGD('yubilei', 'yubilej-klassika-molebert')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Надпись «Юбилей»'],
    },

    // ===== TPL-03 Арка-свадебная (sortOrder 23-26) =====
    {
      slug: 'rustic-garden', title: 'Rustic Garden',
      description: 'Фотозона в стиле рустик и бохо: деревянные паллеты, полевые цветы, фонарики и гирлянда. Для свадеб и дней рождения на природе и в лофтах.',
      category: 'FRAME', occasions: ['WEDDING', 'BIRTHDAY'],
      basePrice: 12490, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 23,
      images: [IMG('rustic-garden')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Реквизит'],
    },
    {
      slug: 'dr-bordo-zoloto-arka', title: 'ДР: бордо-золотая арка',
      description: 'Юбилейная арка в бордо-золотой гамме с розами бордо, драпировкой и цифрами возраста. Премиальное решение для 30-, 40-, 50-летия.',
      category: 'FRAME', occasions: ['BIRTHDAY'],
      basePrice: 17530, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 24,
      images: [IMGD('dop', 'dr-bordo-zoloto-arka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры возраста', 'Флористика розы бордо'],
    },
    {
      slug: 'dr-zeleno-zolotaya-arka', title: 'ДР: зелёно-золотая арка',
      description: 'Арка в зелёно-золотой гамме с эвкалиптом, золотой драпировкой и цифрами возраста. Элегантное решение для статусного юбилея.',
      category: 'FRAME', occasions: ['BIRTHDAY'],
      basePrice: 15900, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 25,
      images: [IMGD('dop', 'dr-zeleno-zolotaya-arka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры возраста', 'Флористика эвкалипт'],
    },
    {
      slug: 'dr-belaya-arka-zvezdy', title: 'ДР: белая арка + звёзды',
      description: 'Белая арка с розами, драпировкой ivory, гирляндой звёзд и 30 шаров. Свадебный премиум-вариант или для статусного юбилея.',
      category: 'FRAME', occasions: ['WEDDING', 'BIRTHDAY'],
      basePrice: 21410, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 26,
      images: [IMGD('dop2', 'dr-belaya-arka-zvezdy')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Флористика белые розы', 'Гирлянда звёзды'],
    },

    // ===== TPL-05 Арка из шаров (sortOrder 27) =====
    {
      slug: 'shary-arka', title: 'Арка из шаров',
      description: 'Большая арка из шаров в палитре заказчика — органика из латексных и фольгированных шаров. Универсальная фотозона для любого повода.',
      category: 'THEME', occasions: ['WEDDING', 'BIRTHDAY', 'GRADUATION', 'CORPORATE'],
      basePrice: 14610, sizeW: 3.2, sizeH: 2.5, hit: false, badge: null, sortOrder: 27,
      images: [IMG('shary-arka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', '50 шаров пастель'],
    },

    // ===== TPL-07 Стена-ткань (sortOrder 28-31) =====
    {
      slug: 'tekstil-shampan', title: 'Текстильная «Шампань»',
      description: 'Универсальная текстильная фотозона в шампань-ivory гамме с мягкой подсветкой. Лаконичное премиальное решение для любого торжества в Красноярске.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 16620, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 28,
      images: [IMG('tekstilnaya-uzhur')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Подсветка'],
    },
    {
      slug: 'ng-shale', title: 'НГ шаль',
      description: 'Новогодняя текстильная фотозона с фактурой «шаль», 30 шарами и звёздной гирляндой. Уютное решение для декабрьских корпоративов и домашних праздников.',
      category: 'TEXTILE', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 20700, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 29,
      images: [IMGD('novogodnie', 'novyj-god-shale')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 4 часов', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'zoloto-barkhat', title: 'Золото и бархат',
      description: 'Премиальная стена из бархата с золотой драпировкой, неоновой надписью, 50 шаров и LED-подсветкой. Статусное решение для бренд-ивентов и юбилеев.',
      category: 'TEXTILE', occasions: ['WEDDING', 'BIRTHDAY', 'CORPORATE'],
      basePrice: 32120, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 30,
      images: [IMGD('novogodnie-dop', 'zoloto-barkhka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Неоновая надпись', 'LED-подсветка'],
    },
    {
      slug: 'yubilej-rozovo-zolotoj', title: 'Розово-золотой юбилей',
      description: 'Премиальная стена в розово-золотой гамме с пионами и цифрами возраста. Идеально для женских юбилеев и 8 марта.',
      category: 'TEXTILE', occasions: ['BIRTHDAY', 'MARCH_8'],
      basePrice: 27630, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 31,
      images: [IMGD('yubilei', 'yubilej-rozovo-zolotoj')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Цифры возраста', 'Флористика пионы'],
    },

    // ===== TPL-09 Пресс-волл (sortOrder 32) =====
    {
      slug: 'press-wall-premium', title: 'Пресс-волл «Премиум»',
      description: 'Пресс-волл с живой зеленью и флористикой — брендирование под логотип заказчика. Статусное решение для корпоративов, конференций и свадеб в Красноярске.',
      category: 'PRESSWALL', occasions: ['CORPORATE', 'WEDDING'],
      basePrice: 29980, sizeW: 4, sizeH: 2.4, hit: false, badge: null, sortOrder: 32,
      images: [IMG('press-wall')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Печать логотипа', 'Живая зелень'],
    },

    // ===== TPL-10 Neon-party (sortOrder 33) =====
    {
      slug: 'hb-bordo-neon', title: 'Happy Birthday бордо-неон',
      description: 'Премиальная неоновая фотозона для дня рождения: бордовая драпировка, неоновая надпись «Happy Birthday», 30 шаров бордо и студийный свет.',
      category: 'THEME', occasions: ['BIRTHDAY'],
      basePrice: 27020, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 33,
      images: [IMGD('dop', 'happy-birthday-bordo-neon')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Неоновая надпись'],
    },

    // ===== TPL-11 Новогодняя ёлка (sortOrder 34-40) =====
    {
      slug: 'khrustalnaya-yolka', title: 'Хрустальная ёлка',
      description: 'Хрустальная ёлка с прозрачными украшениями, драпировкой ivory и звёздной гирляндой. Изысканное новогоднее решение для интерьера в белом.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 15120, sizeW: 2.5, sizeH: 2.4, hit: false, badge: null, sortOrder: 34,
      images: [IMGD('novogodnie-dop', 'khrustalnaya-yolka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'ng-belye-perya-zoloto', title: 'НГ белые перья + золото',
      description: 'Новогодняя фотозона с белыми перьями и золотом, ёлкой 1.5 м и золотой драпировкой. Эффектное решение для статусного корпоратива.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 28350, sizeW: 3, sizeH: 2.5, hit: false, badge: null, sortOrder: 35,
      images: [IMGD('dop', 'ng-belye-perya-zoloto')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Ёлка 1.5 м'],
    },
    {
      slug: 'ng-vitrina-pompony', title: 'НГ витрина (помпоны)',
      description: 'Новогодняя витрина с пушистыми помпонами, ёлкой и звёздной гирляндой. Нежное решение для детских праздников и фотосессий.',
      category: 'THEME', occasions: ['NEW_YEAR', 'BIRTHDAY'],
      basePrice: 20290, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 36,
      images: [IMGD('novogodnie', 'novyj-god-vitrina-pompony')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Ёлка 1.5 м', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'ng-vitrina-skan', title: 'НГ витрина (скан)',
      description: 'Скандинавская новогодняя витрина с ёлкой, пряничными домиками и 30 шаров. Уютное решение в стиле hygge.',
      category: 'THEME', occasions: ['NEW_YEAR'],
      basePrice: 21610, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 37,
      images: [IMGD('novogodnie', 'novyj-god-vitrina-skan')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Ёлка 1.5 м', 'Пряничные домики'],
    },
    {
      slug: 'fioletovo-zolotaya-yolka', title: 'Фиолетово-золотая ёлка',
      description: 'Премиальная фиолетовая ёлка с золотой драпировкой, неоновой надписью, 50 шаров и LED-подсветкой. Эффектная фотозона для статусного корпоратива.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 24980, sizeW: 3, sizeH: 2.5, hit: false, badge: null, sortOrder: 38,
      images: [IMGD('novogodnie-dop', 'fioletovo-zolotaya-yolka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Неоновая надпись', 'LED-подсветка'],
    },
    {
      slug: 'snezhnaya-yolka-fiolet', title: 'Снежная ёлка (фиолет)',
      description: 'Снежная фиолетовая ёлка с драпировкой ivory, звёздной гирляндой и 30 шаров. Нежное зимнее решение для фотосессий.',
      category: 'THEME', occasions: ['NEW_YEAR'],
      basePrice: 17430, sizeW: 2.5, sizeH: 2.4, hit: false, badge: null, sortOrder: 39,
      images: [IMGD('novogodnie-dop', 'snezhnaya-yolka-fiolet')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'zimnyaya-skazka-yolka', title: 'Зимняя сказка (ёлка)',
      description: 'Зимняя сказка: ёлка 2 м премиум, звёздная гирлянда, 50 шаров, LED-подсветка и драпировка ivory. Эффектное новогоднее решение для корпоративов.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 21510, sizeW: 3, sizeH: 2.5, hit: false, badge: null, sortOrder: 40,
      images: [IMGD('novogodnie-dop', 'zimnyaya-skazka-yolka')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Ёлка 2 м', 'LED-подсветка'],
    },

    // ===== TPL-12 Камин новогодний (sortOrder 41-45) =====
    {
      slug: 'ng-vitrina-octin', title: 'НГ витрина (Octin)',
      description: 'Новогодняя витрина в стиле Octin: каркас, декоративное окно, ёлка 1.5 м и звёздная гирлянда. Современное решение для бренда.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 25180, sizeW: 3, sizeH: 2.5, hit: false, badge: null, sortOrder: 41,
      images: [IMGD('dop', 'ng-vitrina-octin')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Ёлка 1.5 м', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'kamin-yolka-kantri', title: 'Камин + ёлка кантри',
      description: 'Рустикальный камин с ёлкой 1.5 м, 30 шаров и реквизитом для фотосессии. Уютное новогоднее решение в стиле кантри.',
      category: 'THEME', occasions: ['NEW_YEAR'],
      basePrice: 19370, sizeW: 2.5, sizeH: 2.4, hit: false, badge: null, sortOrder: 42,
      images: [IMGD('dop2', 'kamin-yolka-kantri')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Камин', 'Ёлка 1.5 м', 'Реквизит'],
    },
    {
      slug: 'kamin-yolka-lyuks', title: 'Камин + ёлка люкс',
      description: 'Премиум-комплект: декоративный камин, ёлка 2 м премиум, шале-декор, золотая драпировка. Статусное новогоднее решение для ресторана.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 23140, sizeW: 3, sizeH: 2.5, hit: false, badge: null, sortOrder: 43,
      images: [IMGD('novogodnie-dop', 'kamin-yolka-lyuks')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Камин', 'Ёлка 2 м премиум'],
    },
    {
      slug: 'ng2027-arka', title: 'НГ 2027 арка',
      description: 'Новогодняя арка 2027 с камином, ёлкой 2 м, 50 шаров и надписью «2027». Эффектное решение для корпоратива в новом году.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 24570, sizeW: 3.5, sizeH: 2.6, hit: false, badge: null, sortOrder: 44,
      images: [IMGD('dop2', 'ng2027-arka-1'), IMGD('dop2', 'ng2027-arka-2')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Камин', 'Ёлка 2 м премиум', 'Надпись «2027»'],
    },
    {
      slug: 'ng2027-gollivud', title: 'НГ 2027 Голливуд',
      description: 'Голливудский новогодний корпоратив: арка 2027, камин, 100 шаров органика, неоновая надпись и 5 больших звёзд. Премиум-решение для статусной компании.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 31100, sizeW: 4, sizeH: 2.6, hit: false, badge: null, sortOrder: 45,
      images: [IMGD('dop2', 'ng2027-gollivud-1'), IMGD('dop2', 'ng2027-gollivud-2')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 6 часов', 'Камин', '100 шаров органика', 'Неоновая надпись', '5 больших звёзд'],
    },

    // ===== TPL-13 Хвойная арка (sortOrder 46-48) =====
    {
      slug: 'ng-arka-elve', title: 'НГ арка (ель)',
      description: 'Новогодняя арка с елью, надписью, 30 шаров и звёздной гирляндой. Свежее хвойное решение для декабря.',
      category: 'THEME', occasions: ['NEW_YEAR'],
      basePrice: 13680, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 46,
      images: [IMGD('novogodnie', 'novyj-god-arhka-elve')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'ng-arka-zvezdy', title: 'НГ арка (звёзды)',
      description: 'Новогодняя арка с гирляндой звёзд, надписью, 30 шаров и звёздной подсветкой. Эффектное решение для корпоратива.',
      category: 'THEME', occasions: ['NEW_YEAR', 'CORPORATE'],
      basePrice: 15800, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 47,
      images: [IMGD('novogodnie', 'novyj-god-arhka-zvezdy')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Гирлянда звёзды', 'Гирлянда «Звёздное небо»'],
    },
    {
      slug: 'rustik-arka-elve', title: 'Рустик-арка (ель)',
      description: 'Рустикальная арка из дерева с елью, полевыми цветами, драпировкой ivory, 30 шаров и реквизитом. Бохо-новогоднее решение для лофта и шале.',
      category: 'FRAME', occasions: ['NEW_YEAR', 'WEDDING'],
      basePrice: 17940, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 48,
      images: [IMGD('dop2', 'rustik-arhka-elvye')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Полевые цветы', 'Реквизит'],
    },

    // ===== TPL-14 Тематическая (sortOrder 49-52) =====
    {
      slug: 'vesna-8-marta', title: 'Весна — 8 марта',
      description: 'Нежная фотозона к 8 марта: тюльпаны, эвкалипт, розовая драпировка и подсветка. Праздничный весенний оффер для корпоративов и девичников.',
      category: 'THEME', occasions: ['MARCH_8', 'CORPORATE'],
      basePrice: 25590, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 49,
      images: [IMG('8-marta')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Тюльпаны', 'Эвкалипт'],
    },
    {
      slug: 'muzhskaya-23-fevralya', title: 'Мужской характер — 23 февраля',
      description: 'Фотозона к 23 февраля в хаки-золотой гамме: 5 больших звёзд, декор и надпись «23 февраля». Для корпоративных поздравлений и школьных праздников.',
      category: 'THEME', occasions: ['FEB_23', 'CORPORATE'],
      basePrice: 23860, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 50,
      images: [IMG('23-fevralya')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', '5 больших звёзд'],
    },
    {
      slug: 'skan-pryanichnye-domiki', title: 'Скандинавские пряничные домики',
      description: 'Тематическая новогодняя фотозона в скандинавском стиле: паллеты, пряничные домики, ёлка 1.5 м, надпись и 30 шаров. Уютное hygge-решение.',
      category: 'THEME', occasions: ['NEW_YEAR', 'BIRTHDAY'],
      basePrice: 18250, sizeW: 2.5, sizeH: 2.4, hit: false, badge: null, sortOrder: 51,
      images: [IMGD('novogodnie-dop', 'skan-pryanichnye-domiki')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Пряничные домики', 'Ёлка 1.5 м'],
    },
    {
      slug: 'skazochnyj-zamok', title: 'Сказочный замок',
      description: 'Тематическая детская фотозона с замком, пряничными домиками, новогодней аркой и звёздной гирляндой. Сказочное решение для детского праздника.',
      category: 'THEME', occasions: ['BIRTHDAY', 'NEW_YEAR'],
      basePrice: 16310, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 52,
      images: [IMGD('novogodnie-dop', 'skazochnyj-zamok')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 5 часов', 'Сказочный замок', 'Гирлянда «Звёздное небо»'],
    },

    // ===== TPL-15 Выпускная (sortOrder 53) =====
    {
      slug: 'vypusknoj-zvezdy', title: 'Выпускной — звёзды',
      description: 'Праздничная фотозона для выпускных 9 и 11 классов, детсада: 5 больших звёзд, шары в цветах школы, цифры года выпуска. Эффектное завершение учебного года.',
      category: 'THEME', occasions: ['GRADUATION'],
      basePrice: 24370, sizeW: 3, sizeH: 2.4, hit: false, badge: null, sortOrder: 53,
      images: [IMG('vypusknoj')],
      includes: ['Доставка', 'Монтаж', 'Демонтаж', 'Аренда до 4 часов', 'Цифры года', '5 больших звёзд'],
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
      await db.photoZone.update({ where: { slug: z.slug }, data });
    } else {
      await db.photoZone.create({ data: { ...data, slug: z.slug } });
    }
  }

  // ===== 82 глобальных элемента (калькулятор) =====
  // Источник: agent-ctx/ELEMENTS-FINAL.md
  const elements = [
    // Базовые конструкции и основы (10)
    { name: 'Мольберт-классика (1.6×1.2 м)', price: 1581, category: 'decor' },
    { name: 'Мольберт-премиум (1.8×1.4 м)', price: 2200, category: 'decor' },
    { name: 'Металлическая арка (3×2.4 м)', price: 4300, category: 'decor' },
    { name: 'Деревянная арка рустик (3×2.4 м)', price: 3800, category: 'decor' },
    { name: 'Каркасная основа M (3×2.4 м)', price: 12900, category: 'decor' },
    { name: 'Каркасная основа L (4×2.6 м)', price: 17900, category: 'decor' },
    { name: 'Каркас пресс-волл (4×2.4 м)', price: 15900, category: 'decor' },
    { name: 'Лёгкая стена-драпировка (3×2.4 м)', price: 8000, category: 'decor' },
    { name: 'Премиум-стена (4×2.6 м)', price: 12500, category: 'decor' },
    { name: 'Стена из паллет (2.5×2.4 м)', price: 4500, category: 'decor' },
    // Буквы и цифры (8)
    { name: 'Световые буквы LOVE', price: 3900, category: 'letter' },
    { name: 'Буквы имени (до 6 символов)', price: 2900, category: 'letter' },
    { name: 'Цифры года (комплект)', price: 1900, category: 'letter' },
    { name: 'Цифры возраста (комплект)', price: 1900, category: 'letter' },
    { name: 'Неоновая надпись Happy Birthday', price: 3500, category: 'letter' },
    { name: 'Неоновое имя (кастом)', price: 4200, category: 'letter' },
    { name: 'Лайтбокс «Happy Birthday»', price: 2800, category: 'letter' },
    { name: 'Надпись «Юбилей»', price: 1500, category: 'letter' },
    // Шары (8)
    { name: '30 шаров пастель', price: 3600, category: 'decor' },
    { name: '30 шаров бордо', price: 3600, category: 'decor' },
    { name: '30 шаров изумруд', price: 3800, category: 'decor' },
    { name: '30 шаров чёрно-золото', price: 4200, category: 'decor' },
    { name: '30 шаров сине-золото', price: 4200, category: 'decor' },
    { name: '50 шаров пастель', price: 5800, category: 'decor' },
    { name: '50 шаров люкс (фольга+латекс)', price: 7200, category: 'decor' },
    { name: '100 шаров органика', price: 11500, category: 'decor' },
    // Флористика (10)
    { name: 'Флористика арка (изолон)', price: 4600, category: 'decor' },
    { name: 'Флористика арка живая', price: 8500, category: 'decor' },
    { name: 'Белые розы (стена)', price: 7800, category: 'decor' },
    { name: 'Пионы (композиция)', price: 5200, category: 'decor' },
    { name: 'Тюльпаны (композиция)', price: 3500, category: 'decor' },
    { name: 'Эвкалипт (зелень)', price: 2200, category: 'decor' },
    { name: 'Полевые цветы', price: 2800, category: 'decor' },
    { name: 'Пионы + тюльпаны', price: 6800, category: 'decor' },
    { name: 'Розы бордо', price: 4500, category: 'decor' },
    { name: 'Флористика + шары для единорога', price: 3200, category: 'decor' },
    // Пресс-волл и бренд (6)
    { name: 'Пресс-волл баннер с лого', price: 4500, category: 'decor' },
    { name: 'Пресс-волл баннер премиум (4×2.6 м)', price: 6500, category: 'decor' },
    { name: 'Геометрические панели', price: 5800, category: 'decor' },
    { name: 'Живая зелень для пресс-волл', price: 7800, category: 'decor' },
    { name: 'Подсветка брендовая', price: 2200, category: 'lighting' },
    { name: 'Печать логотипа (доп.)', price: 1500, category: 'service' },
    // Текстиль и драпировка (8)
    { name: 'Драпировка «Шампань»', price: 4800, category: 'decor' },
    { name: 'Драпировка ivory', price: 4500, category: 'decor' },
    { name: 'Драпировка розовая', price: 4500, category: 'decor' },
    { name: 'Драпировка бордо', price: 4500, category: 'decor' },
    { name: 'Драпировка золото', price: 5200, category: 'decor' },
    { name: 'Пайетки золото (стена)', price: 8500, category: 'decor' },
    { name: 'Драпировка розово-золотая', price: 5500, category: 'decor' },
    { name: 'Драпировка сине-золотая', price: 5500, category: 'decor' },
    // Свет и неон (5)
    { name: 'LED-подсветка', price: 1500, category: 'lighting' },
    { name: 'Гирлянда «Звёздное небо»', price: 1500, category: 'lighting' },
    { name: 'Неоновые трубки', price: 2800, category: 'lighting' },
    { name: 'Неоновая надпись кастом', price: 4500, category: 'letter' },
    { name: 'Неон розовый', price: 2200, category: 'lighting' },
    // Тематический декор (10)
    { name: 'Декор единорог (фигура)', price: 3800, category: 'prop' },
    { name: 'Облака (3 шт)', price: 1800, category: 'prop' },
    { name: 'Золотые звёзды на гирлянде', price: 2400, category: 'decor' },
    { name: '5 больших звёзд', price: 3500, category: 'decor' },
    { name: 'Мишура (стена)', price: 4200, category: 'decor' },
    { name: 'Ёлка 1.5 м', price: 3500, category: 'decor' },
    { name: 'Ёлка 2 м премиум', price: 5800, category: 'decor' },
    { name: 'Камин декоративный', price: 4500, category: 'decor' },
    { name: 'Пряничные домики', price: 2800, category: 'prop' },
    { name: 'Сказочный замок', price: 5200, category: 'prop' },
    // Ретро / реквизит (4)
    { name: 'Виниловые пластинки (5 шт)', price: 1200, category: 'prop' },
    { name: 'Силуэт ретро-авто', price: 1800, category: 'prop' },
    { name: 'Горошек декор', price: 900, category: 'prop' },
    { name: 'Реквизит для фотосессии', price: 900, category: 'prop' },
    // Новогодние доп. элементы (6)
    { name: 'Новогодняя витрина (с окном)', price: 4800, category: 'decor' },
    { name: 'Белые перья с золотом', price: 4200, category: 'decor' },
    { name: 'Хрустальная ёлка', price: 6800, category: 'decor' },
    { name: 'Фиолетовая ёлка', price: 5500, category: 'decor' },
    { name: 'Новогоднее шале', price: 5200, category: 'decor' },
    { name: 'Новогодняя арка', price: 4500, category: 'decor' },
    // ДР-дополнения (3)
    { name: 'Асимметричный декор', price: 2500, category: 'decor' },
    { name: 'Букет цветов (большой)', price: 3500, category: 'decor' },
    { name: 'Пайетки-фон (для ДР)', price: 6500, category: 'decor' },
    // Сезонные (3)
    { name: 'Хаки-золотой декор (23.02)', price: 3500, category: 'decor' },
    { name: 'Пионы (8 марта)', price: 5500, category: 'decor' },
    { name: 'Тюльпаны (8 марта)', price: 3500, category: 'decor' },
    // Услуги (1) — доставка
    { name: 'Доставка по Красноярску', price: 2000, category: 'service' },
  ];

  // Сначала удалим старые элементы (на случай повторного seed)
  await db.element.deleteMany({});
  for (const e of elements) {
    await db.element.create({ data: { name: e.name, price: e.price, category: e.category } as any });
  }

  // ===== 10 привязанных опций (старый набор) =====
  const photozoneBoundElements = [
    { slug: 'love-installyaciya', name: 'Световые буквы LOVE (доп.)', price: 3900 },
    { slug: 'bukvy-i-cifry', name: 'Буквы имени (доп. комплект)', price: 2900 },
    { slug: 'bukvy-i-cifry', name: 'Цифры года (доп. комплект)', price: 1900 },
    { slug: 'neon-party', name: 'Неоновая надпись (доп.)', price: 3500 },
    { slug: 'shary-arka', name: 'Композиция из шаров (50 шт доп.)', price: 2500 },
    { slug: 'tekstil-shampan', name: 'Гирлянда «Звёздное небо» (доп.)', price: 1500 },
    { slug: 'press-wall-premium', name: 'Пресс-волл баннер с логотипом (доп.)', price: 4500 },
    { slug: 'svadebnaya-flora', name: 'Флористика (доп. композиция)', price: 3200 },
    { slug: 'stilyagi', name: 'Реквизит для фотосессии (доп.)', price: 900 },
    { slug: 'love-installyaciya', name: 'Доп. час аренды', price: 800 },
  ];
  for (const e of photozoneBoundElements) {
    const pz = await db.photoZone.findUnique({ where: { slug: e.slug } });
    if (pz) {
      await db.element.create({
        data: { name: e.name, price: e.price, photozoneId: pz.id, category: 'decor' } as any,
      });
    }
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
    { name: 'Мария', phone: '+7 (923) 338-11-50', eventDate: d(2), occasion: 'BIRTHDAY', source: '/kalkulyator', sourcePage: '/kalkulyator', status: 'NEW', comment: 'Расчёт из калькулятора.', config: { occasion: 'BIRTHDAY', style: 'neon', base: 'frame-m', extras: ['neon'], date: d(2), address: 'Красноярск, Свободный пр.', surcharge: 0 }, priceEstimate: 27020 },
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
          note: 'Из заявки',
        } as any,
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

  console.log(`Seed complete. ${zones.length} photozones, ${elements.length + photozoneBoundElements.length} elements.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
