import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const files = [
    '/home/z/my-project/upload/pasted_image_1792512849456.png',
    '/home/z/my-project/upload/pasted_image_1792513113582.png',
  ];
  for (const img of files) {
    if (!fs.existsSync(img)) { console.log(`Skip ${img} (not found)`); continue; }
    const buf = fs.readFileSync(img);
    const base64 = buf.toString('base64');
    try {
      const response = await zai.chat.completions.createVision({
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: 'Это скриншот страницы хостинга. Извлеки ВСЕ тексты максимально подробно — название тарифа, цена, что входит (RAM, диск, CPU, IP,带宽), география/локация, особые отметки/предупреждения, мелкий шрифт, любые ограничения. Особое внимание — на подвохи, ограничения, "только для X", "нет Y", сроки акции. Структурируй ответ.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = response.choices?.[0]?.message?.content || '';
      console.log(`\n=== ${img.split('/').pop()} ===`);
      console.log(content.slice(0, 3500));
    } catch (e: any) {
      console.error(`FAIL ${img}: ${String(e?.message || e).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
