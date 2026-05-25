'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCreateHabit } from '@/hooks/useHabits';
import { HABIT_CATEGORIES } from '@/lib/categories';

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  icon: z.string().max(5).optional(),
  categoryKey: z.string().min(1),
  categoryOther: z.string().max(40).optional(),
  category: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard', 'epic']),
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
  color: z.string().default('#8b5cf6'),
  targetDays: z.preprocess(
    (v) => (v === '' || v == null || Number.isNaN(v) ? undefined : v),
    z.coerce.number().int().min(1).max(3650).optional()
  ),
  targetMetric: z.preprocess(
    (v) => (v === '' || v == null ? undefined : v),
    z.enum(['completions', 'streak', 'days']).optional()
  ),
});

type FormValues = z.infer<typeof schema>;

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6', '#facc15'];

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateHabit();
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'medium', categoryKey: 'study', estimatedMinutes: 15, color: '#8b5cf6' },
  });

  const color = watch('color');
  const targetMetric = watch('targetMetric');
  const categoryKey = watch('categoryKey');

  const onSubmit = async (v: FormValues) => {
    const resolvedCategory =
      v.categoryKey === 'other'
        ? (v.categoryOther?.trim() || 'other')
        : v.categoryKey;
    const payload: Record<string, unknown> = {
      ...v,
      category: resolvedCategory,
    };
    delete payload.categoryKey;
    delete payload.categoryOther;
    if (!payload.targetDays || !payload.targetMetric) {
      payload.targetDays = undefined;
      payload.targetMetric = undefined;
    }
    await create.mutateAsync(payload);
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="glow">
          <Plus className="h-4 w-4" /> New habit
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a habit</DialogTitle>
          <DialogDescription>Pick something small enough to do every day.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="name">Name</Label>
            <Input id="name" placeholder="Morning run" {...register('name')} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" placeholder="Why does this matter to you?" {...register('description')} />
          </div>
            <div className="space-y-1.5">
              <Label htmlFor="icon">Icon (emoji or keyboard symbol)</Label>
              <Input id="icon" placeholder="e.g., 🏃 or ⚡ or 🎯" maxLength={5} {...register('icon')} />
            </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Select
                value={categoryKey}
                onValueChange={(v) => setValue('categoryKey', v, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {HABIT_CATEGORIES.map((c) => {
                    const Icon = c.icon;
                    return (
                      <SelectItem key={c.value} value={c.value}>
                        <span className="inline-flex items-center gap-2">
                          <Icon className="h-3.5 w-3.5" />
                          {c.label}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {categoryKey === 'other' && (
                <Input
                  {...register('categoryOther')}
                  placeholder="Name your category"
                  className="mt-1.5"
                />
              )}
            </div>
            <div className="space-y-1.5">
              <Label>Difficulty</Label>
              <Select
                defaultValue="medium"
                onValueChange={(v) => setValue('difficulty', v as FormValues['difficulty'])}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Easy · +10 XP</SelectItem>
                  <SelectItem value="medium">Medium · +20 XP</SelectItem>
                  <SelectItem value="hard">Hard · +35 XP</SelectItem>
                  <SelectItem value="epic">Epic · +60 XP</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="estimatedMinutes">Estimated minutes</Label>
              <Input
                id="estimatedMinutes"
                type="number"
                min={1}
                max={600}
                {...register('estimatedMinutes', { valueAsNumber: true })}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {COLORS.map((c) => (
                  <button
                    type="button"
                    key={c}
                    onClick={() => setValue('color', c)}
                    className="h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-all"
                    style={{
                      backgroundColor: c,
                      boxShadow: color === c ? `0 0 0 2px ${c}` : 'none',
                    }}
                    aria-label={c}
                  />
                ))}
              </div>
            </div>
          </div>
          <div className="rounded-xl border border-border/60 bg-card/40 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Target (optional)
              </Label>
              <span className="text-[10px] text-muted-foreground">finish & archive</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Input
                type="number"
                min={1}
                max={3650}
                placeholder="e.g. 30"
                {...register('targetDays', { valueAsNumber: true })}
              />
              <Select
                value={targetMetric ?? ''}
                onValueChange={(v) =>
                  setValue('targetMetric', (v || undefined) as FormValues['targetMetric'])
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Measure by…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="completions">Total completions</SelectItem>
                  <SelectItem value="streak">Current streak</SelectItem>
                  <SelectItem value="days">Distinct days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-[11px] text-muted-foreground">
              Reach the target and we&apos;ll celebrate, then ask if you want to archive.
            </p>
          </div>
          {Object.keys(formState.errors).length > 0 && (
            <p className="text-xs text-red-500">
              {Object.entries(formState.errors)
                .map(([k, e]) => `${k}: ${(e as { message?: string })?.message ?? 'invalid'}`)
                .join(' · ')}
            </p>
          )}
          <Button type="submit" className="w-full" variant="glow" loading={formState.isSubmitting}>
            Create habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
