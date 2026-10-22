import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const img = '/home/z/my-project/upload/pasted_image_1792638520971.png';
  const buf = fs.readFileSync(img);
  const base64 = buf.toString('base64');
  try {
    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Это скриншот VS Code с терминалом. Извлеки ВСЕ тексты максимально подробно: какие команды, вывод (особенно вывод bun install, npm install, openssl, nano, db:push, seed). Если есть ошибки — покажи точно. Если в терминале открыт редактор nano с файлом .env — покажи содержимое.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
        ],
      }],
      thinking: { type: 'disabled' },
    });
    const content = response.choices?.[0]?.message?.content || '';
    console.log(content.slice(0, 4000));
  } catch (e: any) {
    console.error(`FAIL: ${String(e?.message || e).slice(0, 200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
