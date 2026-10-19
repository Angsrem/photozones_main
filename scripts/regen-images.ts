/**
 * Regenerate photozone images without people.
 * Run: bun run scripts/regen-images.ts
 *
 * - For each photozone: build prompt with "NO PEOPLE" + "empty scene" + "decoration only"
 * - Save as .png (overwrite existing)
 * - Remove .jpg duplicates
 * - Incremental save with resume on 429
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'public/images/photozones');
const PROGRESS = path.join(process.cwd(), 'agent-ctx/regen-progress.json');

type Job = {
  slug: string;
  outPath: string; // .png
  prompt: string;
  size: string;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const jobs: Job[] = [
  // === 15 main ===
  { slug: 'love', outPath: path.join(ROOT, 'love.png'),
    prompt: 'Elegant wedding photo zone with large glowing LOVE letters in golden light, white roses arch, draped chiffon fabric, fairy lights, romantic luxury event backdrop, professional photography, high quality, detailed, NO PEOPLE, empty scene, decoration only, no guests, no couple',
    size: '1024x1024' },
  { slug: 'novyj-god', outPath: path.join(ROOT, 'novyj-god.png'),
    prompt: 'New Year photo zone with sparkling golden tinsel curtain, silver and gold baubles, glowing Christmas tree decorations, warm golden bokeh, festive event backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'stilyagi', outPath: path.join(ROOT, 'stilyagi.png'),
    prompt: 'Retro Stilyagi style photo zone, 1950s vintage, neon signs, vinyl records, colorful polka dots, retro car silhouette, turquoise and coral palette, fun party backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'bukvy-tsifry', outPath: path.join(ROOT, 'bukvy-tsifry.png'),
    prompt: 'Photo zone with large luminous 3D letters and numbers in warm white, minimalist elegant backdrop, soft golden glow, event decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'press-wall', outPath: path.join(ROOT, 'press-wall.png'),
    prompt: 'Modern press wall photo zone with branded greenery hedge wall, elegant corporate event backdrop, soft spotlight, premium flower arrangements, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'svadebnaya-flora', outPath: path.join(ROOT, 'svadebnaya-flora.png'),
    prompt: 'Wedding floral photo zone with lush arch of white and pink roses, eucalyptus, draped ivory fabric, golden sunset light, romantic luxury backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only, no couple',
    size: '1024x1024' },
  { slug: 'detskaya-edinorog', outPath: path.join(ROOT, 'detskaya-edinorog.png'),
    prompt: 'Kids birthday photo zone with rainbow unicorn theme, pastel balloons, fluffy clouds, golden star garlands, magical dreamy backdrop, bright cheerful, professional photography, detailed, NO PEOPLE, empty scene, decoration only, no children',
    size: '1024x1024' },
  { slug: 'korporativ-brand', outPath: path.join(ROOT, 'korporativ-brand.png'),
    prompt: 'Corporate branded photo zone with elegant logo backdrop, modern geometric panels, blue and gold accent lighting, premium business event, clean professional, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: '8-marta', outPath: path.join(ROOT, '8-marta.png'),
    prompt: 'March 8 womens day photo zone with pink and white flowers, elegant feminine backdrop, soft pastel balloons, golden accents, spring celebration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: '23-fevralya', outPath: path.join(ROOT, '23-fevralya.png'),
    prompt: 'February 23 mens day photo zone with khaki and gold military style, elegant patriotic backdrop, medals, stars, camo and gold accents, professional event photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'vypusknoj', outPath: path.join(ROOT, 'vypusknoj.png'),
    prompt: 'Graduation photo zone with golden stars, balloons in gold and silver, elegant graduation caps decor, festive backdrop, celebratory, professional photography, detailed, NO PEOPLE, empty scene, decoration only, no graduates',
    size: '1024x1024' },
  { slug: 'tekstilnaya-uzhur', outPath: path.join(ROOT, 'tekstilnaya-uzhur.png'),
    prompt: 'Elegant textile photo zone with draped champagne and ivory fabric, soft pleated curtains, golden uplighting, luxury minimal event backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'neon-party', outPath: path.join(ROOT, 'neon-party.png'),
    prompt: 'Neon party photo zone with glowing neon signs, vibrant pink and purple LED lights, dark moody backdrop, modern club aesthetic, energetic, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'rustic-garden', outPath: path.join(ROOT, 'rustic-garden.png'),
    prompt: 'Rustic garden photo zone with wooden pallets, wild flowers, mason jars, fairy string lights, boho chic backdrop, warm natural light, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'shary-arka', outPath: path.join(ROOT, 'shary-arka.png'),
    prompt: 'Photo zone with grand balloon arch in gold white and blush, organic balloon garland, elegant celebration backdrop, soft lighting, professional event photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === dop/ (10) ===
  { slug: 'dop/den-rozhdeniya-molebert-shary', outPath: path.join(ROOT, 'dop/den-rozhdeniya-molebert-shary.png'),
    prompt: 'Birthday photo zone with wooden easel stand displaying name, gold and white balloons composition 50 pieces, festive backdrop, professional event photography, detailed, NO PEOPLE, empty scene, decoration only, no birthday child',
    size: '1024x1024' },
  { slug: 'dop/dr-asimmetriya-shary', outPath: path.join(ROOT, 'dop/dr-asimmetriya-shary.png'),
    prompt: 'Asymmetric birthday photo zone with curved frame on the side, balloon garland in gold and white, elegant birthday backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/dr-bordo-zoloto-arka', outPath: path.join(ROOT, 'dop/dr-bordo-zoloto-arka.png'),
    prompt: 'Anniversary photo zone with circular arch in burgundy and gold, draped burgundy velvet, golden letters, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/dr-zeleno-zolotaya-arka', outPath: path.join(ROOT, 'dop/dr-zeleno-zolotaya-arka.png'),
    prompt: 'Birthday photo zone with emerald green and gold arch, luxurious velvet draping, golden numbers, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/happy-birthday-bordo-neon', outPath: path.join(ROOT, 'dop/happy-birthday-bordo-neon.png'),
    prompt: 'Birthday photo zone with burgundy backdrop and neon Happy Birthday sign, gold accents, balloons in burgundy and gold, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/ng-belye-perya-zoloto', outPath: path.join(ROOT, 'dop/ng-belye-perya-zoloto.png'),
    prompt: 'New Year photo zone with white feather backdrop and gold accents, elegant festive decoration, golden bokeh, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/ng-vitrina-octin', outPath: path.join(ROOT, 'dop/ng-vitrina-octin.png'),
    prompt: 'New Year photo zone with shop window style display, golden ornaments, christmas decorations, festive elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/yubilej-45-chyorno-zoloto', outPath: path.join(ROOT, 'dop/yubilej-45-chyorno-zoloto.png'),
    prompt: 'Anniversary 45 photo zone with black and gold color scheme, golden numbers 45, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/yubilej-50-izumrud-zoloto', outPath: path.join(ROOT, 'dop/yubilej-50-izumrud-zoloto.png'),
    prompt: 'Anniversary 50 photo zone with emerald green and gold theme, golden numbers 50, luxurious backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop/yubilej-50-sin-zoloto-lyuks', outPath: path.join(ROOT, 'dop/yubilej-50-sin-zoloto-lyuks.png'),
    prompt: 'Anniversary 50 luxury photo zone with deep blue and gold theme, golden numbers 50, premium elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === dop2/ (5 unique; ng2027-arka-2 and ng2027-gollivud-2 are second images) ===
  { slug: 'dop2/dr-belaya-arka-zvezdy', outPath: path.join(ROOT, 'dop2/dr-belaya-arka-zvezdy.png'),
    prompt: 'Birthday photo zone with white arch decorated with golden stars, white and gold balloons, elegant celebration backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/kamin-yolka-kantri', outPath: path.join(ROOT, 'dop2/kamin-yolka-kantri.png'),
    prompt: 'New Year photo zone with decorative fireplace and christmas tree in country style, rustic wood, warm lights, cozy festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/ng2027-arka-1', outPath: path.join(ROOT, 'dop2/ng2027-arka-1.png'),
    prompt: 'New Year 2027 photo zone with elegant golden arch, festive ornaments, balloon garland, luxurious backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/ng2027-arka-2', outPath: path.join(ROOT, 'dop2/ng2027-arka-2.png'),
    prompt: 'New Year 2027 photo zone with arch in gold and silver, decorative christmas ornaments, elegant festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/ng2027-gollivud-1', outPath: path.join(ROOT, 'dop2/ng2027-gollivud-1.png'),
    prompt: 'New Year 2027 Hollywood style photo zone with golden decorations, glamorous backdrop, premium festive decoration, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/ng2027-gollivud-2', outPath: path.join(ROOT, 'dop2/ng2027-gollivud-2.png'),
    prompt: 'New Year 2027 Hollywood style photo zone with red carpet theme, golden accents, glamorous backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'dop2/rustik-arhka-elvye', outPath: path.join(ROOT, 'dop2/rustik-arhka-elvye.png'),
    prompt: 'Rustic wedding photo zone with wooden arch decorated with fir branches, eucalyptus, natural wood, boho backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === novogodnie/ (5) ===
  { slug: 'novogodnie/novyj-god-arhka-elve', outPath: path.join(ROOT, 'novogodnie/novyj-god-arhka-elve.png'),
    prompt: 'New Year photo zone with fir arch, fresh green fir branches, golden ornaments, festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie/novyj-god-arhka-zvezdy', outPath: path.join(ROOT, 'novogodnie/novyj-god-arhka-zvezdy.png'),
    prompt: 'New Year photo zone with arch decorated with golden stars, festive ornaments, elegant backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie/novyj-god-shale', outPath: path.join(ROOT, 'novogodnie/novyj-god-shale.png'),
    prompt: 'New Year photo zone with knit shawl texture, cozy festive decoration, warm golden lights, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie/novyj-god-vitrina-pompony', outPath: path.join(ROOT, 'novogodnie/novyj-god-vitrina-pompony.png'),
    prompt: 'New Year photo zone with shop window display style, fluffy white pompons, golden ornaments, festive backdrop, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },
  { slug: 'novogodnie/novyj-god-vitrina-skan', outPath: path.join(ROOT, 'novogodnie/novyj-god-vitrina-skan.png'),
    prompt: 'New Year photo zone with scandinavian style shop window display, minimalist festive decoration, white and gold, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

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
  { slug: 'novogodnie-dop/zoloto-barkhka', outPath: path.join(ROOT, 'novogodnie-dop/zoloto-barkhka.png'),
    prompt: 'New Year photo zone with gold and velvet luxury theme, rich fabric drape, golden ornaments, professional photography, detailed, NO PEOPLE, empty scene, decoration only',
    size: '1024x1024' },

  // === yubilei/ (4 unique; den-rozhdeniya-molebert-shary is dup of dop/) ===
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

  // === 6 NEW (TPL-06 paillettes + TPL-08 flower wall) ===
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
    try {
      return JSON.parse(fs.readFileSync(PROGRESS, 'utf8'));
    } catch {
      return {};
    }
  }
  return {};
}

function saveProgress(p: Progress) {
  fs.mkdirSync(path.dirname(PROGRESS), { recursive: true });
  fs.writeFileSync(PROGRESS, JSON.stringify(p, null, 2));
}

async function genOne(zai: any, job: Job, progress: Progress): Promise<boolean> {
  if (progress[job.slug]?.done && fs.existsSync(job.outPath)) {
    console.log(`SKIP (already done): ${job.slug}`);
    return true;
  }
  const maxRetries = 5;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    const t0 = Date.now();
    try {
      const res = await zai.images.generations.create({ prompt: job.prompt, size: job.size as any });
      const b64 = res.data[0].base64;
      const buf = Buffer.from(b64, 'base64');
      fs.mkdirSync(path.dirname(job.outPath), { recursive: true });
      fs.writeFileSync(job.outPath, buf);
      progress[job.slug] = { done: true, size: buf.length, ts: new Date().toISOString() };
      saveProgress(progress);
      // Remove .jpg sibling if exists
      const jpg = job.outPath.replace(/\.png$/, '.jpg');
      if (fs.existsSync(jpg)) {
        try { fs.unlinkSync(jpg); } catch { /* ignore */ }
      }
      console.log(`OK ${job.slug} (${Math.round((Date.now() - t0) / 1000)}s, ${Math.round(buf.length / 1024)}KB)`);
      return true;
    } catch (e: any) {
      const msg = String(e?.message || e);
      console.error(`FAIL ${job.slug} attempt ${attempt}/${maxRetries}: ${msg.slice(0, 100)}`);
      if (msg.includes('429') || msg.includes('Too many')) {
        const wait = 10000 * attempt;
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
  console.log(`Regen-Images: ${jobs.length} jobs`);
  const zai = await ZAI.create();
  const progress = loadProgress();
  let okCount = 0;
  let failCount = 0;
  for (let i = 0; i < jobs.length; i++) {
    const job = jobs[i];
    console.log(`[${i + 1}/${jobs.length}] ${job.slug}`);
    const ok = await genOne(zai, job, progress);
    if (ok) okCount++; else failCount++;
    await sleep(2000);
  }
  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${jobs.length}, OK: ${okCount}, Failed: ${failCount}`);
  console.log(`Progress file: ${PROGRESS}`);
}

main().catch((e) => { console.error('FATAL:', e); process.exit(1); });
