import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import crypto from 'crypto';

export const runtime = 'nodejs';

/**
 * POST /api/track — запись pageview в БД.
 * Вызывается с клиента (layout.tsx) при каждом переходе на новую страницу.
 * 
 * Body: { path: string, referer?: string, sessionId: string }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { path, referer, sessionId } = body as { path?: string; referer?: string; sessionId?: string };

    if (!path || typeof path !== 'string') {
      return NextResponse.json({ ok: false, error: 'No path' }, { status: 400 });
    }

    // Нормализуем путь (убираем query params, ограничиваем длину)
    const cleanPath = path.split('?')[0].slice(0, 200);
    
    // Не трекаем админку и API
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api') || cleanPath.startsWith('/_next')) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    // Хэш IP для уникальности (не храним raw IP)
    const rawIp = req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || '';
    const ipHash = rawIp ? crypto.createHash('sha256').update(rawIp).digest('hex').slice(0, 16) : null;

    // Короткий User-Agent (первые 200 символов)
    const ua = req.headers.get('user-agent') || '';
    const shortUa = ua.slice(0, 200);

    // Определяем referer (откуда пришёл)
    let ref: string | null = null;
    if (referer && typeof referer === 'string') {
      try {
        const url = new URL(referer);
        ref = url.hostname; // google.com, vk.com, t.me
      } catch {
        ref = null;
      }
    }
    if (!ref) ref = 'direct';

    // Проверяем — это первый визит этого sessionId за сегодня?
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const existing = await db.pageView.findFirst({
      where: {
        sessionId: sessionId || '_anonymous',
        createdAt: { gte: today },
      },
      select: { id: true },
    });
    const isUnique = !existing;

    // Записываем pageview
    await db.pageView.create({
      data: {
        path: cleanPath,
        referer: ref,
        ip: ipHash,
        userAgent: shortUa,
        sessionId: sessionId || null,
        isUnique,
      },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error('[track]', e?.message);
    return NextResponse.json({ ok: false, error: 'Server error' }, { status: 500 });
  }
}
