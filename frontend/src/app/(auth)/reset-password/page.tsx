'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { AuthShell } from '@/components/auth/AuthShell';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { api, apiError } from '@/lib/api';

const schema = z.object({
  token: z.string().min(10),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/)
    .regex(/[a-z]/)
    .regex(/[0-9]/),
});
type FormValues = z.infer<typeof schema>;

function ResetForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [err, setErr] = useState<string | null>(null);
  const { register, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { token: params.get('token') ?? '' },
  });

  const onSubmit = async (v: FormValues) => {
    setErr(null);
    try {
      await api.post('/auth/reset-password', v);
      router.push('/login');
    } catch (e) {
      setErr(apiError(e));
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-1.5">
        <Label htmlFor="token">Reset token</Label>
        <Input id="token" {...register('token')} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="password">New password</Label>
        <Input id="password" type="password" {...register('password')} />
        {formState.errors.password && (
          <p className="text-xs text-destructive">Min 8 chars, mix upper / lower / number</p>
        )}
      </div>
      {err && <p className="text-sm text-destructive">{err}</p>}
      <Button type="submit" className="w-full" size="lg" variant="glow" loading={formState.isSubmitting}>
        Reset password
      </Button>
    </form>
  );
}

export default function ResetPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Enter the token from your email and a new password."
      footer={
        <Link href="/login" className="text-primary hover:underline">
          Back to sign in
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetForm />
      </Suspense>
    </AuthShell>
  );
}
