import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const OUT = path.join(process.cwd(), 'public/images/photozones');
const HERO = path.join(process.cwd(), 'public/images');
if (!fs.existsSync(OUT)) fs.mkdirSync(OUT, { recursive: true });

type Job = { name: string; prompt: string; size: string; dir: string };

const jobs: Job[] = [
  { name: 'hero', dir: HERO, size: '1344x768', prompt: 'Luxury wedding photo zone installation with glowing LOVE letters, golden warm bokeh lights, elegant floral arch, draped white and gold fabric, festive event backdrop, professional photography, premium dark ambiance, cinematic, high quality, detailed' },
  { name: 'love', dir: OUT, size: '1024x1024', prompt: 'Elegant wedding photo zone with large glowing LOVE letters in golden light, white roses, draped chiffon fabric, fairy lights, romantic event backdrop, professional photography, premium, detailed' },
  { name: 'novyj-god', dir: OUT, size: '1024x1024', prompt: 'New Year photo zone with sparkling tinsel curtain, golden and silver baubles, glowing Christmas tree decorations, snowy festive backdrop, warm golden bokeh, professional event photography, detailed' },
  { name: 'stilyagi', dir: OUT, size: '1024x1024', prompt: 'Retro Stilyagi style photo zone, 1950s vintage, neon signs, vinyl records, colorful polka dots, retro car silhouette, vibrant turquoise and coral, fun party backdrop, professional photography, detailed' },
  { name: 'bukvy-tsifry', dir: OUT, size: '1024x1024', prompt: 'Photo zone with large luminous 3D letters and numbers in warm white, minimalist elegant backdrop, soft golden glow, event decoration, professional photography, detailed' },
  { name: 'press-wall', dir: OUT, size: '1024x1024', prompt: 'Modern press wall photo zone with branded greenery hedge wall, elegant corporate event backdrop, soft spotlight, premium flower arrangements, professional photography, detailed' },
  { name: 'svadebnaya-flora', dir: OUT, size: '1024x1024', prompt: 'Wedding floral photo zone with lush arch of white and pink roses, eucalyptus, draped ivory fabric, golden sunset light, romantic luxury backdrop, professional photography, detailed' },
  { name: 'detskaya-edinorog', dir: OUT, size: '1024x1024', prompt: 'Kids birthday photo zone with rainbow unicorn theme, pastel balloons, fluffy clouds, golden star garlands, magical dreamy backdrop, bright cheerful, professional photography, detailed' },
  { name: 'korporativ-brand', dir: OUT, size: '1024x1024', prompt: 'Corporate branded photo zone with elegant logo backdrop, modern geometric panels, blue and gold accent lighting, premium business event, clean professional, detailed' },
  { name: '8-marta', dir: OUT, size: '1024x1024', prompt: 'March 8 womens day photo zone with pink and white flowers, elegant feminine backdrop, soft pastel balloons, golden accents, spring celebration, professional photography, detailed' },
  { name: '23-fevralya', dir: OUT, size: '1024x1024', prompt: 'February 23 mens day photo zone with khaki and gold military style, elegant patriotic backdrop, medals, stars, camo and gold accents, professional event photography, detailed' },
  { name: 'vypusknoj', dir: OUT, size: '1024x1024', prompt: 'Graduation photo zone with golden stars, balloons in school colors, elegant graduation caps decor, festive backdrop, celebratory, professional photography, detailed' },
  { name: 'tekstilnaya-uzhur', dir: OUT, size: '1024x1024', prompt: 'Elegant textile photo zone with draped champagne and ivory fabric, soft pleated curtains, golden uplighting, luxury minimal event backdrop, professional photography, detailed' },
  { name: 'neon-party', dir: OUT, size: '1024x1024', prompt: 'Neon party photo zone with glowing neon signs, vibrant pink and purple LED lights, dark moody backdrop, modern club aesthetic, energetic, professional photography, detailed' },
  { name: 'rustic-garden', dir: OUT, size: '1024x1024', prompt: 'Rustic garden photo zone with wooden pallets, wild flowers, mason jars, fairy string lights, boho chic backdrop, warm natural light, professional photography, detailed' },
  { name: 'shary-arka', dir: OUT, size: '1024x1024', prompt: 'Photo zone with grand balloon arch in gold white and blush, organic balloon garland, elegant celebration backdrop, soft lighting, professional event photography, detailed' },
];

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

async function genOne(zai: any, job: Job) {
  const outPath = path.join(job.dir, `${job.name}.png`);
  // пропускаем только настоящие AI-изображения (маркер .ai)
  const marker = path.join(job.dir, `${job.name}.ai`);
  if (fs.existsSync(marker)) { console.log('skip', job.name); return; }
  for (let attempt = 1; attempt <= 4; attempt++) {
    const t0 = Date.now();
    try {
      const res = await zai.images.generations.create({ prompt: job.prompt, size: job.size as any });
      fs.writeFileSync(outPath, Buffer.from(res.data[0].base64, 'base64'));
      fs.writeFileSync(marker, new Date().toISOString());
      console.log('ok', job.name, Math.round((Date.now() - t0) / 1000) + 's');
      return;
    } catch (e: any) {
      const msg = e?.message || '';
      console.error('fail', job.name, 'attempt', attempt, msg.slice(0, 80));
      if (msg.includes('429') || msg.includes('Too many')) {
        await sleep(15000 * attempt);
      } else {
        await sleep(3000 * attempt);
      }
    }
  }
  console.error('GIVEUP', job.name);
}

async function main() {
  const zai = await ZAI.create();
  for (const job of jobs) {
    await genOne(zai, job);
    await sleep(2000);
  }
  console.log('DONE ALL');
}
main();
