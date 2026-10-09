'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  ShieldCheck,
  ShieldX,
  KeyRound,
  Loader2,
  Copy,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '../_lib';

type SettingsState = {
  manager: { id: string; email: string; name: string; role: string };
  has2fa: boolean;
};

type GeneratedSecret = {
  secret: string;
  otpAuthUrl: string;
  previewCode: string;
};

export default function AdminSettingsPage() {
  const [state, setState] = React.useState<SettingsState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // Шаг включения: 'idle' → 'showSecret' (секрет показан, ждём код) → done
  const [step, setStep] = React.useState<'idle' | 'showSecret'>('idle');
  const [generated, setGenerated] = React.useState<GeneratedSecret | null>(null);
  const [confirmCode, setConfirmCode] = React.useState('');
  const [busy, setBusy] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  // Отключение 2FA
  const [disablePassword, setDisablePassword] = React.useState('');
  const [disableOpen, setDisableOpen] = React.useState(false);

  const load = React.useCallback(async () => {
    setLoading(true);
    setErr(null);
    try {
      const data = await api<SettingsState>('/api/admin/settings');
      setState(data);
      if (!data.has2fa) {
        setStep('idle');
        setGenerated(null);
      }
    } catch (e: any) {
      setErr(e?.message || 'Не удалось загрузить настройки');
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const startEnable = async () => {
    setBusy(true);
    setErr(null);
    try {
      const res = await api<GeneratedSecret>('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ action: 'generate' }),
      });
      setGenerated(res);
      setStep('showSecret');
      setConfirmCode('');
      setCopied(false);
      toast.success('Новый секрет сгенерирован');
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось создать секрет');
    } finally {
      setBusy(false);
    }
  };

  const confirmEnable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!generated) return;
    setBusy(true);
    setErr(null);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ action: 'confirm', secret: generated.secret, code: confirmCode }),
      });
      toast.success('2FA включена');
      setStep('idle');
      setGenerated(null);
      setConfirmCode('');
      await load();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Не удалось включить 2FA');
    } finally {
      setBusy(false);
    }
  };

  const cancelEnable = () => {
    setStep('idle');
    setGenerated(null);
    setConfirmCode('');
    setCopied(false);
  };

  const doDisable = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      await api('/api/admin/settings', {
        method: 'POST',
        body: JSON.stringify({ action: 'disable', password: disablePassword }),
      });
      toast.success('2FA отключена');
      setDisableOpen(false);
      setDisablePassword('');
      await load();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Не удалось отключить 2FA');
    } finally {
      setBusy(false);
    }
  };

  const copySecret = async () => {
    if (!generated) return;
    try {
      await navigator.clipboard.writeText(generated.secret);
      setCopied(true);
      toast.success('Секрет скопирован');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('Не удалось скопировать');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка…
      </div>
    );
  }
  if (err || !state) {
    return (
      <Card>
        <CardContent className="py-10 text-center text-sm text-destructive">
          {err || 'Нет данных'}
          <div className="mt-3">
            <Button variant="outline" onClick={load}>Повторить</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Настройки</h1>
        <p className="text-sm text-muted-foreground">
          Двухфакторная аутентификация и безопасность аккаунта.
        </p>
      </div>

      {/* Профиль */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Профиль менеджера</CardTitle>
          <CardDescription>Учётная запись, под которой выполнен вход</CardDescription>
        </CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-xs text-muted-foreground">Имя</div>
            <div className="font-medium mt-0.5">{state.manager.name}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Email</div>
            <div className="font-medium mt-0.5 break-all">{state.manager.email}</div>
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Роль</div>
            <Badge variant="outline" className="mt-0.5">{state.manager.role}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* 2FA */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <KeyRound className="size-4 text-primary" /> Двухфакторная аутентификация (2FA)
          </CardTitle>
          <CardDescription>
            Дополнительный 6-значный код из приложения-аутентификатора при входе. Защищает аккаунт от компрометации пароля.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Текущий статус */}
          <div className="flex items-center gap-3 flex-wrap">
            <Badge
              variant="outline"
              className={
                state.has2fa
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                  : 'bg-amber-50 text-amber-700 border-amber-300'
              }
            >
              {state.has2fa ? (
                <>
                  <ShieldCheck className="size-3 mr-1" /> 2FA включена
                </>
              ) : (
                <>
                  <ShieldX className="size-3 mr-1" /> 2FA выключена
                </>
              )}
            </Badge>
            {!state.has2fa && (
              <Button onClick={startEnable} disabled={busy || step === 'showSecret'}>
                Включить 2FA
              </Button>
            )}
            {state.has2fa && !disableOpen && (
              <Button variant="outline" onClick={() => setDisableOpen(true)}>
                Отключить 2FA
              </Button>
            )}
          </div>

          {/* Шаг настройки: показать секрет + форму кода */}
          {step === 'showSecret' && generated && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-4 space-y-4">
              <div className="flex items-start gap-2 text-sm">
                <AlertCircle className="size-4 text-primary shrink-0 mt-0.5" />
                <div>
                  <b>Шаг 1.</b> Добавьте аккаунт в приложение-аутентификатор (Google Authenticator, Authy, 1Password и т. п.), используя этот секрет. Или введите его вручную как «TOTP / Time-based», 6 цифр, интервал 30 сек.
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Секрет (base32)</Label>
                <div className="flex items-stretch gap-2">
                  <Input
                    readOnly
                    value={generated.secret}
                    className="font-mono text-base tracking-wider"
                  />
                  <Button type="button" variant="outline" onClick={copySecret} className="shrink-0">
                    {copied ? <CheckCircle2 className="size-4 text-emerald-600" /> : <Copy className="size-4" />}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground break-all">
                  otpauth:// URL: <code className="bg-muted px-1 rounded">{generated.otpAuthUrl}</code>
                </p>
                <div className="rounded-md bg-amber-50 border border-amber-200 px-3 py-2 text-xs text-amber-800 mt-2">
                  <b>Текущий код для проверки:</b>{' '}
                  <code className="font-mono text-base tracking-wider">{generated.previewCode}</code>{' '}
                  <span className="text-amber-700">(обновляется каждые 30 секунд)</span>
                </div>
              </div>

              <form onSubmit={confirmEnable} className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="confirmCode">Шаг 2. Введите текущий 6-значный код, чтобы подтвердить</Label>
                  <Input
                    id="confirmCode"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    pattern="\d{6}"
                    maxLength={6}
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="123456"
                    className="text-center text-lg tracking-[0.4em] font-mono"
                    required
                    disabled={busy}
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={busy || confirmCode.length !== 6}>
                    {busy ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                    Подтвердить и включить
                  </Button>
                  <Button type="button" variant="ghost" onClick={cancelEnable} disabled={busy}>
                    Отмена
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Отключение 2FA */}
          {state.has2fa && disableOpen && (
            <form onSubmit={doDisable} className="rounded-lg border border-rose-300 bg-rose-50 p-4 space-y-3">
              <div className="flex items-start gap-2 text-sm text-rose-800">
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <div>
                  Отключение 2FA снизит защиту аккаунта. Для подтверждения введите пароль менеджера.
                </div>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="disablePwd">Пароль</Label>
                <Input
                  id="disablePwd"
                  type="password"
                  autoComplete="current-password"
                  value={disablePassword}
                  onChange={(e) => setDisablePassword(e.target.value)}
                  required
                  disabled={busy}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" variant="destructive" disabled={busy || !disablePassword}>
                  {busy ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
                  Отключить 2FA
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setDisableOpen(false); setDisablePassword(''); }} disabled={busy}>
                  Отмена
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Информационный блок */}
      <Card>
        <CardContent className="p-5 text-sm text-muted-foreground space-y-2">
          <p className="font-medium text-foreground">Как работает 2FA:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>При входе в админ-панель, после ввода email и пароля, требуется 6-значный код.</li>
            <li>Код генерируется приложением-аутентификатором каждые 30 секунд по алгоритму TOTP (RFC 6238).</li>
            <li>Без доступа к приложению войти в админку невозможно, даже зная пароль.</li>
            <li>Секрет хранится в БД в зашифрованном виде и используется только для проверки кодов.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
