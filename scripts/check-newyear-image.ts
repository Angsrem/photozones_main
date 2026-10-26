import ZAI from 'z-ai-web-dev-sdk';
import fs from 'fs';

async function main() {
  const zai = await ZAI.create();
  const img = '/home/z/my-project/upload/Gemini_Generated_Image_xew3tuxew3tuxew3.jpg';
  const buf = fs.readFileSync(img);
  const base64 = buf.toString('base64');
  try {
    const response = await zai.chat.completions.createVision({
      messages: [{
        role: 'user',
        content: [
          { type: 'text', text: 'Опиши это изображение подробно. Что на нём изображено (новогодняя фотозона, ёлка, декор, цвета)? Подходит ли для hero-фона на сайте аренды фотозон? Опиши композицию, освещение, настроение.' },
          { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${base64}` } },
        ],
      }],
      thinking: { type: 'disabled' },
    });
    const content = response.choices?.[0]?.message?.content || '';
    console.log(content.slice(0, 2000));
  } catch (e: any) {
    console.error(`FAIL: ${String(e?.message || e).slice(0, 200)}`);
  }
}

main().catch(e => { console.error(e); process.exit(1); });
