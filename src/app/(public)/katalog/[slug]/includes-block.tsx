import { Check, Truck, Wrench, PackageOpen } from 'lucide-react';

/**
 * Блок «Состав фотозоны — что входит».
 *
 * Из поля includes (массив строк) — список с золотыми иконками-галочками.
 * Доставка, монтаж, демонтаж — отдельным блоком (как логистика).
 *
 * Server Component (статичный).
 */
export function IncludesBlock({
  includes,
  className = '',
}: {
  includes: string[];
  className?: string;
}) {
  if (!includes || includes.length === 0) return null;

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2">
        <PackageOpen className="w-5 h-5 text-gold" />
        <h2 className="font-display text-lg">Что входит в стоимость</h2>
      </div>

      {/* Список includes с золотыми галочками */}
      <ul className="space-y-2">
        {includes.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm leading-relaxed">
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-gold/15 text-gold shrink-0 mt-0.5">
              <Check className="w-3.5 h-3.5" />
            </span>
            <span className="text-foreground/90">{item}</span>
          </li>
        ))}
      </ul>

      {/* Отдельный блок: логистика (доставка/монтаж/демонтаж) */}
      <div className="rounded-xl border border-gold/30 bg-gold/5 p-4 mt-3">
        <div className="flex items-center gap-2 mb-2">
          <Truck className="w-4 h-4 text-gold" />
          <span className="text-sm font-semibold">Логистика включена</span>
        </div>
        <ul className="space-y-1.5 text-sm">
          <li className="flex items-center gap-2 text-muted-foreground">
            <Wrench className="w-3.5 h-3.5 text-gold shrink-0" /> Монтаж за 1 час
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <PackageOpen className="w-3.5 h-3.5 text-gold shrink-0" /> Демонтаж после мероприятия
          </li>
          <li className="flex items-center gap-2 text-muted-foreground">
            <Truck className="w-3.5 h-3.5 text-gold shrink-0" /> Доставка по Красноярску
          </li>
        </ul>
      </div>
    </div>
  );
}
