import { db } from '../src/lib/db';

async function main() {
  const count = await db.photoZone.count();
  console.log('Total photozones:', count);
  const all = await db.photoZone.findMany({ select: { slug: true, basePrice: true, images: true }, orderBy: { sortOrder: 'asc' } });
  for (const p of all) {
    console.log(`  ${p.slug}: ${p.basePrice} | ${(p.images as any)?.[0] || ''}`);
  }
  const elsCount = await db.element.count();
  console.log('Total elements:', elsCount);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
