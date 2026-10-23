import { db } from '../src/lib/db';

async function main() {
  const reviews = await db.review.findMany({ select: { rating: true, isPublished: true } });
  const published = reviews.filter(r => r.isPublished);
  console.log('Total reviews:', reviews.length);
  console.log('Published:', published.length);
  if (published.length > 0) {
    const avg = published.reduce((s, r) => s + r.rating, 0) / published.length;
    console.log('Avg rating:', avg.toFixed(2));
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
