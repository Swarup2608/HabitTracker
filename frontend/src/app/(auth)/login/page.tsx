'use client';

import { useState, useEffect } from 'react';
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
  password: z.string().min(1),
});
type FormValues = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, login } = useAuth();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const onSubmit = async (v: FormValues) => {
    setErr(null);
    try {
      await login(v.email, v.password);
      router.push('/dashboard');
    } catch (e) {
      setErr(apiError(e));
    }
  };

  if (loading) {
    return (
      <AuthShell title="Loading..." subtitle="">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </AuthShell>
    );
  }

  if (user) {
    return null; // Will redirect via useEffect
  }

  return (
    <div className='atomic-age'><AuthShell
      title="Welcome back"
      subtitle="Sign in to continue your streak."
      footer={
        <span>
          New here?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Create an account
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="you@tracker.app" {...register('email')} />
          {formState.errors.email && (
            <p className="text-xs text-destructive">{formState.errors.email.message}</p>
          )}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <PasswordInput id="password" placeholder="••••••••" {...register('password')} />
        </div>
        {err && <p className="text-sm text-destructive">{err}</p>}
        <Button type="submit" className="w-full" variant="glow" size="lg" loading={formState.isSubmitting}>
          Sign in
        </Button>
        <div className="text-right text-xs">
          <Link href="/forgot-password" className="text-muted-foreground hover:text-foreground">
            Forgot password?
          </Link>
        </div>
      </form>
    </AuthShell></div>
  );
}
