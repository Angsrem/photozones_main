/**
 * Replace original images with new .new.png files.
 * - For each .new.png: rename to .png (overwrite existing)
 * - Remove .new.png file
 * - Remove .jpg duplicates (now superseded by .png)
 * - Remove .regen-marker files
 * - Keep .ai markers (original AI flag)
 */
import fs from 'fs';
import path from 'path';

const ROOT = path.join(process.cwd(), 'public/images/photozones');

function walk(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(full));
    else out.push(full);
  }
  return out;
}

const all = walk(ROOT);
let moved = 0;
let deletedJpg = 0;
let deletedMarker = 0;

for (const f of all) {
  const ext = path.extname(f).toLowerCase();
  if (f.endsWith('.new.png')) {
    const target = f.replace(/\.new\.png$/, '.png');
    fs.copyFileSync(f, target);
    fs.unlinkSync(f);
    moved++;
    // also delete matching .jpg if exists
    const jpgSibling = f.replace(/\.new\.png$/, '.jpg');
    if (fs.existsSync(jpgSibling)) {
      fs.unlinkSync(jpgSibling);
      deletedJpg++;
    }
  } else if (f.endsWith('.regen-marker')) {
    fs.unlinkSync(f);
    deletedMarker++;
  }
}

console.log(`Replaced: ${moved} files (.new.png -> .png)`);
console.log(`Deleted .jpg duplicates: ${deletedJpg}`);
console.log(`Deleted .regen-marker files: ${deletedMarker}`);
console.log(`Final folder size: ${Math.round(getDirSize(ROOT) / 1024 / 1024 * 10) / 10} MB`);

function getDirSize(dir: string): number {
  let size = 0;
  for (const f of walk(dir)) {
    try { size += fs.statSync(f).size; } catch { /* ignore */ }
  }
  return size;
}
