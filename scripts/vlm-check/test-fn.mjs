// Quick test: invoke vlm via zai.functions.invoke (different API path?)
import ZAI from 'z-ai-web-dev-sdk';
import fs from 'node:fs';

const filePath = process.argv[2] || 'public/images/photozones/love.png';
const buf = fs.readFileSync(filePath);
const b64 = buf.toString('base64');

(async () => {
  const zai = await ZAI.create();
  try {
    const r = await zai.functions.invoke('vlm', {
      image: b64,
      prompt: 'Есть ли на изображении живые люди? Ответь строго JSON: {has_people, count, description, people_description}.'
    });
    console.log(JSON.stringify(r, null, 2));
  } catch (e) {
    console.error('ERR:', e.message);
  }
})();
