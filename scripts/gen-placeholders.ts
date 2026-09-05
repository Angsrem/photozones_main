import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'public/images/photozones');
const HERO = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

const palettes: Record<string, [string, string]> = {
  hero: ['#3a2a1a', '#b8860b'],
  love: ['#2a1a2a', '#c9a36b'],
  'novyj-god': ['#10243a', '#c9a36b'],
  stilyagi: ['#22143a', '#e06b6b'],
  'bukvy-tsifry': ['#1a2230', '#c9a36b'],
  'press-wall': ['#16241c', '#c9a36b'],
  'svadebnaya-flora': ['#2a1c22', '#d8a3b6'],
  'detskaya-edinorog': ['#2a1a2a', '#e0a3d8'],
  'korporativ-brand': ['#161e2c', '#c9a36b'],
  '8-marta': ['#2a1a22', '#e0a3c0'],
  '23-fevralya': ['#1c2218', '#c9a36b'],
  vypusknoj: ['#221c2a', '#c9a36b'],
  'tekstilnaya-uzhur': ['#241c18', '#d8c098'],
  'neon-party': ['#1a0f2a', '#e06bd8'],
  'rustic-garden': ['#1c2018', '#c9a36b'],
  'shary-arka': ['#2a1c22', '#e0c0a3'],
};

const titles: Record<string, string> = {
  hero: 'ФотоЗона24 — Красноярск',
  love: 'LOVE',
  'novyj-god': 'Новый год',
  stilyagi: 'Стиляги',
  'bukvy-tsifry': 'Буквы и цифры',
  'press-wall': 'Пресс-волл',
  'svadebnaya-flora': 'Свадебная флора',
  'detskaya-edinorog': 'Единорог',
  'korporativ-brand': 'Корпоратив',
  '8-marta': '8 марта',
  '23-fevralya': '23 февраля',
  vypusknoj: 'Выпускной',
  'tekstilnaya-uzhur': 'Шампань',
  'neon-party': 'Neon Party',
  'rustic-garden': 'Rustic Garden',
  'shary-arka': 'Арка из шаров',
};

function escapeXml(s: string) {
  return s.replace(/[<>&"']/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
}

function makeSvg(title: string, w: number, h: number, c1: string, c2: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${c1}"/>
        <stop offset="100%" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="r" cx="50%" cy="40%" r="60%">
        <stop offset="0%" stop-color="${c2}" stop-opacity="0.35"/>
        <stop offset="100%" stop-color="${c1}" stop-opacity="0"/>
      </radialGradient>
    </defs>
    <rect width="${w}" height="${h}" fill="url(#g)"/>
    <rect width="${w}" height="${h}" fill="url(#r)"/>
    <text x="50%" y="50%" font-family="Georgia, serif" font-size="${Math.round(w / 12)}" fill="#fff" fill-opacity="0.95" text-anchor="middle" dominant-baseline="middle" font-weight="600">${escapeXml(title)}</text>
    <text x="50%" y="${Math.round(h * 0.62)}" font-family="Arial, sans-serif" font-size="${Math.round(w / 36)}" fill="#fff" fill-opacity="0.6" text-anchor="middle">ФотоЗона24 · Красноярск</text>
  </svg>`;
}

async function main() {
  for (const [name, [c1, c2]] of Object.entries(palettes)) {
    const dir = name === 'hero' ? HERO : OUT;
    const outPath = path.join(dir, `${name}.png`);
    // не перезаписываем «богатые» AI-изображения
    if (fs.existsSync(outPath) && fs.statSync(outPath).size > 100000) { console.log('keep', name); continue; }
    const w = name === 'hero' ? 1344 : 1024;
    const h = name === 'hero' ? 768 : 1024;
    const svg = makeSvg(titles[name] || name, w, h, c1, c2);
    await sharp(Buffer.from(svg)).png().toFile(outPath);
    console.log('placeholder', name, fs.statSync(outPath).size);
  }
  console.log('PLACEHOLDERS DONE');
}
main();
