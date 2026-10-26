import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const files = [
  'pasted_image_1792992968812.png',
  'pasted_image_1792993001784.png',
];

async function main() {
  const zai = await ZAI.create();
  for (const f of files) {
    const img = `/home/z/my-project/upload/${f}`;
    if (!fs.existsSync(img)) { console.log(`Skip ${f}`); continue; }
    const buf = fs.readFileSync(img);
    const base64 = buf.toString('base64');
    try {
      const response = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Извлеки ВСЕ тексты со скриншота максимально подробно. Что это — админ-панель на мобильном? Какие меню/кнопки не влезают по ширине, какие обрезаны, какие элементы выходят за экран. Опиши визуальные проблемы с расположением.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = response.choices?.[0]?.message?.content || '';
      console.log(`\n========== ${f} ==========`);
      console.log(content.slice(0, 3500));
    } catch (e: any) {
      console.error(`FAIL ${f}: ${String(e?.message || e).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
