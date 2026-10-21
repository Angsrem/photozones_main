import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const files = [
  'ruvds.com_ru-rub_my_orders.png',
  'pasted_image_1792513804316.png',
  'pasted_image_1792513831071.png',
  'pasted_image_1792513852512.png',
  'pasted_image_1792513873090.png',
];

async function main() {
  const zai = await ZAI.create();
  for (const f of files) {
    const img = `/home/z/my-project/upload/${f}`;
    if (!fs.existsSync(img)) { console.log(`Skip ${f} (not found)`); continue; }
    const buf = fs.readFileSync(img);
    const base64 = buf.toString('base64');
    try {
      const response = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Это скриншот страницы RUVDS (хостинг). Извлеки ВСЕ тексты максимально подробно: названия тарифов, цены, что входит в тариф (RAM, диск, CPU, IPv4/IPv6, traffic, bandwidth, локация/дата-центр, ОС), особые отметки, мелкий шрифт, любые ограничения. Структурируй ответ. Особое внимание — на подвохи и скрытые условия.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = response.choices?.[0]?.message?.content || '';
      console.log(`\n========== ${f} ==========`);
      console.log(content.slice(0, 3500));
      console.log('---');
    } catch (e: any) {
      console.error(`FAIL ${f}: ${String(e?.message || e).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
