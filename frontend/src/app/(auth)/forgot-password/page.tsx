'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, apiError } from '@/lib/api';

const schema = z.object({ email: z.string().email() });
type FormValues = z.infer<typeof schema>;

export default function ForgotPage() {
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const onSubmit = async (v: FormValues) => {
    setErr(null);
    setMsg(null);
    try {
      const res = await api.post('/auth/forgot-password', v);
      const token = res.data.devToken;
      setMsg(
        token
          ? `Dev mode token: ${token} — open /reset-password?token=${token}`
          : 'If that email exists, a reset link has been sent.'
      );
    } catch (e) {
      setErr(apiError(e));
    }
  };

  return (
    <AuthShell
      title="Reset your password"
      subtitle="Enter your email and we'll send you a reset link."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
        </div>
        {msg && <p className="text-sm text-emerald-400">{msg}</p>}
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" size="lg" variant="glow" loading={formState.isSubmitting}>
          Send reset link
        </Button>
      </form>
    </AuthShell>
  );
}
