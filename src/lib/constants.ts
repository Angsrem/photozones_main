// Конфигурация компании — единый источник правды для контактов и SEO
export const SITE = {
  name: 'Fotoarka',
  legalName: 'Fotoarka — аренда фотозон в Красноярске',
  phone: '+7 (960) 752-17-77',
  phoneRaw: '+79607521777',
  whatsapp: '79607521777',
  telegram: 'fotoarka_krsk',
  email: 'order@fotoarka.ru',
  city: 'Красноярск',
  address: 'г. Красноярск, ул. Парижской Коммуны, 33',
  geo: { lat: 56.0087, lng: 92.8704 },
  hours: 'Ежедневно 9:00–21:00',
  url: 'https://fotoarka.ru',
  districts: [
    'Центральный', 'Советский', 'Свердловский', 'Октябрьский',
    'Железнодорожный', 'Ленинский', 'Кировский', 'Свердловский',
  ],
  suburbs: ['Солнечный', 'Подгорный', 'Емельяново', 'Бердск', 'Манский'],
  // надбавка за пригород, руб
  suburbSurcharge: 1500,
  workTimeMin: 15, // перезвоним за N минут
  monthlyEvents: 30,
  mountTimeMin: 60, // монтаж за N минут
};

export const NAV_LINKS = [
  { href: '/prazdniki/novyj-god', label: 'Новогодние', highlight: true },
  { href: '/katalog', label: 'Каталог' },
  { href: '/svadby', label: 'Свадьбы' },
  { href: '/detskie-prazdniki', label: 'Детские' },
  { href: '/vypusknie', label: 'Выпускные' },
  { href: '/korporativy', label: 'Корпоративы' },
  { href: '/kalkulyator', label: 'Калькулятор' },
  { href: '/otzyvy', label: 'Отзывы' },
  { href: '/kontakty', label: 'Контакты' },
];

export const OCCASIONS = [
  { value: 'WEDDING', label: 'Свадьба' },
  { value: 'BIRTHDAY', label: 'День рождения' },
  { value: 'GRADUATION', label: 'Выпускной' },
  { value: 'CORPORATE', label: 'Корпоратив' },
  { value: 'NEW_YEAR', label: 'Новый год' },
  { value: 'MARCH_8', label: '8 марта' },
  { value: 'FEB_23', label: '23 февраля' },
] as const;

export const CATEGORIES = [
  { value: 'FRAME', label: 'Каркасная фотозона' },
  { value: 'PRESSWALL', label: 'Пресс-волл' },
  { value: 'TEXTILE', label: 'Текстильная фотозона' },
  { value: 'THEME', label: 'Тематическая фотозона' },
] as const;

export const LEAD_STATUSES = [
  { value: 'NEW', label: 'Новая', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { value: 'CALLED', label: 'Перезвонили', color: 'bg-sky-500/20 text-sky-300 border-sky-500/40' },
  { value: 'CONFIRMED', label: 'Подтверждена', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' },
  { value: 'DECLINED', label: 'Отказ', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40' },
  { value: 'DONE', label: 'Выполнена', color: 'bg-violet-500/20 text-violet-300 border-violet-500/40' },
] as const;

export const BOOKING_STATUSES = [
  { value: 'RESERVED', label: 'Забронировано' },
  { value: 'DONE', label: 'Выполнено' },
  { value: 'CANCELED', label: 'Отменено' },
] as const;
