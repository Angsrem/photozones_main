/**
 * Regen remaining images: novogodnie-dop + yubilei + 6 NEW
 * Run: bun run scripts/regen-images-remaining.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'public/images/photozones');
const PROGRESS = path.join(process.cwd(), 'agent-ctx/regen-progress-v2.json');

type Job = { slug: string; outPath: string; prompt: string; size: string };
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const jobs: Job[] = [
  // === novogodnie-dop/ (8) ===
  { slug: 'novogodnie-dop/fioletovo-zolotaya-yolka', outPath: path.join(ROOT, 'novogodnie-dop/fioletovo-zolotaya-yolka.png'),
    prompt: 'New Year photo zone with purple and gold christmas tree, luxurious festive decoration, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/kamin-yolka-lyuks', outPath: path.join(ROOT, 'novogodnie-dop/kamin-yolka-lyuks.png'),
    prompt: 'Luxury New Year photo zone with decorative fireplace and elegant christmas tree, golden ornaments, premium festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/khrustalnaya-yolka', outPath: path.join(ROOT, 'novogodnie-dop/khrustalnaya-yolka.png'),
    prompt: 'New Year photo zone with crystal christmas tree, transparent glass ornaments, elegant crystal decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/skan-pryanichnye-domiki', outPath: path.join(ROOT, 'novogodnie-dop/skan-pryanichnye-domiki.png'),
    prompt: 'New Year photo zone with scandinavian gingerbread houses, cozy festive decoration, warm lights, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/skazochnyj-zamok', outPath: path.join(ROOT, 'novogodnie-dop/skazochnyj-zamok.png'),
    prompt: 'New Year photo zone with fairy tale castle decoration, magical festive backdrop, golden ornaments, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/snezhnaya-yolka-fiolet', outPath: path.join(ROOT, 'novogodnie-dop/snezhnaya-yolka-fiolet.png'),
    prompt: 'New Year photo zone with snowy purple christmas tree, frosted decoration, elegant festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/zimnyaya-skazka-yolka', outPath: path.join(ROOT, 'novogodnie-dop/zimnyaya-skazka-yolka.png'),
    prompt: 'New Year photo zone with winter wonderland theme, magical christmas tree, snowy decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie-dop/zoloto-barkhat', outPath: path.join(ROOT, 'novogodnie-dop/zoloto-barkhat.png'),
    prompt: 'New Year photo zone with gold and velvet luxury theme, rich fabric drape, golden ornaments, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === yubilei/ (4; skip den-rozhdeniya-molebert-shary which is dup of dop/) ===
  { slug: 'yubilei/yubilej-klassika-molebert', outPath: path.join(ROOT, 'yubilei/yubilej-klassika-molebert.png'),
    prompt: 'Classic anniversary photo zone with wooden easel stand, elegant golden numbers, balloon composition, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'yubilei/yubilej-molebert-shary', outPath: path.join(ROOT, 'yubilei/yubilej-molebert-shary.png'),
    prompt: 'Anniversary photo zone with wooden easel and balloon composition in gold and white, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'yubilei/yubilej-rozovo-zolotoj', outPath: path.join(ROOT, 'yubilei/yubilej-rozovo-zolotoj.png'),
    prompt: 'Anniversary photo zone with pink and gold theme, rose gold balloons, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'yubilei/yubilej-zvezdy-shary', outPath: path.join(ROOT, 'yubilei/yubilej-zvezdy-shary.png'),
    prompt: 'Anniversary photo zone with golden stars and balloon composition, elegant festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === 6 NEW photozones (TPL-06 paillettes + TPL-08 flower wall) ===
  { slug: 'paillettes-gold', outPath: path.join(ROOT, 'paillettes-gold.png'),
    prompt: 'Luxury sequin wall photo zone with shimmering gold paillettes, 2.4m tall, elegant backdrop with glowing light effect, premium event decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'paillettes-silver', outPath: path.join(ROOT, 'paillettes-silver.png'),
    prompt: 'Luxury sequin wall photo zone with shimmering silver paillettes, 2.4m tall, elegant backdrop with cool light effect, premium event decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'paillettes-black-gold', outPath: path.join(ROOT, 'paillettes-black-gold.png'),
    prompt: 'Luxury sequin wall photo zone with black and gold paillettes mix, dramatic premium backdrop, 2.4m tall, elegant event decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'flower-wall-white-roses', outPath: path.join(ROOT, 'flower-wall-white-roses.png'),
    prompt: 'Flower wall photo zone with lush white roses 2.5m square, elegant floral backdrop, greenery accents, luxury wedding decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'flower-wall-peon-pink', outPath: path.join(ROOT, 'flower-wall-peon-pink.png'),
    prompt: 'Flower wall photo zone with pink peonies 2.5m square, lush floral backdrop, greenery accents, luxury decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'flower-wall-red-roses', outPath: path.join(ROOT, 'flower-wall-red-roses.png'),
    prompt: 'Flower wall photo zone with deep red roses 2.5m square, luxurious floral backdrop, romantic elegant decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
];

type Progress = Record<string, { done: boolean; size: number; ts: string; error?: string }>;
function loadProgress(): Progress {
  if (fs.existsSync(PROGRESS)) {
    try { return JSON.parse(fs.readFileSync(PROGRESS, 'utf8')); } catch { return {}; }
  }
  return {};
}
function saveProgress(p: Progress) {
  fs.mkdirSync(path.dirname(PROGRESS), { recursive: true });
  fs.writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

async function genOne(zai: any, job: Job, progress: Progress): Promise<boolean> {
  if (progress[job.slug]?.done && fs.existsSync(job.outPath)) {
    console.log(`SKIP: ${job.slug}`);
    return true;
  }
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const t0 = Date.now();
    try {
      const res = await zai.images.generations.create({ prompt: job.prompt, size: job.size as any });
      const buf = Buffer.from(res.data[0].base64, 'base64');
      fs.mkdirSync(path.dirname(job.outPath), { recursive: true });
      fs.writeFileSync(job.outPath, buf);
      progress[job.slug] = { done: true, size: buf.length, ts: new Date().toISOString() };
      saveProgress(progress);
      const jpg = job.outPath.replace(/\.png$/, '.jpg');
      if (fs.existsSync(jpg)) { try { fs.unlinkSync(jpg); } catch { /* ignore */ } }
      console.log(`OK ${job.slug} (${Math.round((Date.now() - t0) / 1000)}s, ${Math.round(buf.length / 1024)}KB)`);
      return true;
    } catch (e: any) {
      const msg = String(e?.message || e);
      console.error(`FAIL ${job.slug} attempt ${attempt}/${maxRetries}: ${msg.slice(0, 100)}`);
      if (msg.includes('429') || msg.includes('Too many') || msg.includes('502') || msg.includes('Bad Gateway')) {
        const wait = 15000 * attempt;
        console.log(`  waiting ${wait}ms...`);
        await sleep(wait);
      } else if (attempt < maxRetries) {
        await sleep(3000);
      } else {
        progress[job.slug] = { done: false, size: 0, ts: new Date().toISOString(), error: msg.slice(0, 200) };
        saveProgress(progress);
        return false;
      }
    }
  }
  return false;
}

async function main() {
  console.log(`Regen-Remaining: ${jobs.length} jobs`);
  const zai = await ZAI.create();
  const progress = loadProgress();
  let okCount = 0;
  let failCount = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`[${i + 1}/${jobs.length}] ${job.slug}`);
    const ok = await genOne(zai, job, progress);
    if (ok) okCount++; else failCount++;
    await sleep(2500);
  }
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${jobs.length}, OK: ${okCount}, Failed: ${failCount}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
