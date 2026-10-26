'use client';

import * as React from 'react';
import { toast } from 'sonner';
import {
  Plus,
  Loader2,
  RefreshCw,
  Trash2,
  Pencil,
  KeyRound,
  Users,
  ShieldCheck,
  ShieldX,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { api, type Manager } from '../_lib';

type ManagerRow = {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  avatar: string | null;
  has2fa: boolean;
  createdAt: string;
};

function initials(name: string) {
  const parts = (name || '').trim().split(/\s+/);
  return ((parts[0]?.[0] || '') + (parts[1]?.[0] || '')).toUpperCase() || '?';
}

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch {
    return iso.slice(0, 10);
  }
}

export default function AdminManagersPage() {
  const [items, setItems] = React.useState<ManagerRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [self, setSelf] = React.useState<Manager | null>(null);
  const [showCreate, setShowCreate] = React.useState(false);
  const [editing, setEditing] = React.useState<ManagerRow | null>(null);
  const [pwdTarget, setPwdTarget] = React.useState<ManagerRow | null>(null);
  const [deleteTarget, setDeleteTarget] = React.useState<ManagerRow | null>(null);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [managersRes, meRes] = await Promise.all([
        api<{ items: ManagerRow[] }>('/api/admin/managers'),
        api<{ manager: Manager | null }>('/api/admin/me'),
      ]);
      setItems(managersRes.items);
      setSelf(meRes.manager);
    } catch (e: any) {
      const body = e?.body || {};
      if (e?.status === 403) {
        toast.error(body.error || 'Доступ только для ADMIN');
      } else {
        toast.error(e?.message || 'Не удалось загрузить');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onToggleActive = async (m: ManagerRow) => {
    try {
      await api(`/api/admin/managers/${m.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !m.isActive }),
      });
      toast.success(m.isActive ? 'Менеджер отключён' : 'Менеджер включён');
      load();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Не удалось изменить статус');
    }
  };

  const onDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api(`/api/admin/managers/${deleteTarget.id}`, { method: 'DELETE' });
      toast.success('Менеджер удалён');
      setDeleteTarget(null);
      load();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Ошибка удаления');
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-end justify-between gap-3 flex-wrap">
        <div>
          <h1 className="font-display text-2xl font-semibold flex items-center gap-2">
            <Users className="size-6 text-primary" /> Менеджеры
          </h1>
          <p className="text-sm text-muted-foreground">
            Управление доступом к админ-панели · всего {items.length}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} className="gap-2">
            <RefreshCw className="size-4" /> Обновить
          </Button>
          <Button size="sm" onClick={() => setShowCreate(true)} className="gap-2">
            <Plus className="size-4" /> Добавить менеджера
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="size-6 mr-2 animate-spin text-primary" /> Загрузка…
            </div>
          ) : items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground text-sm">
              Менеджеров пока нет.
            </div>
          ) : (
            <div className="overflow-x-auto overflow-y-auto max-h-[70vh] -mx-3 sm:mx-0">
              <Table className="min-w-[760px]">
                <TableHeader className="sticky top-0 bg-card z-10">
                  <TableRow>
                    <TableHead>Менеджер</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Роль</TableHead>
                    <TableHead>2FA</TableHead>
                    <TableHead>Активность</TableHead>
                    <TableHead>Создан</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                {items.map((m) => {
                  const isSelf = self?.id === m.id;
                  return (
                    <TableRow key={m.id} className={m.isActive ? '' : 'opacity-60'}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="size-9">
                            {m.avatar && <AvatarImage src={m.avatar} alt={m.name} />}
                            <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                              {initials(m.name)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium flex items-center gap-2">
                              {m.name}
                              {isSelf && <Badge variant="outline" className="text-[10px]">вы</Badge>}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">{m.email}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{m.phone || '—'}</TableCell>
                      <TableCell>
                        {m.role === 'ADMIN' ? (
                          <Badge className="bg-violet-100 text-violet-800 border-violet-300">ADMIN</Badge>
                        ) : (
                          <Badge variant="outline">MANAGER</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {m.has2fa ? (
                          <span className="inline-flex items-center gap-1 text-emerald-700 text-xs">
                            <ShieldCheck className="size-3.5" /> да
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
                            <ShieldX className="size-3.5" /> нет
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Switch
                            checked={m.isActive}
                            onCheckedChange={() => onToggleActive(m)}
                            disabled={isSelf && m.isActive}
                            aria-label="Активность менеджера"
                          />
                          <span className="text-xs text-muted-foreground">
                            {m.isActive ? 'активен' : 'отключён'}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{formatDate(m.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditing(m)}
                            aria-label="Редактировать"
                            title="Редактировать"
                          >
                            <Pencil className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setPwdTarget(m)}
                            aria-label="Сменить пароль"
                            title="Сменить пароль"
                          >
                            <KeyRound className="size-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteTarget(m)}
                            disabled={isSelf}
                            aria-label="Удалить"
                            title={isSelf ? 'Себя удалять нельзя' : 'Удалить'}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {showCreate && (
        <ManagerForm
          mode="create"
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load(); }}
        />
      )}
      {editing && (
        <ManagerForm
          mode="edit"
          manager={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); }}
        />
      )}
      {pwdTarget && (
        <PasswordDialog
          manager={pwdTarget}
          onClose={() => setPwdTarget(null)}
          onSaved={() => { setPwdTarget(null); toast.success('Пароль обновлён'); }}
        />
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Удалить менеджера «{deleteTarget?.name}»?</AlertDialogTitle>
            <AlertDialogDescription>
              Запись будет удалена безвозвратно. Все заявки, привязанные к менеджеру, станут нераспределёнными.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Отмена</AlertDialogCancel>
            <AlertDialogAction onClick={onDelete} className="bg-destructive text-destructive-foreground">
              Удалить
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

function ManagerForm({
  mode,
  manager,
  onClose,
  onSaved,
}: {
  mode: 'create' | 'edit';
  manager?: ManagerRow | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = React.useState(manager?.name || '');
  const [email, setEmail] = React.useState(manager?.email || '');
  const [phone, setPhone] = React.useState(manager?.phone || '');
  const [password, setPassword] = React.useState('');
  const [role, setRole] = React.useState<'MANAGER' | 'ADMIN'>(
    (manager?.role as 'MANAGER' | 'ADMIN') || 'MANAGER',
  );
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (!name.trim()) return toast.error('Укажите имя');
    if (mode === 'create' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return toast.error('Некорректный email');
    }
    if (mode === 'create' && password.length < 6) {
      return toast.error('Пароль минимум 6 символов');
    }
    setSaving(true);
    try {
      if (mode === 'create') {
        await api('/api/admin/managers', {
          method: 'POST',
          body: JSON.stringify({
            name: name.trim(),
            email: email.trim().toLowerCase(),
            phone: phone.trim() || null,
            password,
            role,
          }),
        });
        toast.success('Менеджер создан');
      } else if (manager) {
        await api(`/api/admin/managers/${manager.id}`, {
          method: 'PATCH',
          body: JSON.stringify({
            name: name.trim(),
            phone: phone.trim() || null,
            role,
          }),
        });
        toast.success('Менеджер обновлён');
      }
      onSaved();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Ошибка сохранения');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Новый менеджер' : 'Редактировать менеджера'}</DialogTitle>
          <DialogDescription>
            {mode === 'create'
              ? 'Доступ к админ-панели. Пароль можно сменить позже.'
              : 'Можно изменить имя, телефон и роль. Email нельзя менять.'}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="m-name">Имя *</Label>
            <Input id="m-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Иван Иванов" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-email">Email *</Label>
            <Input
              id="m-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mode === 'edit'}
              placeholder="manager@fotoarka.ru"
            />
            {mode === 'edit' && (
              <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
            )}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="m-phone">Телефон</Label>
            <Input id="m-phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+7 (999) 000-00-00" />
          </div>
          {mode === 'create' && (
            <div className="space-y-1.5">
              <Label htmlFor="m-pwd">Пароль *</Label>
              <Input
                id="m-pwd"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Минимум 6 символов"
                autoComplete="new-password"
              />
            </div>
          )}
          <div className="space-y-1.5">
            <Label>Роль</Label>
            <Select value={role} onValueChange={(v) => setRole(v as 'MANAGER' | 'ADMIN')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANAGER">MANAGER — работа с заявками</SelectItem>
                <SelectItem value="ADMIN">ADMIN — полный доступ</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            {mode === 'create' ? 'Создать' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function PasswordDialog({
  manager,
  onClose,
  onSaved,
}: {
  manager: ManagerRow;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [pwd, setPwd] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const save = async () => {
    if (pwd.length < 6) return toast.error('Пароль минимум 6 символов');
    setSaving(true);
    try {
      await api(`/api/admin/managers/${manager.id}/password`, {
        method: 'POST',
        body: JSON.stringify({ password: pwd }),
      });
      onSaved();
    } catch (e: any) {
      const body = e?.body || {};
      toast.error(body.error || e?.message || 'Ошибка');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Сменить пароль</DialogTitle>
          <DialogDescription>
            Менеджер: <b>{manager.name}</b> ({manager.email})
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="p-new">Новый пароль</Label>
            <Input
              id="p-new"
              type="password"
              value={pwd}
              onChange={(e) => setPwd(e.target.value)}
              placeholder="Минимум 6 символов"
              autoComplete="new-password"
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Отмена</Button>
          <Button onClick={save} disabled={saving || pwd.length < 6}>
            {saving ? <Loader2 className="size-4 mr-2 animate-spin" /> : null}
            Сохранить
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
