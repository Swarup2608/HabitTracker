'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Moon, Sun, Sword, Sprout, Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useTheme } from '@/stores/theme';
import { useAuth } from '@/stores/auth';
import { api, apiError } from '@/lib/api';
import type { ThemeMode } from '@/lib/types';
import { cn } from '@/lib/utils';

const THEMES: { id: ThemeMode; title: string; subtitle: string; icon: React.ElementType; gradient: string }[] = [
  { id: 'dark', title: 'Dark', subtitle: 'Default. Calm focus.', icon: Moon, gradient: 'from-zinc-700 to-zinc-900' },
  { id: 'light', title: 'Light', subtitle: 'Crisp daytime mode.', icon: Sun, gradient: 'from-amber-100 to-rose-100' },
  { id: 'gaming', title: 'Gaming', subtitle: 'Neon. XP bars. Glow.', icon: Sword, gradient: 'from-cyan-500 to-fuchsia-600' },
  { id: 'fantasy', title: 'Fantasy', subtitle: 'Calm, nature, poetic.', icon: Sprout, gradient: 'from-emerald-400 to-amber-300' },
];

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const user = useAuth((s) => s.user);
  const setUser = useAuth((s) => s.setUser);
  const [username, setUsername] = useState(user?.username ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const [currentPwd, setCurrentPwd] = useState('');
  const [newPwd, setNewPwd] = useState('');
  const [pwdMsg, setPwdMsg] = useState<string | null>(null);
  const [pwdErr, setPwdErr] = useState<string | null>(null);
  const [pwdSaving, setPwdSaving] = useState(false);

  const saveProfile = async () => {
    setSaving(true);
    setMsg(null);
    setErr(null);
    try {
      const res = await api.patch('/users/me', { username, email });
      setUser(res.data.user);
      setMsg('Saved');
    } catch (e) {
      setErr(apiError(e));
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    setPwdSaving(true);
    setPwdMsg(null);
    setPwdErr(null);
    try {
      await api.post('/users/me/password', { currentPassword: currentPwd, newPassword: newPwd });
      setCurrentPwd('');
      setNewPwd('');
      setPwdMsg('Password updated. You may need to sign in again.');
    } catch (e) {
      setPwdErr(apiError(e));
    } finally {
      setPwdSaving(false);
    }
  };

  const pickTheme = async (t: ThemeMode) => {
    setTheme(t);
    try {
      await api.patch('/users/me', { theme: t });
    } catch {
      /* not fatal */
    }
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="text-sm text-muted-foreground">Tune your profile and theme engine.</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Theme</CardTitle>
          <CardDescription>Pick the world your habits live in.</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {THEMES.map((t) => {
            const active = theme === t.id;
            return (
              <motion.button
                key={t.id}
                whileHover={{ y: -3 }}
                onClick={() => pickTheme(t.id)}
                className={cn(
                  'group relative overflow-hidden rounded-2xl border p-4 text-left transition-colors',
                  active ? 'border-primary ring-2 ring-primary/40' : 'border-border/60 hover:border-border'
                )}
              >
                <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity group-hover:opacity-50', t.gradient)} />
                <div className="relative flex items-center justify-between">
                  <t.icon className="h-5 w-5" />
                  {active && <Badge>Active</Badge>}
                </div>
                <div className="relative mt-3 font-semibold">{t.title}</div>
                <div className="relative text-xs text-muted-foreground">{t.subtitle}</div>
              </motion.button>
            );
          })}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>How you show up across the app.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="username">Username</Label>
            <Input id="username" value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button onClick={saveProfile} loading={saving}>
              Save changes
            </Button>
            {msg && <span className="text-sm text-emerald-400">{msg}</span>}
            {err && <span className="text-sm text-destructive">{err}</span>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4" /> Password
          </CardTitle>
          <CardDescription>Changing the password signs out other sessions.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="cpwd">Current password</Label>
            <Input id="cpwd" type="password" value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="npwd">New password</Label>
            <Input id="npwd" type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex items-center gap-3">
            <Button onClick={changePassword} loading={pwdSaving} variant="outline">
              Change password
            </Button>
            {pwdMsg && <span className="text-sm text-emerald-400">{pwdMsg}</span>}
            {pwdErr && <span className="text-sm text-destructive">{pwdErr}</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
