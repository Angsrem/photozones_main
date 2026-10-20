import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';
import path from 'path';

const images = [
  '/home/z/my-project/upload/pasted_image_1792509857422.png',
  '/home/z/my-project/upload/pasted_image_1792509972202.png',
  '/home/z/my-project/upload/pasted_image_1792510181746.png',
];

async function main() {
  const zai = await ZAI.create();
  for (const img of images) {
    const buf = fs.readFileSync(img);
    const base64 = buf.toString('base64');
    const mime = 'image/png';
    try {
      const response = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Это скриншот сайта хостинга. Извлеки ВСЕ тексты на русском/английском (названия тарифов, цены, RAM, диск, CPU, IP, bandwidth, и т.д.) и описания. Ответь структурированно: найди все тарифные планы с ценами.' },
            { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = response.choices?.[0]?.message?.content || '';
      console.log(`\n=== ${path.basename(img)} ===`);
      console.log(content.slice(0, 2000));
      console.log('---');
    } catch (e: any) {
      console.error(`FAIL ${img}: ${String(e?.message || e).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
