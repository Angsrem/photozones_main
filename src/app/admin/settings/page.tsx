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
  User as UserIcon,
  Mail,
  Phone,
  Camera,
  Save,
  MailCheck,
  MailWarning,
  Trash2,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { api } from '../_lib';

type ProfileData = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  avatar: string | null;
};

type SettingsState = {
  manager: { id: string; email: string; name: string; role: string };
  has2fa: boolean;
};

type GeneratedSecret = {
  secret: string;
  otpAuthUrl: string;
  previewCode: string;
};

type NotifyStatus = {
  telegram: { configured: boolean; chatId: string | null };
  email: {
    configured: boolean;
    to: string;
    count: number;
    from: string | null;
    host: string | null;
    port: number | null;
  };
};

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

export default function AdminSettingsPage() {
  const [state, setState] = React.useState<SettingsState | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [err, setErr] = React.useState<string | null>(null);

  // Профиль
  const [profile, setProfile] = React.useState<ProfileData | null>(null);
  const [profileName, setProfileName] = React.useState('');
  const [profilePhone, setProfilePhone] = React.useState('');
  const [avatarFile, setAvatarFile] = React.useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = React.useState<string | null>(null);
  const [savingProfile, setSavingProfile] = React.useState(false);
  const [uploadingAvatar, setUploadingAvatar] = React.useState(false);

  // Email-уведомления
  const [notifyEmails, setNotifyEmails] = React.useState<string[]>([]);
  const [notifyInput, setNotifyInput] = React.useState('');
  const [notifyStatus, setNotifyStatus] = React.useState<NotifyStatus | null>(null);
  const [savingNotify, setSavingNotify] = React.useState(false);

  // Шаг включения 2FA: 'idle' → 'showSecret' (секрет показан, ждём код) → done
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
      const [settingsRes, profileRes, notifyRes] = await Promise.all([
        api<SettingsState>('/api/admin/settings'),
        api<{ profile: ProfileData }>('/api/admin/profile'),
        api<NotifyStatus>('/api/admin/notify-status').catch(() => null),
      ]);
      setState(settingsRes);
      setProfile(profileRes.profile);
      setProfileName(profileRes.profile.name);
      setProfilePhone(profileRes.profile.phone || '');
      setAvatarPreview(profileRes.profile.avatar);
      if (!settingsRes.has2fa) {
        setStep('idle');
        setGenerated(null);
      }
      if (notifyRes) {
        setNotifyStatus(notifyRes);
        // Уведомления доступны только ADMIN — грузим список, если роль администратора
        if (settingsRes.manager.role === 'ADMIN') {
          try {
            const list = await api<{ emails: string[] }>('/api/admin/settings/notify');
            setNotifyEmails(list.emails);
            setNotifyInput(list.emails.join(', '));
          } catch (e: any) {
            // MANAGER не имеет доступа — оставляем пусто
          }
        }
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

  // ===== Профиль: сохранение имени + телефона =====
  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileName.trim()) return toast.error('Имя не может быть пустым');
    setSavingProfile(true);
    try {
      const res = await api<{ profile: ProfileData }>('/api/admin/profile', {
        method: 'PATCH',
        body: JSON.stringify({
          name: profileName.trim(),
          phone: profilePhone.trim() || null,
        }),
      });
      setProfile(res.profile);
      setProfileName(res.profile.name);
      setProfilePhone(res.profile.phone || '');
      toast.success('Профиль сохранён');
      // Перезагрузим layout, чтобы имя в шапке обновилось
      window.location.reload();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Не удалось сохранить');
    } finally {
      setSavingProfile(false);
    }
  };

  // ===== Аватар: загрузка =====
  const onPickAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/image\/(jpeg|png|webp|gif)/.test(f.type)) {
      toast.error('Допустимы только изображения JPEG/PNG/WebP/GIF');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      toast.error('Макс. размер файла 8 МБ');
      return;
    }
    setAvatarFile(f);
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const uploadAvatar = async () => {
    if (!avatarFile) return;
    setUploadingAvatar(true);
    try {
      const fd = new FormData();
      fd.append('file', avatarFile);
      const res = await fetch('/api/admin/profile/avatar', {
        method: 'POST',
        body: fd,
        credentials: 'include',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || `HTTP ${res.status}`);
      setAvatarPreview(data.avatar);
      setAvatarFile(null);
      setProfile((p) => (p ? { ...p, avatar: data.avatar } : p));
      toast.success('Аватар загружен');
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось загрузить аватар');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    if (!profile?.avatar) return;
    try {
      await api('/api/admin/profile/avatar', { method: 'DELETE' });
      setAvatarPreview(null);
      setProfile((p) => (p ? { ...p, avatar: null } : p));
      toast.success('Аватар удалён');
      window.location.reload();
    } catch (e: any) {
      toast.error(e?.message || 'Не удалось удалить аватар');
    }
  };

  // ===== Уведомления: сохранение списка emails =====
  const saveNotify = async () => {
    setSavingNotify(true);
    try {
      const res = await api<{ emails: string[] }>('/api/admin/settings/notify', {
        method: 'PUT',
        body: JSON.stringify({ emails: notifyInput }),
      });
      setNotifyEmails(res.emails);
      setNotifyInput(res.emails.join(', '));
      toast.success(`Сохранено адресов: ${res.emails.length}`);
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Не удалось сохранить');
    } finally {
      setSavingNotify(false);
    }
  };

  // ===== 2FA: generate =====
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

  const isAdmin = state.manager.role === 'ADMIN';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-display text-2xl font-semibold">Настройки</h1>
        <p className="text-sm text-muted-foreground">
          Профиль, уведомления и безопасность аккаунта.
        </p>
      </div>

      {/* Профиль — редактируемый блок */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon className="size-4 text-primary" /> Профиль
          </CardTitle>
          <CardDescription>Имя и телефон видны в шапке админки. Email нельзя изменить.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-5">
            {/* Аватар */}
            <div className="flex items-center gap-4">
              <Avatar className="size-20 border">
                {avatarPreview && <AvatarImage src={avatarPreview} alt={profileName} />}
                <AvatarFallback className="bg-primary/15 text-primary text-xl font-semibold">
                  {initials(profileName)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <label htmlFor="avatar-input">
                    <Button type="button" variant="outline" size="sm" className="gap-2 cursor-pointer" asChild>
                      <span>
                        <Camera className="size-4" /> Выбрать файл
                      </span>
                    </Button>
                  </label>
                  <input
                    id="avatar-input"
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    onChange={onPickAvatar}
                    className="hidden"
                  />
                  {avatarFile && (
                    <Button type="button" size="sm" onClick={uploadAvatar} disabled={uploadingAvatar} className="gap-2">
                      {uploadingAvatar ? <Loader2 className="size-4 animate-spin" /> : null}
                      Загрузить
                    </Button>
                  )}
                  {profile?.avatar && !avatarFile && (
                    <Button type="button" variant="ghost" size="sm" onClick={removeAvatar} className="gap-2 text-destructive">
                      <Trash2 className="size-4" /> Удалить
                    </Button>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  JPEG/PNG/WebP/GIF, до 8 МБ. Будет сжат до 200×200.
                </p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="pf-name">Имя *</Label>
                <Input id="pf-name" value={profileName} onChange={(e) => setProfileName(e.target.value)} placeholder="Иван Иванов" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="pf-phone" className="flex items-center gap-1">
                  <Phone className="size-3" /> Телефон
                </Label>
                <Input id="pf-phone" value={profilePhone} onChange={(e) => setProfilePhone(e.target.value)} placeholder="+7 (999) 000-00-00" />
              </div>
              <div className="space-y-1.5 sm:col-span-2">
                <Label htmlFor="pf-email" className="flex items-center gap-1">
                  <Mail className="size-3" /> Email
                </Label>
                <Input id="pf-email" value={profile?.email || ''} readOnly disabled className="bg-muted/40" />
                <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <Button type="submit" disabled={savingProfile} className="gap-2">
                {savingProfile ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
                Сохранить
              </Button>
              <Badge variant="outline" className="ml-auto">{state.manager.role}</Badge>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Email-уведомления (только для ADMIN) */}
      {isAdmin && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Mail className="size-4 text-primary" /> Уведомления по email
            </CardTitle>
            <CardDescription>
              Список адресов, на которые дублируются новые заявки. Email отправляется через Beget SMTP (Nodemailer).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            {/* SMTP статус */}
            <div className={`rounded-lg border p-3 ${notifyStatus?.email.configured ? 'border-emerald-300 bg-emerald-50' : 'border-rose-300 bg-rose-50'}`}>
              <div className="flex items-center gap-2 mb-1">
                {notifyStatus?.email.configured ? (
                  <MailCheck className="size-4 text-emerald-600" />
                ) : (
                  <MailWarning className="size-4 text-rose-600" />
                )}
                <span className="text-sm font-medium">SMTP {notifyStatus?.email.configured ? 'настроен' : 'не настроен'}</span>
                <Badge
                  variant="outline"
                  className={
                    notifyStatus?.email.configured
                      ? 'bg-emerald-100 text-emerald-700 border-emerald-300'
                      : 'bg-rose-100 text-rose-700 border-rose-300'
                  }
                >
                  {notifyStatus?.email.configured ? 'Активен' : 'Не настроен'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {notifyStatus?.email.configured
                  ? `Хост: ${notifyStatus?.email.host}:${notifyStatus?.email.port || 465} · от: ${notifyStatus?.email.from || '—'} · получателей: ${notifyStatus?.email.count ?? 0}`
                  : 'Добавьте в .env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, SMTP_FROM'}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="nf-emails">Адреса для уведомлений</Label>
              <Input
                id="nf-emails"
                value={notifyInput}
                onChange={(e) => setNotifyInput(e.target.value)}
                placeholder="order@fotoarka.ru, manager@fotoarka.ru"
              />
              <p className="text-xs text-muted-foreground">
                Вводите через запятую. Сейчас сохранено: {notifyEmails.length}.
              </p>
            </div>
            <Button onClick={saveNotify} disabled={savingNotify} className="gap-2">
              {savingNotify ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}
              Сохранить адреса
            </Button>
          </CardContent>
        </Card>
      )}

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

          {/* Шаг настройки: показать секрет + форма кода */}
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
