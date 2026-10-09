import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/admin/lead-magnets — список лид-магнитов со счётчиком скачиваний.
// Защищён сессией менеджера.
export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Не авторизован' }, { status: 401 });

  const magnets = await db.leadMagnet.findMany({
    orderBy: { downloads: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      description: true,
      fileUrl: true,
      occasion: true,
      isActive: true,
      downloads: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  const totalDownloads = magnets.reduce((sum, m) => sum + m.downloads, 0);
  const activeCount = magnets.filter((m) => m.isActive).length;

  return NextResponse.json({
    items: magnets,
    totalDownloads,
    activeCount,
    total: magnets.length,
  });
}
