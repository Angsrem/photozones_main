import Image from 'next/image';
import Link from 'next/link';
import { getPage, type PageBlock } from '@/lib/pages';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Star } from 'lucide-react';

// Серверный компонент: рендерит один блок контента
function Block({ block }: { block: PageBlock }) {
  switch (block.type) {
    case 'heading': {
      const Tag = (`h${block.level || 2}`) as any;
      const cls = (block.level === 1)
        ? 'font-display text-4xl sm:text-5xl lg:text-6xl leading-[1.05] mb-5'
        : (block.level === 2)
          ? 'font-display text-3xl sm:text-4xl'
          : 'font-display text-xl sm:text-2xl';
      return <Tag className={cls}>{block.text}</Tag>;
    }
    case 'paragraph':
      return <p className="text-muted-foreground leading-relaxed">{block.text}</p>;
    case 'list':
      return block.ordered ? (
        <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
          {block.items.map((i, idx) => <li key={idx} className="leading-relaxed">{i}</li>)}
        </ol>
      ) : (
        <ul className="space-y-2">
          {block.items.map((i, idx) => (
            <li key={idx} className="flex items-start gap-2 text-muted-foreground">
              <Check className="w-4 h-4 text-gold mt-1 shrink-0" />
              <span>{i}</span>
            </li>
          ))}
        </ul>
      );
    case 'image':
      return (
        <figure className="my-4">
          <div className="relative aspect-video overflow-hidden rounded-2xl">
            <Image src={block.src} alt={block.alt || ''} fill sizes="(max-width:768px) 100vw, 768px" className="object-cover" />
          </div>
          {block.caption && <figcaption className="text-sm text-muted-foreground text-center mt-2">{block.caption}</figcaption>}
        </figure>
      );
    case 'cta':
      return (
        <Button asChild variant={block.variant === 'outline' ? 'outline' : 'default'} className={block.variant !== 'outline' ? 'bg-gold text-primary-foreground hover:bg-gold/90' : ''}>
          <Link href={block.href}>{block.text}</Link>
        </Button>
      );
    case 'quote':
      return (
        <blockquote className="border-l-4 border-gold pl-4 py-1 my-2">
          <p className="italic text-muted-foreground">«{block.text}»</p>
          {block.author && <footer className="text-sm text-muted-foreground mt-1">— {block.author}</footer>}
        </blockquote>
      );
    case 'stats':
      return (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {block.items.map((s, i) => (
            <div key={i} className="rounded-xl border border-border bg-card/50 p-4 text-center">
              <div className="font-display text-2xl text-gold">{s.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      );
    case 'divider':
      return <hr className="border-border my-4" />;
    case 'faq':
      return null; // FAQ рендерим отдельно через FaqAccordion для микроразметки
    default:
      return null;
  }
}

// Рендер набора блоков (кроме FAQ — его обрабатываем отдельно)
export function PageBlocks({ blocks }: { blocks: PageBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.filter((b) => b.type !== 'faq').map((b, i) => <Block key={i} block={b} />)}
    </div>
  );
}

// Извлечь FAQ из блоков (для микроразметки)
export function extractFaq(blocks: PageBlock[]): { q: string; a: string }[] {
  for (const b of blocks) {
    if (b.type === 'faq') return b.items;
  }
  return [];
}

// Серверный хелпер: получить блоки страницы по slug (или null)
export async function getPageBlocks(slug: string): Promise<PageBlock[] | null> {
  const p = await getPage(slug);
  return p?.blocks || null;
}
