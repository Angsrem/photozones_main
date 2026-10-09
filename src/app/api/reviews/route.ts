import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { rateLimit, getClientIp } from '@/lib/rate-limit';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'reviews');
const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB

// Разрешённые типы по Content-Type и соответствующие magic-bytes.
// Расширение всегда выбираем по Content-Type, а НЕ из file.name —
// иначе атакующий может загрузить .svg/.html под видом .jpg.
const PHOTO_FORMATS: Record<string, { ext: string; magic: number[][] }> = {
  'image/jpeg': { ext: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
  'image/png': { ext: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/webp': { ext: 'webp', magic: [[0x52, 0x49, 0x46, 0x46]] }, // RIFF....WEBP
};
const VIDEO_FORMATS: Record<string, { ext: string; magic: number[][] }> = {
  'video/mp4': { ext: 'mp4', magic: [[0x00, 0x00, 0x00]] }, // ....ftyp
  'video/webm': { ext: 'webm', magic: [[0x1a, 0x45, 0xdf, 0xa3]] },
};

// Запретные расширения — даже если Content-Type валиден, не пропускаем.
const FORBIDDEN_EXT = ['svg', 'svgz', 'html', 'htm', 'xhtml', 'js', 'xml'];

function matchesMagic(buf: Buffer, candidates: number[][]): boolean {
  return candidates.some((sig) => {
    // Для сигнатур, у которых позиция может быть смещена (RIFF....WEBP, ....ftyp),
    // ищем префикс в первых 16 байтах.
    if (sig.length === 4 && (sig[0] === 0x52 || sig[0] === 0x00)) {
      const head = buf.subarray(0, Math.min(buf.length, 32));
      // точное совпадение в начале
      if (head.subarray(0, sig.length).equals(Buffer.from(sig))) return true;
      // для WEBP: RIFF????WEBP
      if (sig[0] === 0x52 && buf.length >= 12 && buf.subarray(0, 4).equals(Buffer.from([0x52, 0x49, 0x46, 0x46])) && buf.subarray(8, 12).equals(Buffer.from([0x57, 0x45, 0x42, 0x50]))) return true;
      // для MP4: ....ftyp
      if (sig[0] === 0x00 && buf.length >= 12 && buf.subarray(4, 8).equals(Buffer.from([0x66, 0x74, 0x79, 0x70]))) return true;
      return false;
    }
    if (buf.length < sig.length) return false;
    return buf.subarray(0, sig.length).equals(Buffer.from(sig));
  });
}

async function saveFile(file: File, type: 'photo' | 'video'): Promise<string> {
  const maxSize = type === 'photo' ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE;
  const formats = type === 'photo' ? PHOTO_FORMATS : VIDEO_FORMATS;

  const contentType = (file.type || '').toLowerCase();
  const fmt = formats[contentType];
  if (!fmt) throw new Error(`Недопустимый формат ${type}: ${contentType || 'не указан'}`);
  if (file.size > maxSize) throw new Error(`Файл слишком большой (макс ${maxSize / 1024 / 1024}МБ)`);

  const buffer = Buffer.from(await file.arrayBuffer());
  if (buffer.length < 12) throw new Error('Файл повреждён или слишком маленький');

  // Проверка magic-bytes: Content-Type может врать, имя файла — тем более.
  if (!matchesMagic(buffer, fmt.magic)) {
    throw new Error(`Содержимое файла не соответствует типу ${contentType}`);
  }

  // Запрет опасных расширений (на случай, если кто-то передаст file.name с .svg).
  const lowerName = (file.name || '').toLowerCase();
  if (FORBIDDEN_EXT.some((e) => lowerName.endsWith('.' + e))) {
    throw new Error('Этот тип файлов запрещён');
  }

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  // Расширение всегда из Content-Type — не из имени файла.
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${fmt.ext}`;
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/reviews/${name}`;
}

export async function POST(req: NextRequest) {
  try {
    // Rate-limit: 5 отзывов в минуту на IP.
    const ip = getClientIp(req);
    if (!rateLimit(`reviews:${ip}`, 5, 60_000)) {
      return NextResponse.json(
        { error: 'Слишком много отзывов. Попробуйте позже.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }

    const formData = await req.formData();
    const author = String(formData.get('author') || '').trim();
    const text = String(formData.get('text') || '').trim();
    const event = String(formData.get('event') || '').trim() || null;
    const rating = Number(formData.get('rating') || 5);
    const photoFiles = formData.getAll('photos').filter((f) => f instanceof File && f.size > 0) as File[];
    const videoFiles = formData.getAll('videos').filter((f) => f instanceof File && f.size > 0) as File[];

    if (!author) return NextResponse.json({ error: 'Укажите имя' }, { status: 422 });
    if (!text || text.length < 10) return NextResponse.json({ error: 'Отзыв слишком короткий (мин 10 символов)' }, { status: 422 });
    if (rating < 1 || rating > 5) return NextResponse.json({ error: 'Оценка 1–5' }, { status: 422 });
    if (photoFiles.length > 5) return NextResponse.json({ error: 'Максимум 5 фото' }, { status: 422 });
    if (videoFiles.length > 2) return NextResponse.json({ error: 'Максимум 2 видео' }, { status: 422 });

    const photos: string[] = [];
    const videos: string[] = [];
    for (const f of photoFiles) {
      try { photos.push(await saveFile(f, 'photo')); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 422 }); }
    }
    for (const f of videoFiles) {
      try { videos.push(await saveFile(f, 'video')); } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 422 }); }
    }

    const review = await db.review.create({
      data: {
        author, text, event, rating,
        photos: photos.length ? photos : undefined,
        videos: videos.length ? videos : undefined,
        isPublished: false, // на модерации
      },
    });

    // Если передан photozoneTitle — привязываем отзыв к фотозоне
    const photozoneTitle = String(formData.get('photozoneTitle') || '').trim();
    if (photozoneTitle) {
      const pz = await db.photoZone.findFirst({ where: { title: photozoneTitle }, select: { id: true } });
      if (pz) {
        await db.review.update({ where: { id: review.id }, data: { photozoneId: pz.id } });
      }
    }

    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (e: any) {
    console.error('[POST /api/reviews]', e);
    return NextResponse.json({ error: 'Ошибка отправки отзыва' }, { status: 500 });
  }
}
