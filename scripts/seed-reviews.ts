import { db } from '../src/lib/db';

async function main() {
  const zones = await db.photoZone.findMany({ select: { id: true, slug: true, title: true, images: true } });
  const zoneMap = new Map(zones.map(z => [z.slug, z]));

  // Привязываем существующие отзывы
  const existingBindings = [
    { author: "Екатерина С.", slug: "love-installyaciya" },
    { author: "Дмитрий и Ольга", slug: "svadebnaya-flora" },
    { author: "Марина К.", slug: "stilyagi" },
    { author: "ООО «Сибирь-Трейд»", slug: "korporativ-brand" },
    { author: "Анна П.", slug: "edonorog" },
    { author: "Школа №47", slug: "vypusknoj-zvezdy" },
    { author: "Сергей В.", slug: "muzhskaya-23-fevralya" },
    { author: "Юлия Р.", slug: "vesna-8-marta" },
    { author: "Игорь М.", slug: "neon-party" },
    { author: "Наталья Б.", slug: "tekstil-shampan" },
  ];
  for (const b of existingBindings) {
    const z = zoneMap.get(b.slug);
    if (z) await db.review.updateMany({ where: { author: b.author }, data: { photozoneId: z.id } });
  }
  console.log('✓ привязано существующих:', existingBindings.length);

  const newReviews = [
    { slug: "love-installyaciya", author: "Алина и Роман", event: "Свадьба", rating: 5, text: "Заказывали LOVE-инсталляцию на свадьбу в ресторан «Гранд». Гости в восторге, фото получились шикарными! Монтаж за час, всё аккуратно. Красноярск, спасибо!" },
    { slug: "love-installyaciya", author: "Виктория Л.", event: "Свадьба", rating: 5, text: "Светящиеся буквы LOVE — это вау! Менеджер перезвонил через 10 минут, подтвердил дату. Привезли вовремя в Советский район." },
    { slug: "love-installyaciya", author: "Семья Морозовых", event: "Корпоратив", rating: 5, text: "Брали LOVE на корпоратив мужа. Смотрелось дорого, все фотографировались. Демонтаж после — без проблем." },
    { slug: "love-installyaciya", author: "Ольга и Кирилл", event: "Свадьба", rating: 5, text: "Идеальная фотозона для свадьбы! Буквы светятся мягко, не режут глаз на фото. Цена адекватная, доставка включена." },
    { slug: "love-installyaciya", author: "Денис К.", event: "День рождения", rating: 4, text: "Заказывал на юбилей жены. Понравилось, но хотелось бы больше цветов в комплекте. В целом — отлично." },
    { slug: "love-installyaciya", author: "Маргарита", event: "Свадьба", rating: 5, text: "LOVE-инсталляция — классика, которая всегда работает. Поставили в Центральном районе, монтаж быстрый. Спасибо!" },
    { slug: "svadebnaya-flora", author: "Анжелика и Павел", event: "Свадьба", rating: 5, text: "Арка из роз — просто мечта! Живые цветы, смотрелось роскошно. Фотографии как из журнала. Красноярск, вы лучшие!" },
    { slug: "svadebnaya-flora", author: "Кристина М.", event: "Свадьба", rating: 5, text: "Заказывали флору на выездную регистрацию. Менеджер всё подсказал, привезли вовремя. Гости ахнули!" },
    { slug: "svadebnaya-flora", author: "Ирина В.", event: "Свадьба", rating: 5, text: "Свадебная флора превзошла ожидания. Розы свежие, эвкалипт ароматный. Монтаж аккуратный, без следов." },
    { slug: "svadebnaya-flora", author: "Алексей и София", event: "Свадьба", rating: 5, text: "Арка шикарная, но доставка в пригород Подгорный обошлась +1500. Оно того стоило — фото невероятные!" },
    { slug: "edonorog", author: "Мама Миши", event: "Детский праздник", rating: 5, text: "Единорог на 6 лет сыну — восторг! Дети фотографировались весь вечер. Пастельные шары, облака — сказка!" },
    { slug: "edonorog", author: "Елена З.", event: "Детский праздник", rating: 5, text: "Дочка была в восторге от единорога! Доставили в Октябрьский район без проблем. Монтаж за 40 минут." },
    { slug: "edonorog", author: "Светлана Р.", event: "Детский праздник", rating: 5, text: "Заказывала на день рождения близняшек. Ярко, весело, качественно. Дети до сих пор вспоминают!" },
    { slug: "edonorog", author: "Оксана Д.", event: "Детский праздник", rating: 4, text: "Единорог классный, но шары немного сдулись к концу вечера. В целом — довольны, рекомендую." },
    { slug: "edonorog", author: "Наталья Щ.", event: "Детский праздник", rating: 5, text: "Лучший день рождения! Фотозона единорог — мечта девочки. Спасибо команде за оперативность." },
    { slug: "shary-arka", author: "Юлия С.", event: "День рождения", rating: 5, text: "Арка из шаров на юбилей — роскошно! Золотые и белые шары смотрелись дорого. Монтаж быстрый." },
    { slug: "shary-arka", author: "Михаил Т.", event: "Свадьба", rating: 5, text: "Заказывали арку на свадьбу. Идеально вписалась в зал ресторана. Гости фотографировались не переставая." },
    { slug: "shary-arka", author: "Виктория", event: "Детский праздник", rating: 5, text: "Арка из шаров на день рождения дочки — ярко и празднично! Дети в восторге. Спасибо!" },
    { slug: "shary-arka", author: "ООО «Трейд»", event: "Корпоратив", rating: 5, text: "Брали арку на корпоратив. Смотрелось эффектно, фото получились отличные. Рекомендую!" },
    { slug: "shary-arka", author: "Анна К.", event: "Выпускной", rating: 4, text: "Арка на выпускной 11 класса. Красиво, но хотелось бы больше цветов в палитре школы. В целом — отлично." },
    { slug: "novogodnyaya-mishura", author: "ООО «Енисей»", event: "Корпоратив", rating: 5, text: "Новогодняя мишура на корпоратив — огонь! 120 сотрудников, все сфоткались. Перезвонили быстро, доставили вовремя." },
    { slug: "novogodnyaya-mishura", author: "Ирина Б.", event: "Корпоратив", rating: 5, text: "Заказывали на корпоратив в декабре. Мишура плотная, смотрится дорого. Монтаж за час, демонтаж после." },
    { slug: "novogodnyaya-mishura", author: "Семья Волковых", event: "Новый год", rating: 5, text: "Новогодняя фотозона домой на утренник — дети в восторге! Шары, мишура — настоящий праздник." },
    { slug: "novogodnyaya-mishura", author: "Дмитрий П.", event: "Корпоратив", rating: 5, text: "Брали на корпоратив 80 человек. Брендировали логотипом — смотрелось профессионально. Рекомендую!" },
    { slug: "novogodnyaya-mishura", author: "Марина", event: "Новый год", rating: 4, text: "Новогодняя фотозона на семейный праздник. Красиво, но мишура немного осыпалась. В целом — довольны." },
    { slug: "novogodnyaya-mishura", author: "Алексей Ф.", event: "Корпоратив", rating: 5, text: "Корпоратив на 50 человек — мишура идеально. Доставка в Свердловский район включена, монтаж быстрый." },
    { slug: "stilyagi", author: "Олег Р.", event: "День рождения", rating: 5, text: "Стиляги на 50-летие — ретро-вайб! Винил, неон, горошек. Гости в восторге. Красноярск, рекомендую!" },
    { slug: "stilyagi", author: "Татьяна И.", event: "Корпоратив", rating: 5, text: "Тематический корпоратив в стиле 50-х. Фотозона стиляги — идеальное решение. Реквизит в комплекте!" },
    { slug: "stilyagi", author: "Вика С.", event: "День рождения", rating: 4, text: "Стиляги на день рождения — ярко и весело. Хотелось бы больше реквизита, но в целом отлично." },
    { slug: "neon-party", author: "Артём Л.", event: "День рождения", rating: 5, text: "Neon Party на 30-летие — это огонь! Неоновые надписи, тёмный фон. Фото как из клуба. Обалденно!" },
    { slug: "neon-party", author: "Кристина", event: "День рождения", rating: 5, text: "Заказывали неон на день рождения. Смотрелось эффектно, особенно при приглушённом свете. Рекомендую!" },
    { slug: "neon-party", author: "Дмитрий", event: "Корпоратив", rating: 5, text: "Корпоратив с неоновой фотозоной — современно и стильно. Молодёжная команда в восторге." },
    { slug: "neon-party", author: "София М.", event: "День рождения", rating: 4, text: "Неон на 25-летие. Круто, но хотелось бы больше цвета в подсветке. В целом — довольна." },
    { slug: "bukvy-i-cifry", author: "Семья Петровых", event: "День рождения", rating: 5, text: "Буквы имени и цифры возраста на день рождения — идеально! Светятся мягко, смотрятся стильно." },
    { slug: "bukvy-i-cifry", author: "Игорь Н.", event: "Свадьба", rating: 5, text: "Буквы LOVE + цифры даты на свадьбу. Универсально и красиво. Доставка включена, монтаж быстрый." },
    { slug: "bukvy-i-cifry", author: "Школа №12", event: "Выпускной", rating: 5, text: "Цифры года выпуска на выпускной. Смотрелось торжественно. Дети довольны, фото отличные!" },
    { slug: "bukvy-i-cifry", author: "Лариса В.", event: "День рождения", rating: 4, text: "Буквы на юбилей. Хорошо, но не хватало подставки для устойчивости на улице. В целом — ок." },
    { slug: "press-wall-premium", author: "ООО «Сибстрой»", event: "Корпоратив", rating: 5, text: "Пресс-волл с логотипом на конференцию — статусно! Печать качественная, монтаж аккуратный. Рекомендую!" },
    { slug: "press-wall-premium", author: "Event-агентство", event: "Корпоратив", rating: 5, text: "Брали пресс-волл на премьеру. Зелёная стена с флористикой — выглядит дорого. Клиенты довольны." },
    { slug: "press-wall-premium", author: "Анна К.", event: "Свадьба", rating: 5, text: "Пресс-волл на свадьбу — современное решение. Премиально, фото получились шикарными." },
    { slug: "korporativ-brand", author: "ПАО «Красноярскэнерго»", event: "Корпоратив", rating: 5, text: "Брендированная фотозона на юбилей компании. Логотип чёткий, панели стильные. 200 сотрудников — все довольны!" },
    { slug: "korporativ-brand", author: "IT-команда", event: "Корпоратив", rating: 5, text: "Корпоратив с брендом — геометрия и подсветка в цветах компании. Современно и профессионально." },
    { slug: "tekstil-shampan", author: "Виктория и Антон", event: "Свадьба", rating: 5, text: "Текстильная фотозона «Шампань» на свадьбу — лаконично и элегантно. Подсветка мягкая, подходит под любой зал." },
    { slug: "tekstil-shampan", author: "Мария Л.", event: "День рождения", rating: 5, text: "Заказывала на юбилей. Текстиль смотрится дорого, драпировка аккуратная. Рекомендую!" },
    { slug: "tekstil-shampan", author: "Ольга Р.", event: "Корпоратив", rating: 4, text: "Текстиль на корпоратив — универсально. Хорошо, но хотелось бы больше декоративных элементов." },
    { slug: "rustic-garden", author: "Екатерина и Игорь", event: "Свадьба", rating: 5, text: "Rustic-фотозона на свадьбу на природе — идеально! Дерево, полевые цветы, гирлянда. Атмосферно!" },
    { slug: "rustic-garden", author: "Дарья В.", event: "День рождения", rating: 5, text: "Бохо-фотозона на день рождения в лофте. Стильно, необычно. Фото получились душевными." },
    { slug: "rustic-garden", author: "Семья Соколовых", event: "Свадьба", rating: 5, text: "Рустик на свадьбу — мечта! Паллеты, цветы, фонарики. Доставили на площадку, монтаж быстрый." },
    { slug: "vesna-8-marta", author: "Коллектив магазина", event: "8 марта", rating: 5, text: "Весенняя фотозона в офис на 8 марта. Цветы свежие, шары нежные. Женщины в восторге!" },
    { slug: "muzhskaya-23-fevralya", author: "Воинская часть", event: "23 февраля", rating: 5, text: "Мужская фотозона на 23 февраля. Хаки-золото, строго и стильно. Подошло для торжественного мероприятия." },
    { slug: "vypusknoj-zvezdy", author: "Детсад №15", event: "Выпускной", rating: 5, text: "Фотозона на выпускной в детсаду. Звёзды, шары, цифры года. Дети счастливые, родители довольны!" },
    { slug: "vypusknoj-zvezdy", author: "Школа №33", event: "Выпускной", rating: 4, text: "Выпускной 9 класс. Фотозона звёзды — празднично. Хотелось бы больше персонализации, но в целом ок." },
  ];

  let created = 0;
  let i = 0;
  for (const r of newReviews) {
    const z = zoneMap.get(r.slug);
    if (!z) continue;
    const imgs = Array.isArray(z.images) ? z.images as string[] : [];
    // каждый 2-й — с фото, каждый 5-й — с видео
    const withPhotos = i % 2 === 0 && imgs.length > 0;
    const withVideo = i % 5 === 0;
    const photos = withPhotos ? imgs.slice(0, Math.random() < 0.5 ? 1 : 2) : null;
    const videos = withVideo ? [`/videos/photozones/${r.slug}.mp4`] : null;
    await db.review.create({
      data: { author: r.author, event: r.event, text: r.text, rating: r.rating, photos, videos, photozoneId: z.id, isPublished: true },
    });
    created++; i++;
  }
  console.log('✓ создано новых:', created);

  // Итог
  console.log('\n=== распределение по фотозонам ===');
  const distribution = {
    "love-installyaciya": 7, "svadebnaya-flora": 5, "edonorog": 6, "shary-arka": 5,
    "novogodnyaya-mishura": 6, "stilyagi": 4, "neon-party": 5, "bukvy-i-cifry": 4,
    "press-wall-premium": 3, "korporativ-brand": 3, "tekstil-shampan": 4, "rustic-garden": 3,
    "vesna-8-marta": 2, "muzhskaya-23-fevralya": 2, "vypusknoj-zvezdy": 3,
  };
  for (const [slug, target] of Object.entries(distribution)) {
    const z = zoneMap.get(slug);
    if (z) {
      const c = await db.review.count({ where: { photozoneId: z.id, isPublished: true } });
      console.log(`  ${slug.padEnd(28)} ${c}/${target}`);
    }
  }
  await db.$disconnect();
}
main();
