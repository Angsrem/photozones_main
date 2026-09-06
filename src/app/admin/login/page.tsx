'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api } from '../_lib';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState('admin@fotozona24.ru');
  const [password, setPassword] = React.useState('admin123');
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await api('/api/admin/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      router.replace('/admin');
    } catch (err: any) {
      setError(err?.message || 'Не удалось войти');
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
              disabled={loading}
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
              disabled={loading}
            />
          </div>

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
            ) : (
              'Войти'
            )}
          </Button>

          <div className="text-xs text-muted-foreground text-center pt-2 border-t">
            Демо-доступ: <code className="font-mono">admin@fotozona24.ru</code> /{' '}
            <code className="font-mono">admin123</code>
          </div>
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
