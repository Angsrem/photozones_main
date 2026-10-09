'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, ArrowLeft, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '../_lib';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [totpCode, setTotpCode] = React.useState('');
  const [needsTotp, setNeedsTotp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password, totpCode: needsTotp ? totpCode : undefined }),
      });
      router.replace('/admin');
    } catch (err: any) {
      const body = err?.body || {};
      if (body.needsTotp) {
        // Пароль верный — нужен 2FA-код.
        setNeedsTotp(true);
        setError(null);
        // Сфокусировать инпут кода на следующем тике.
        setTimeout(() => document.getElementById('totpCode')?.focus(), 50);
      } else {
        setError(body.error || err?.message || 'Не удалось войти');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-muted/40 via-background to-accent/40">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-6">
          <div className="flex size-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="mt-4 font-display text-2xl font-semibold">Вход в админ-панель</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            ФотоЗона24 · управление заявками, календарём и фотозонами
          </p>
        </div>

        <form
          onSubmit={onSubmit}
          className="bg-card border rounded-xl shadow-sm p-6 space-y-4"
        >
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="username"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@fotozona24.ru"
              disabled={loading || needsTotp}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Пароль</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || needsTotp}
            />
          </div>

          {needsTotp && (
            <div className="space-y-1.5">
              <Label htmlFor="totpCode" className="flex items-center gap-1.5">
                <KeyRound className="size-3.5" /> Код 2FA (6 цифр)
              </Label>
              <Input
                id="totpCode"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                pattern="\d{6}"
                maxLength={6}
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                disabled={loading}
                className="text-center text-lg tracking-[0.4em] font-mono"
              />
              <p className="text-xs text-muted-foreground">
                Откройте приложение аутентификации (Google Authenticator / Authy) и введите текущий код.
              </p>
              <button
                type="button"
                onClick={() => {
                  setNeedsTotp(false);
                  setTotpCode('');
                  setError(null);
                }}
                className="text-xs text-primary hover:underline"
              >
                ← Ввести другой пароль
              </button>
            </div>
          )}

          {error && (
            <div className="text-sm rounded-md bg-destructive/10 border border-destructive/30 text-destructive px-3 py-2">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="size-4 mr-2 animate-spin" /> Вход…
              </>
            ) : needsTotp ? (
              'Подтвердить вход'
            ) : (
              'Войти'
            )}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-3.5" /> Вернуться на сайт
          </Link>
        </div>
      </div>
    </div>
  );
}
