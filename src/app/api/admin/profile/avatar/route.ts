import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import sharp from 'sharp';
import { db } from '@/lib/db';
import { getSession, setSessionCookie } from '@/lib/auth';

export const runtime = 'nodejs';

const AVATAR_DIR = path.join(process.cwd(), 'public', 'avatars');
const MAX_SIZE = 8 * 1024 * 1024; // 8 МБ
const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif']);
const TARGET_SIZE = 200;

/** POST — загрузка аватара (multipart/form-data, поле file). */
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const manager = await db.manager.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
  if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Ожидается multipart/form-data' }, { status: 422 });
  }

  const file = form.get('file');
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Файл не передан (поле "file")' }, { status: 422 });
  }
  if (file.size === 0) {
    return NextResponse.json({ error: 'Файл пустой' }, { status: 422 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: 'Файл слишком большой (макс. 8 МБ)' }, { status: 422 });
  }
  if (file.type && !ALLOWED_MIME.has(file.type)) {
    return NextResponse.json({ error: 'Допустимы только изображения JPEG/PNG/WebP/GIF' }, { status: 422 });
  }

  // Удаляем старый аватар, если он есть (того же id, но другое расширение).
  await cleanupOldAvatar(manager.id);

  await fs.mkdir(AVATAR_DIR, { recursive: true });

  // Сохраняем как .jpg (конвертация через sharp).
  const outPath = path.join(AVATAR_DIR, `${manager.id}.jpg`);
  const buf = Buffer.from(await file.arrayBuffer());

  try {
    await sharp(buf)
      .resize(TARGET_SIZE, TARGET_SIZE, { fit: 'cover', position: 'center' })
      .jpeg({ quality: 85, mozjpeg: true })
      .toFile(outPath);
  } catch (e) {
    // Если sharp не справился (например, повреждённый файл) — fallback: сохраняем как есть.
    await fs.writeFile(outPath, buf);
  }

  // Путь относительно корня public — для отдачи браузером.
  const avatarUrl = `/avatars/${manager.id}.jpg?v=${Date.now()}`;

  await db.manager.update({
    where: { id: manager.id },
    data: { avatar: avatarUrl },
  });

  // Обновим cookie сессии, чтобы шапка показывала аватар без перелогина.
  await setSessionCookie({
    id: manager.id,
    email: manager.email,
    name: manager.name,
    role: manager.role,
    avatar: avatarUrl,
  });

  return NextResponse.json({ ok: true, avatar: avatarUrl });
}

/** DELETE — удалить аватар. */
export async function DELETE() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const manager = await db.manager.findUnique({
    where: { id: session.id },
    select: { id: true, email: true, name: true, role: true, avatar: true },
  });
  if (!manager) return NextResponse.json({ error: 'Менеджер не найден' }, { status: 404 });

  if (manager.avatar) {
    await cleanupOldAvatar(manager.id);
    await db.manager.update({ where: { id: manager.id }, data: { avatar: null } });
    await setSessionCookie({
      id: manager.id,
      email: manager.email,
      name: manager.name,
      role: manager.role,
      avatar: null,
    });
  }

  return NextResponse.json({ ok: true });
}

async function cleanupOldAvatar(managerId: string) {
  try {
    const files = await fs.readdir(AVATAR_DIR).catch(() => [] as string[]);
    for (const f of files) {
      if (f.startsWith(`${managerId}.`)) {
        await fs.unlink(path.join(AVATAR_DIR, f)).catch(() => {});
      }
    }
  } catch {
    // ignore
  }
}
