// Mass VLM check: detect people on photozone images.
// Reads all .jpg/.png under public/images/photozones/ (excluding .ai),
// calls z-ai-web-dev-sdk vision API in parallel (concurrency-limited),
// and writes structured JSON results to scripts/vlm-check/results.json.

import ZAI from 'z-ai-web-dev-sdk';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PROJECT_ROOT = path.resolve(__dirname, '..', '..');
const PHOTOZONES_DIR = path.join(PROJECT_ROOT, 'public', 'images', 'photozones');
const OUT_FILE = path.join(__dirname, 'results.json');
const ERRORS_FILE = path.join(__dirname, 'errors.json');
const PROGRESS_FILE = path.join(__dirname, 'progress.json');

const CONCURRENCY = 1;
const MAX_RETRIES = 6;
const BASE_DELAY_MS = 1200; // base delay between requests
const BACKOFF_BASE_MS = 3000; // 429 backoff base

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const PROMPT =
  'Внимательно проанализируй изображение. Определи, есть ли на нём живые люди (лица, фигуры, силуэты, головы, руки, ноги, туловище). ' +
  'Статуи, манекены, нарисованные/печатные изображения людей (например, на плакатах, обоях, фотообоях) и игрушки НЕ считаются. ' +
  'Ответь СТРОГО в формате JSON без markdown-оболочки: ' +
  '{"has_people": boolean, "count": number, "description": "краткое описание содержимого изображения на русском", ' +
  '"people_description": "если has_people true — опиши людей (число, позы, одежда), иначе пустая строка"}';

function listImages(dir) {
  const out = [];
  const walk = (d) => {
    for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
      const full = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(full);
      } else if (entry.isFile()) {
        const ext = entry.name.toLowerCase().split('.').pop();
        if (ext === 'jpg' || ext === 'jpeg' || ext === 'png') {
          out.push(full);
        }
      }
    }
  };
  walk(dir);
  return out.sort();
}

function mimeFor(p) {
  const ext = p.toLowerCase().split('.').pop();
  if (ext === 'png') return 'image/png';
  return 'image/jpeg';
}

function stripCodeFence(text) {
  if (!text) return text;
  let t = text.trim();
  if (t.startsWith('```')) {
    t = t.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/i, '').trim();
  }
  return t;
}

function parseVlmContent(raw) {
  const cleaned = stripCodeFence(raw || '');
  try {
    return JSON.parse(cleaned);
  } catch {
    const m = cleaned.match(/\{[\s\S]*\}/);
    if (m) {
      try {
        return JSON.parse(m[0]);
      } catch {
        return null;
      }
    }
    return null;
  }
}

async function analyzeOne(zai, filePath) {
  const buf = fs.readFileSync(filePath);
  const base64 = buf.toString('base64');
  const dataUrl = `data:${mimeFor(filePath)};base64,${base64}`;
  const resp = await zai.chat.completions.createVision({
    messages: [
      {
        role: 'user',
        content: [
          { type: 'text', text: PROMPT },
          { type: 'image_url', image_url: { url: dataUrl } },
        ],
      },
    ],
    thinking: { type: 'disabled' },
  });
  const raw = resp?.choices?.[0]?.message?.content || '';
  return { raw, parsed: parseVlmContent(raw) };
}

async function callWithRetries(zai, filePath) {
  let lastErr = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await analyzeOne(zai, filePath);
      if (res.parsed && typeof res.parsed.has_people === 'boolean') {
        return { ok: true, parsed: res.parsed };
      }
      lastErr = new Error('Unparseable VLM response: ' + res.raw.slice(0, 200));
    } catch (e) {
      lastErr = e;
      const msg = String(e && e.message ? e.message : e);
      // Backoff on rate-limit (429) or transient 5xx
      if (msg.includes('429') || msg.includes('Too many requests') || msg.includes('503') || msg.includes('500')) {
        const backoff = BACKOFF_BASE_MS * Math.pow(2, attempt);
        const jitter = Math.floor(Math.random() * 500);
        process.stdout.write(`  [retry ${attempt + 1}/${MAX_RETRIES}] ${msg.slice(0, 80)} → sleep ${backoff + jitter}ms\n`);
        await sleep(backoff + jitter);
      }
    }
    // small inter-attempt delay
    if (attempt < MAX_RETRIES) await sleep(BASE_DELAY_MS);
  }
  return { ok: false, error: String(lastErr && lastErr.message ? lastErr.message : lastErr) };
}

async function pool(items, worker, concurrency) {
  const results = new Array(items.length);
  let idx = 0;
  let completed = 0;
  async function run() {
    while (true) {
      const myIdx = idx++;
      if (myIdx >= items.length) return;
      try {
        results[myIdx] = await worker(items[myIdx], myIdx);
      } catch (e) {
        results[myIdx] = { status: 'error', error: String(e && e.message ? e.message : e) };
      }
      completed++;
      if (completed % 5 === 0 || completed === items.length) {
        const summary = { completed, total: items.length, ts: new Date().toISOString() };
        try { fs.writeFileSync(PROGRESS_FILE, JSON.stringify(summary, null, 2)); } catch {}
        process.stdout.write(`[${completed}/${items.length}] processed\n`);
      }
    }
  }
  await Promise.all(Array.from({ length: concurrency }, run));
  return results;
}

async function main() {
  const images = listImages(PHOTOZONES_DIR);
  console.log(`Found ${images.length} images under ${PHOTOZONES_DIR}`);
  const zai = await ZAI.create();

  // Resume support: load previous results
  const prevMap = new Map();
  if (fs.existsSync(OUT_FILE)) {
    try {
      const prev = JSON.parse(fs.readFileSync(OUT_FILE, 'utf8'));
      if (Array.isArray(prev.results)) {
        for (const r of prev.results) {
          if (r && r.path) prevMap.set(r.path, r);
        }
        console.log(`Loaded ${prevMap.size} previous results for resume`);
      }
    } catch (e) {
      console.log('Failed to parse previous results.json, starting fresh:', e.message);
    }
  }

  // Initial cooldown to let any prior rate-limit clear
  console.log('Initial cooldown: 30s to let rate limits clear...');
  await sleep(30000);

  const out = await pool(images, async (filePath) => {
    const rel = path.relative(PROJECT_ROOT, filePath).replace(/\\/g, '/');
    // Skip if already processed successfully
    if (prevMap.has(rel)) {
      const prev = prevMap.get(rel);
      if (prev.status === 'ok') {
        return prev;
      }
    }
    const r = await callWithRetries(zai, filePath);
    if (!r.ok) {
      return { path: rel, status: 'error', error: r.error };
    }
    const p = r.parsed;
    const result = {
      path: rel,
      status: 'ok',
      has_people: !!p.has_people,
      count: typeof p.count === 'number' ? p.count : (p.has_people ? null : 0),
      description: p.description || '',
      people_description: p.people_description || '',
    };
    // Persist incrementally so progress survives a crash
    prevMap.set(rel, result);
    try {
      const partial = Array.from(prevMap.values());
      fs.writeFileSync(OUT_FILE, JSON.stringify({ partial: true, results: partial }, null, 2));
    } catch {}
    // Throttle between requests to avoid 429
    await sleep(BASE_DELAY_MS);
    return result;
  }, CONCURRENCY);

  const okResults = out.filter((r) => r.status === 'ok');
  const errorResults = out.filter((r) => r.status === 'error');
  const withPeople = okResults.filter((r) => r.has_people);
  const withoutPeople = okResults.filter((r) => !r.has_people);

  const summary = {
    total: out.length,
    ok: okResults.length,
    errors: errorResults.length,
    with_people: withPeople.length,
    without_people: withoutPeople.length,
    ts: new Date().toISOString(),
  };
  fs.writeFileSync(OUT_FILE, JSON.stringify({ summary, results: out }, null, 2));
  if (errorResults.length) {
    fs.writeFileSync(ERRORS_FILE, JSON.stringify(errorResults, null, 2));
  }
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify({ done: true, ...summary }, null, 2));
  console.log('Summary:', JSON.stringify(summary, null, 2));
  console.log('Results ->', OUT_FILE);
  if (errorResults.length) console.log('Errors ->', ERRORS_FILE);
}

main().catch((e) => {
  console.error('FATAL:', e);
  process.exit(1);
});
