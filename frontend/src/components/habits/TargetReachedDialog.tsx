'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Archive, RefreshCw, ArrowRight, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateHabit } from '@/hooks/useHabits';
import type { Habit } from '@/lib/types';

type Mode = 'choose' | 'new-target';

export function TargetReachedDialog({
  habit,
  open,
  onOpenChange,
}: {
  habit: Habit;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const update = useUpdateHabit();
  const [mode, setMode] = useState<Mode>('choose');
  const [nextTarget, setNextTarget] = useState<number>(
    Math.max(1, (habit.targetDays ?? 30) * 2)
  );

  const close = () => {
    setMode('choose');
    onOpenChange(false);
  };

  const archive = async () => {
    await update.mutateAsync({ id: habit._id, status: 'archived' });
    close();
  };

  const keepGoing = async () => {
    // Drop the target so the habit just keeps running.
    await update.mutateAsync({
      id: habit._id,
      targetDays: null,
      targetMetric: null,
      targetReachedAt: null,
    });
    close();
  };

  const setNew = async () => {
    if (!nextTarget || nextTarget < 1) return;
    await update.mutateAsync({
      id: habit._id,
      targetDays: nextTarget,
      targetMetric: habit.targetMetric ?? 'completions',
      targetReachedAt: null,
    });
    close();
  };

  const metricLabel =
    habit.targetMetric === 'streak'
      ? 'day streak'
      : habit.targetMetric === 'days'
        ? 'distinct days'
        : 'completions';

  return (
    <Dialog open={open} onOpenChange={(v) => (v ? onOpenChange(v) : close())}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-amber-400" />
            Target reached!
          </DialogTitle>
          <DialogDescription>
            You hit your goal for <span className="font-semibold">{habit.name}</span>. What&apos;s next?
          </DialogDescription>
        </DialogHeader>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-2xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4"
        >
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-amber-300">
            <Sparkles className="h-3.5 w-3.5" /> Congratulations
          </div>
          <p className="mt-1 text-sm text-foreground">
            {habit.targetDays} {metricLabel} done. That&apos;s real momentum — proud of you.
          </p>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <Pill label="Streak" value={`${habit.currentStreak}d`} />
            <Pill label="Total" value={habit.totalCompletions} />
            <Pill label="Hours" value={`${(habit.totalMinutes / 60).toFixed(1)}h`} />
          </div>
        </motion.div>

        {mode === 'choose' ? (
          <div className="mt-2 grid gap-2">
            <Button
              variant="glow"
              onClick={() => setMode('new-target')}
              loading={update.isPending}
              className="justify-between"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4" /> Set a new target
              </span>
              <ArrowRight className="h-4 w-4 opacity-70" />
            </Button>
            <Button variant="outline" onClick={keepGoing} loading={update.isPending}>
              Keep going — no target
            </Button>
            <Button variant="ghost" onClick={archive} loading={update.isPending}>
              <Archive className="h-4 w-4" /> Archive this habit
            </Button>
          </div>
        ) : (
          <div className="mt-2 space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="next-target">New target ({metricLabel})</Label>
              <Input
                id="next-target"
                type="number"
                min={1}
                max={3650}
                value={nextTarget}
                onChange={(e) => setNextTarget(Number(e.target.value))}
                autoFocus
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <Button variant="ghost" onClick={() => setMode('choose')}>
                Back
              </Button>
              <Button variant="glow" onClick={setNew} loading={update.isPending}>
                Set target & continue
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Pill({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-amber-500/20 bg-background/40 p-2">
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}
