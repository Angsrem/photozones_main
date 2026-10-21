import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const img = '/home/z/my-project/upload/pasted_image_1792511875887.png';
  const buf = fs.readFileSync(img);
  const base64 = buf.toString('base64');
  const mime = 'image/png';
  try {
    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Это скриншот страницы оплаты хостинга. Извлеки ВСЕ тексты, особенно: что выбрал пользователь (тариф, период оплаты, опции), какие были скрытые доплаты, итоговая сумма, что включено, что предлагается дополнительно (с галочками или без). Ответь структурированно с разделами: "Что выбрал пользователь", "Скрытые доплаты", "Итоговая стоимость", "Период оплаты", "Что входит".' },
          { type: 'image_url', image_url: { url: `data:${mime};base64,${base64}` } },
        ],
      }],
      thinking: { type: 'disabled' },
    });
    const content = response.choices?.[0]?.message?.content || '';
    console.log(content.slice(0, 3500));
  } catch (e: any) {
    console.error(`FAIL: ${String(e?.message || e).slice(0, 200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
