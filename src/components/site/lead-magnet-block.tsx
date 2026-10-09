import { db } from '@/lib/db';
import { LeadMagnetModal } from './lead-magnet-modal';

// Серверный блок лид-магнита. Тянет магнит из БД по slug.
// Если магнит не найден или неактивен — ничего не рендерит (молча).
// Кнопка «Скачать PDF» открывает клиентскую модалку с формой (имя, телефон, email).
export async function LeadMagnetBlock({
  slug,
  sourcePage,
}: {
  slug: string;
  sourcePage: string;
}) {
  const magnet = await db.leadMagnet.findUnique({ where: { slug } });
  if (!magnet || !magnet.isActive) return null;

  return (
    <section className="container mx-auto max-w-7xl px-4 py-8" aria-label="Бесплатный гайд">
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-gold/10 via-card to-card p-6 sm:p-8">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-gold/10 blur-3xl" aria-hidden />
        <div className="relative flex flex-col lg:flex-row items-start lg:items-center gap-5 lg:gap-8 justify-between">
          <div className="flex items-start gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gold/15 flex items-center justify-center shrink-0" aria-hidden>
              {/* Иконка — буква PDF в золотом круге */}
              <span className="font-display text-xs font-bold text-gold tracking-wider">PDF</span>
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
                Бесплатный гайд
              </div>
              <h2 className="font-display text-xl sm:text-2xl mb-2">{magnet.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{magnet.description}</p>
            </div>
          </div>
          <LeadMagnetModal
            slug={magnet.slug}
            title={magnet.title}
            fileUrl={magnet.fileUrl}
            occasion={magnet.occasion}
            sourcePage={sourcePage}
          />
        </div>
      </div>
    </section>
  );
}
