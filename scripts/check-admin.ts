import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const img = '/home/z/my-project/upload/pasted_image_1792661477481.png';
  const buf = fs.readFileSync(img);
  const base64 = buf.toString('base64');
  try {
    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Это скриншот страницы входа в админ-панель. Извлеки ВСЕ тексты максимально подробно: какие поля (email, пароль), какие сообщения об ошибках, что вводилось, есть ли редирект или сообщение "Invalid credentials". Покажи URL страницы.' },
          { type: 'image_url', image_url: { url: `data:image/png;base64,${base64}` } },
        ],
      }],
      thinking: { type: 'disabled' },
    });
    const content = response.choices?.[0]?.message?.content || '';
    console.log(content.slice(0, 3000));
  } catch (e: any) {
    console.error(`FAIL: ${String(e?.message || e).slice(0, 200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
