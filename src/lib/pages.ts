import { db } from './db';

export type PageBlock =
  | { type: 'heading'; text: string; level?: 1 | 2 | 3 }
  | { type: 'paragraph'; text: string }
  | { type: 'list'; items: string[]; ordered?: boolean }
  | { type: 'image'; src: string; alt?: string; caption?: string }
  | { type: 'cta'; text: string; href: string; variant?: 'gold' | 'outline' }
  | { type: 'quote'; text: string; author?: string }
  | { type: 'faq'; items: { q: string; a: string }[] }
  | { type: 'stats'; items: { value: string; label: string }[] }
  | { type: 'divider' };

export type PageData = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  blocks: PageBlock[];
  isPublished: boolean;
  updatedAt: string;
};

export async function getPage(slug: string): Promise<PageData | null> {
  const p = await db.page.findUnique({ where: { slug } });
  if (!p || !p.isPublished) return null;
  return {
    id: p.id,
    slug: p.slug,
    title: p.title,
    description: p.description,
    blocks: (p.blocks as PageBlock[]) || [],
    isPublished: p.isPublished,
    updatedAt: p.updatedAt.toISOString(),
  };
}

export async function getAllPages() {
  return db.page.findMany({ orderBy: { title: 'asc' } });
}
