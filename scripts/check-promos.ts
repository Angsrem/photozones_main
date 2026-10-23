import { db } from '../src/lib/db';

async function main() {
  const promos = await db.promo.findMany({
    select: { id: true, title: true, pages: true, isActive: true },
  });
  console.log('Total promos:', promos.length);
  for (const p of promos) {
    console.log(`  ${p.id} | ${p.title} | active=${p.isActive} | pages=${JSON.stringify(p.pages)}`);
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
