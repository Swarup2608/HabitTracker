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

const schema = z.object({
  name: z.string().min(1).max(80),
  description: z.string().max(500).optional(),
  category: z.string().min(1),
  difficulty: z.enum(['easy', 'medium', 'hard', 'epic']),
  estimatedMinutes: z.coerce.number().int().min(1).max(600),
  color: z.string().default('#8b5cf6'),
});

type FormValues = z.infer<typeof schema>;

const COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6', '#facc15'];

export function CreateHabitDialog() {
  const [open, setOpen] = useState(false);
  const create = useCreateHabit();
  const { register, handleSubmit, setValue, watch, reset, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { difficulty: 'medium', category: 'general', estimatedMinutes: 15, color: '#8b5cf6' },
  });

  const color = watch('color');

  const onSubmit = async (v: FormValues) => {
    await create.mutateAsync(v);
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
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Category</Label>
              <Input {...register('category')} placeholder="fitness" />
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
          <Button type="submit" className="w-full" variant="glow" loading={formState.isSubmitting}>
            Create habit
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
