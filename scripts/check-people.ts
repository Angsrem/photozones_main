/**
 * VLM Check: detect people in photozone images
 * Run: bun run scripts/check-people.ts
 */
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'public/images/photozones');
const OUT = path.join(process.cwd(), 'agent-ctx/vlm-people-results.json');

type Result = {
  file: string;
  hasPeople: boolean;
  count: number;
  description: string;
  peopleDescription: string;
  ok: boolean;
  error?: string;
};

async function checkFile(zai: any, filePath: string, relPath: string): Promise<Result> {
  const maxRetries = 4;
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const buf = fs.readFileSync(filePath);
      const ext = path.extname(filePath).toLowerCase();
      const mime = ext === '.png' ? 'image/png' : 'image/jpeg';
      const base64 = buf.toString('base64');

      const response = await zai.chat.completions.createVision({
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: 'Есть ли на этом изображении люди (лица, фигуры, силуэты, гости, молодожёны, дети)? Ответь ТОЛЬКО в формате JSON без markdown: {"has_people": true/false, "count": N, "description": "краткое описание фотозоны на русском", "people_description": "если есть люди — опиши их кратко на русском, иначе пустая строка"}' },
              { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
            ],
          },
        ],
        thinking: { type: 'disabled' },
      });

      const content = response.choices?.[0]?.message?.content || '';
      const cleaned = content.replace(/```json\s*|\```/g, '').trim();
      let parsed: any;
      try {
        parsed = JSON.parse(cleaned);
      } catch {
        const m = cleaned.match(/\{[\s\S]*\}/);
        if (m) {
          try { parsed = JSON.parse(m[0]); } catch { /* ignore */ }
        }
      }
      if (!parsed) {
        return { file: relPath, hasPeople: false, count: 0, description: content.slice(0, 200), peopleDescription: '', ok: false, error: 'PARSE_FAIL' };
      }
      return {
        file: relPath,
        hasPeople: Boolean(parsed.has_people),
        count: Number(parsed.count) || 0,
        description: String(parsed.description || '').slice(0, 300),
        peopleDescription: String(parsed.people_description || '').slice(0, 300),
        ok: true,
      };
    } catch (e: any) {
      const msg = String(e?.message || e);
      const isRate = msg.includes('429');
      if (isRate && attempt < maxRetries - 1) {
        const wait = 5000 * (attempt + 1) * (attempt + 1); // 5s, 20s, 45s, 80s
        console.log(`    [rate-limit] attempt ${attempt + 1}/${maxRetries}, waiting ${wait}ms...`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }
      return { file: relPath, hasPeople: false, count: 0, description: '', peopleDescription: '', ok: false, error: msg.slice(0, 200) };
    }
  }
  return { file: relPath, hasPeople: false, count: 0, description: '', peopleDescription: '', ok: false, error: 'RETRIES_EXHAUSTED' };
}

async function main() {
  console.log('VLM People Check: start');
  const zai = await ZAI.create();

  // gather all files
  const files: string[] = [];
  function walk(dir: string) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else {
        const ext = path.extname(entry.name).toLowerCase();
        if (ext === '.jpg' || ext === '.jpeg' || ext === '.png') {
          files.push(full);
        }
      }
    }
  }
  walk(ROOT);
  console.log(`Found ${files.length} image files`);

  const results: Result[] = [];
  // Resume support: load existing results if present
  let existing: Result[] = [];
  if (fs.existsSync(OUT)) {
    try {
      existing = JSON.parse(fs.readFileSync(OUT, 'utf8'));
      console.log(`Resuming: ${existing.length} already processed`);
    } catch { /* ignore */ }
  }
  const done = new Set(existing.map((r) => r.file));
  results.push(...existing);

  // Sequential (1 at a time) to avoid 429
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const rel = path.relative(ROOT, f);
    if (done.has(rel)) {
      console.log(`[${i + 1}/${files.length}] SKIP (already done): ${rel}`);
      continue;
    }
    console.log(`[${i + 1}/${files.length}] Processing: ${rel}`);
    const r = await checkFile(zai, f, rel);
    results.push(r);
    // save incremental
    fs.writeFileSync(OUT, JSON.stringify(results, null, 2));
    if (r.ok) {
      const tag = r.hasPeople ? '⚠️ HAS PEOPLE' : '✓ OK';
      console.log(`    ${tag} (count=${r.count})`);
    } else {
      console.log(`    ✗ ERROR: ${r.error}`);
    }
    // delay between requests to avoid rate limit
    await new Promise((r) => setTimeout(r, 1500));
  }

  fs.mkdirSync(path.dirname(OUT), { recursive: true });
  fs.writeFileSync(OUT, JSON.stringify(results, null, 2));

  const withPeople = results.filter((r) => r.ok && r.hasPeople);
  const withoutPeople = results.filter((r) => r.ok && !r.hasPeople);
  const errored = results.filter((r) => !r.ok);

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total: ${results.length}`);
  console.log(`With people (need rerender): ${withPeople.length}`);
  console.log(`Without people (OK): ${withoutPeople.length}`);
  console.log(`Errors: ${errored.length}`);
  console.log(`\nResults saved to: ${OUT}`);

  if (withPeople.length > 0) {
    console.log(`\n=== FILES WITH PEOPLE ===`);
    for (const r of withPeople) {
      console.log(`  - ${r.file} (count: ${r.count}, ${r.peopleDescription})`);
    }
  }
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
