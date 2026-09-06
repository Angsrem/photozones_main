import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export const runtime = 'nodejs';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads', 'reviews');
const MAX_PHOTO_SIZE = 8 * 1024 * 1024; // 8MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_PHOTO = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_VIDEO = ['video/mp4', 'video/webm'];

async function saveFile(file: File, type: 'photo' | 'video'): Promise<string> {
  const maxSize = type === 'photo' ? MAX_PHOTO_SIZE : MAX_VIDEO_SIZE;
  const allowed = type === 'photo' ? ALLOWED_PHOTO : ALLOWED_VIDEO;
  if (!allowed.includes(file.type)) throw new Error(`Недопустимый формат ${type}: ${file.type}`);
  if (file.size > maxSize) throw new Error(`Файл слишком большой (макс ${maxSize / 1024 / 1024}МБ)`);

  if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  const ext = file.name.split('.').pop() || (type === 'photo' ? 'jpg' : 'mp4');
  const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  fs.writeFileSync(path.join(UPLOAD_DIR, name), buffer);
  return `/uploads/reviews/${name}`;
}

export async function POST(req: NextRequest) {
  try {
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
        photos: photos.length ? photos : null,
        videos: videos.length ? videos : null,
        isPublished: false, // на модерации
      },
    });

    return NextResponse.json({ ok: true, id: review.id }, { status: 201 });
  } catch (e: any) {
    console.error('[POST /api/reviews]', e);
    return NextResponse.json({ error: 'Ошибка отправки отзыва' }, { status: 500 });
  }
}
