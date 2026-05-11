'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/stores/auth';
import { apiError } from '@/lib/api';

const schema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(24).regex(/^[a-zA-Z0-9_]+$/, 'letters, numbers, underscores only'),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, 'uppercase required')
    .regex(/[a-z]/, 'lowercase required')
    .regex(/[0-9]/, 'number required'),
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const reg = useAuth((s) => s.register);
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (v: FormValues) => {
    setErr(null);
    try {
      await reg(v.email, v.username, v.password);
      router.push('/dashboard');
    } catch (e) {
      setErr(apiError(e));
    }
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle="Start your first streak in under 60 seconds."
      footer={
        <span>
          Already have one?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" {...register('email')} />
          {formState.errors.email && <p className="text-xs text-destructive">{formState.errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="username">Username</Label>
          <Input id="username" {...register('username')} />
          {formState.errors.username && (
            <p className="text-xs text-destructive">{formState.errors.username.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" autoComplete="new-password" {...register('password')} />
          {formState.errors.password && (
            <p className="text-xs text-destructive">{formState.errors.password.message}</p>
          )}
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" variant="glow" size="lg" loading={formState.isSubmitting}>
          Create account
        </Button>
      </form>
    </AuthShell>
  );
}
