import { getPromosForPage } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { Gift, Sparkles } from 'lucide-react';
import { formatPrice } from '@/lib/format';

// Серверный компонент: подтягивает активные промо для страницы из БД
export async function PromoStrip({ page }: { page: string }) {
  const promos = await getPromosForPage(page);
  if (!promos.length) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 mt-4 mb-2">
      <div className="space-y-2">
        {promos.map((p) => (
          <div
            key={p.id}
            className="relative overflow-hidden rounded-xl border border-gold/30 bg-gradient-to-r from-gold/10 via-card to-card p-4 flex items-center gap-3"
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gold/15 shrink-0">
              {p.discount ? <Sparkles className="w-5 h-5 text-gold" /> : <Gift className="w-5 h-5 text-gold" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-medium">{p.title}</span>
                {p.discount ? (
                  <Badge className="bg-gold text-primary-foreground border-0">−{p.discount}%</Badge>
                ) : null}
              </div>
              {p.description && (
                <p className="text-sm text-muted-foreground mt-0.5 line-clamp-1">{p.description}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Вспомогательный текст цены для использования в карточках (если нужно)
export { formatPrice };
