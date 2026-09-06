import { Gift, Star, Users, Clock } from 'lucide-react';

export function ReviewForPromoBlock() {
  return (
    <section className="container mx-auto max-w-4xl px-4 py-12">
      <div className="relative overflow-hidden rounded-2xl border border-gold/30 bg-gradient-to-br from-card via-card to-gold/10 p-6 sm:p-10">
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-gold/10 blur-3xl" />
        <div className="relative">
          <div className="flex items-center gap-2 mb-4">
            <Gift className="w-8 h-8 text-gold" />
            <span className="text-xs font-semibold uppercase tracking-widest text-gold">Отзыв → скидка</span>
          </div>
          <h2 className="font-display text-2xl sm:text-3xl mb-3">Отзыв на Яндекс Картах — скидка 5% на следующий праздник</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            После мероприятия оставьте отзыв на Яндекс Картах или 2ГИС и отправьте нам пару фото —
            подарим персональный промокод на 5%. Можно использовать сами или передать другу — он скажет вам спасибо.
          </p>

          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <Star className="w-6 h-6 text-gold mb-2" />
              <div className="font-medium mb-1">Любой отзыв</div>
              <p className="text-xs text-muted-foreground">Оставьте отзыв любого содержания на Яндекс Картах или 2ГИС</p>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <Gift className="w-6 h-6 text-gold mb-2" />
              <div className="font-medium mb-1">Промокод 5%</div>
              <p className="text-xs text-muted-foreground">Персональный код FOTO-XXXX на любой следующий заказ</p>
            </div>
            <div className="rounded-xl border border-border bg-card/50 p-4">
              <Users className="w-6 h-6 text-gold mb-2" />
              <div className="font-medium mb-1">Можно подарить</div>
              <p className="text-xs text-muted-foreground">Передайте код другу — он получит скидку, вы ничего не теряете</p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="w-4 h-4 text-gold" />
            <span>Промокод действует 12 месяцев. Одноразовый, не суммируется с другими акциями.</span>
          </div>
        </div>
      </div>
    </section>
  );
}
