'use client';

import { useState } from 'react';
import { Lock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useTheme } from '@/stores/theme';
import { useAuth } from '@/stores/auth';
import { api, apiError } from '@/lib/api';
import type { ThemeMode } from '@/lib/types';
import { ThemeModePicker } from '@/components/ui/ThemeModePicker';

export default function SettingsPage() {
  const { setTheme } = useTheme();
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
        <CardContent>
          <ThemeModePicker className="grid grid-cols-1 gap-3 sm:grid-cols-3" />
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
            <PasswordInput id="cpwd" autoComplete="new-password" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={currentPwd} onChange={(e) => setCurrentPwd(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="npwd">New password</Label>
            <PasswordInput id="npwd" autoComplete="new-password" autoCorrect="off" autoCapitalize="off" spellCheck={false} value={newPwd} onChange={(e) => setNewPwd(e.target.value)} />
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
