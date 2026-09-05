'use client';

import * as React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Inbox,
  CalendarDays,
  Images,
  LogOut,
  Menu,
  ShieldCheck,
  Loader2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetClose } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { api, type Manager } from './_lib';

const NAV = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard },
  { href: '/admin/leads', label: 'Заявки', icon: Inbox },
  { href: '/admin/calendar', label: 'Календарь', icon: CalendarDays },
  { href: '/admin/photozones', label: 'Фотозоны', icon: Images },
];

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || 'A';
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [manager, setManager] = React.useState<Manager | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isLoginPage = pathname === '/admin/login';

  // проверка сессии
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await api<{ manager: Manager | null }>('/api/admin/me');
        if (cancelled) return;
        if (!data.manager) {
          if (!isLoginPage) router.replace('/admin/login');
          setManager(null);
        } else {
          setManager(data.manager);
          if (isLoginPage) router.replace('/admin');
        }
      } catch {
        if (cancelled) return;
        if (!isLoginPage) router.replace('/admin/login');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isLoginPage, router]);

  // страница логина — отдельная, без сайдбара
  if (isLoginPage) {
    return (
      <div className="light min-h-screen bg-background text-foreground">{children}</div>
    );
  }

  // лоадер пока проверяем сессию
  if (loading) {
    return (
      <div className="light min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-muted-foreground">
          <Loader2 className="size-7 animate-spin text-primary" />
          <span className="text-sm">Проверка доступа…</span>
        </div>
      </div>
    );
  }

  if (!manager) {
    // редирект уже запущен; покажем лоадер чтобы не мигало
    return (
      <div className="light min-h-screen bg-background text-foreground flex items-center justify-center">
        <Loader2 className="size-6 animate-spin text-primary" />
      </div>
    );
  }

  const onLogout = async () => {
    try {
      await api('/api/admin/me', { method: 'DELETE' });
    } catch {}
    router.replace('/admin/login');
  };

  const NavList = ({ onNavigate }: { onNavigate?: () => void }) => (
    <nav className="flex flex-col gap-1 p-3">
      {NAV.map((item) => {
        const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? 'bg-primary text-primary-foreground'
                : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon className="size-4" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  const HeaderRight = (
    <div className="flex items-center gap-3">
      <div className="hidden sm:flex items-center gap-2">
        <Avatar className="size-8">
          <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
            {initials(manager.name)}
          </AvatarFallback>
        </Avatar>
        <div className="text-right leading-tight">
          <div className="text-sm font-medium">{manager.name}</div>
          <div className="text-xs text-muted-foreground">{manager.email}</div>
        </div>
      </div>
      <Button variant="outline" size="sm" onClick={onLogout} className="gap-2">
        <LogOut className="size-4" />
        <span className="hidden sm:inline">Выйти</span>
      </Button>
    </div>
  );

  return (
    <div className="light min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen">
        {/* Десктоп-сайдбар */}
        <aside className="hidden lg:flex w-64 shrink-0 flex-col border-r bg-sidebar">
          <div className="flex items-center gap-2 px-5 h-16 border-b">
            <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <ShieldCheck className="size-5" />
            </div>
            <div className="leading-tight">
              <div className="font-display text-base font-semibold">ФотоЗона24</div>
              <div className="text-xs text-muted-foreground">Админ-панель</div>
            </div>
          </div>
          <NavList />
          <div className="mt-auto p-3 text-xs text-muted-foreground border-t">
            Версия 1.0 · {new Date().getFullYear()}
          </div>
        </aside>

        {/* Мобильный сайдбар */}
        <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
          <div className="flex-1 flex flex-col min-w-0">
            <header className="h-16 border-b flex items-center justify-between px-3 sm:px-6 bg-card">
              <div className="flex items-center gap-2">
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu className="size-5" />
                  </Button>
                </SheetTrigger>
                <div className="flex items-center gap-2 lg:hidden">
                  <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <ShieldCheck className="size-5" />
                  </div>
                  <span className="font-display font-semibold">ФотоЗона24</span>
                </div>
                <div className="hidden lg:block text-sm text-muted-foreground">
                  {NAV.find((n) =>
                    n.href === '/admin' ? pathname === '/admin' : pathname.startsWith(n.href)
                  )?.label || 'Админ-панель'}
                </div>
              </div>
              {HeaderRight}
            </header>
            <main className="flex-1 p-4 sm:p-6 max-w-[1400px] w-full mx-auto">{children}</main>
          </div>
          <SheetContent side="left" className="w-72 p-0">
            <SheetTitle className="sr-only">Меню</SheetTitle>
            <div className="flex items-center gap-2 px-5 h-16 border-b">
              <div className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <div className="leading-tight">
                <div className="font-display text-base font-semibold">ФотоЗона24</div>
                <div className="text-xs text-muted-foreground">Админ-панель</div>
              </div>
            </div>
            <NavList onNavigate={() => setMobileOpen(false)} />
            <SheetClose className="absolute top-4 right-4" />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
