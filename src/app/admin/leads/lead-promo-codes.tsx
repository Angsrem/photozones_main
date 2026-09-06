'use client';

import * as React from 'react';
import { toast } from 'sonner';
import { Gift, Loader2, Copy, MessageCircle, Send, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { api } from '../_lib';

type PromoCode = {
  id: string;
  code: string;
  discountPct: number;
  status: string;
  expiresAt: string;
  createdAt: string;
  usedAt: string | null;
  waCodeIssued?: string;
  waLink?: string;
};

type Templates = {
  day_after: string;
  reminder: string;
  photo_no_review: string;
  negative: string;
};

export function LeadPromoCodes({ leadId, leadName, leadPhone }: { leadId: string; leadName: string; leadPhone: string }) {
  const [promoCodes, setPromoCodes] = React.useState<PromoCode[]>([]);
  const [templates, setTemplates] = React.useState<Templates | null>(null);
  const [waBase, setWaBase] = React.useState('');
  const [loading, setLoading] = React.useState(true);
  const [issuing, setIssuing] = React.useState(false);
  const [showTemplates, setShowTemplates] = React.useState(false);
  const [activeTemplate, setActiveTemplate] = React.useState<keyof Templates>('day_after');
  const [templateText, setTemplateText] = React.useState('');

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const data = await api<{ promoCodes: PromoCode[]; templates: Templates; waBase: string }>(`/api/admin/leads/${leadId}/promo-codes`);
      setPromoCodes(data.promoCodes);
      setTemplates(data.templates);
      setWaBase(data.waBase);
      setTemplateText(data.templates.day_after);
    } catch (e: any) {
      // тихо — возможно нет доступа
    } finally {
      setLoading(false);
    }
  }, [leadId]);

  React.useEffect(() => { load(); }, [load]);

  const issue = async () => {
    setIssuing(true);
    try {
      const res = await api<{ ok: boolean; code: string; expiresAt: string; discountPct: number }>('/api/admin/promo-codes', {
        method: 'POST',
        body: JSON.stringify({ leadId, discountPct: 5 }),
      });
      toast.success(`Промокод выдан: ${res.code}`);
      load();
    } catch (e: any) {
      toast.error(e?.message || 'Ошибка');
    } finally {
      setIssuing(false);
    }
  };

  const copyText = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Скопировано');
  };

  const waLinkForTemplate = (text: string) => {
    const digits = (leadPhone || '').replace(/\D/g, '');
    const phone = digits.startsWith('7') ? digits : '7' + digits.replace(/^8/, '');
    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  if (loading) return <div className="text-xs text-muted-foreground py-2">Загрузка промокодов…</div>;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5"><Gift className="size-4 text-gold" /> Промокоды за отзывы</Label>
        <Button size="sm" variant="outline" onClick={issue} disabled={issuing} className="gap-1.5 h-7 text-xs">
          {issuing ? <Loader2 className="size-3 animate-spin" /> : <Gift className="size-3" />}
          Выдать промокод
        </Button>
      </div>

      {/* Список промокодов */}
      {promoCodes.length > 0 && (
        <div className="space-y-1.5">
          {promoCodes.map((pc) => (
            <div key={pc.id} className="rounded-lg border border-border p-2.5 text-xs space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <code className="font-mono font-bold text-sm bg-muted px-2 py-0.5 rounded">{pc.code}</code>
                <Badge variant={pc.status === 'ACTIVE' ? 'default' : pc.status === 'USED' ? 'secondary' : 'outline'}>
                  {pc.status === 'ACTIVE' ? 'Активен' : pc.status === 'USED' ? 'Использован' : 'Истёк'}
                </Badge>
              </div>
              <div className="text-muted-foreground">
                {pc.discountPct}% · до {new Date(pc.expiresAt).toLocaleDateString('ru-RU')}
                {pc.usedAt && ` · использован ${new Date(pc.usedAt).toLocaleDateString('ru-RU')}`}
              </div>
              {pc.status === 'ACTIVE' && pc.waLink && (
                <div className="flex gap-1.5 pt-1">
                  <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => copyText(pc.waCodeIssued || '')}>
                    <Copy className="size-3" /> Копировать
                  </Button>
                  <Button size="sm" asChild className="h-7 text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                    <a href={pc.waLink} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="size-3" /> Отправить в WhatsApp
                    </a>
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Шаблоны WhatsApp-сообщений */}
      <div className="rounded-lg border border-border">
        <button
          type="button"
          onClick={() => setShowTemplates(!showTemplates)}
          className="w-full flex items-center justify-between p-2.5 text-xs font-medium hover:bg-accent"
        >
          <span className="flex items-center gap-1.5"><MessageCircle className="size-3.5 text-emerald-600" /> Шаблоны WhatsApp</span>
          <span className="text-muted-foreground">{showTemplates ? '▲' : '▼'}</span>
        </button>
        {showTemplates && templates && (
          <div className="p-2.5 border-t space-y-2">
            <div className="flex flex-wrap gap-1">
              {([
                ['day_after', 'День X+1'],
                ['reminder', 'Напоминание'],
                ['photo_no_review', 'Фото без отзыва'],
                ['negative', 'Недоволен'],
              ] as const).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => { setActiveTemplate(key); setTemplateText(templates[key]); }}
                  className={`px-2 py-1 rounded text-xs ${activeTemplate === key ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <Textarea
              rows={5}
              value={templateText}
              onChange={(e) => setTemplateText(e.target.value)}
              className="text-xs resize-none"
            />
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" className="h-7 text-xs gap-1" onClick={() => copyText(templateText)}>
                <Copy className="size-3" /> Копировать
              </Button>
              <Button size="sm" asChild className="h-7 text-xs gap-1 bg-emerald-600 text-white hover:bg-emerald-700">
                <a href={waLinkForTemplate(templateText)} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="size-3" /> В WhatsApp
                </a>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
