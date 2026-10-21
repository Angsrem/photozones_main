import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

const files = [
  'pasted_image_1792565479826.png',
  'pasted_image_1792565497386.png',
  'pasted_image_1792565518341.png',
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
            { type: 'text', text: 'Это скриншот настройки VPS на RUVDS. Извлеки ВСЕ тексты максимально подробно: какие опции доступны для выбора (ОС, локация, ПО, период оплаты, опции вроде панели управления/бэкапов/IPv4/SSH-ключи), что выбрано по умолчанию, что бесплатно, что за доп. плату. Структурируй ответ.' },
            { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
          ],
        }],
        thinking: { type: 'disabled' },
      });
      const content = response.choices?.[0]?.message?.content || '';
      console.log(`\n========== ${f} ==========`);
      console.log(content.slice(0, 3000));
    } catch (e: any) {
      console.error(`FAIL ${f}: ${String(e?.message || e).slice(0, 200)}`);
    }
    await new Promise((r) => setTimeout(r, 2000));
  }
}

main().catch(e => { console.error(e); process.exit(1); });
