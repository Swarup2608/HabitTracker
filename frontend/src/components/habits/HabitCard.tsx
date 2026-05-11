'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Check, Flame, MoreVertical, Pause, Play, Trash2, Trophy } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteHabit, useUpdateHabit } from '@/hooks/useHabits';
import { CompleteDialog } from '@/components/habits/CompleteDialog';
import { TargetReachedDialog } from '@/components/habits/TargetReachedDialog';

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', epic: 'Epic' };

export function HabitCard({ habit }: { habit: Habit }) {
  const update = useUpdateHabit();
  const remove = useDeleteHabit();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [targetReachedOpen, setTargetReachedOpen] = useState(false);

  const targetAwaitingDecision =
    !!habit.targetReachedAt && habit.status === 'active';

  useEffect(() => {
    if (!targetAwaitingDecision) return;
    const seenKey = `target-celebrated:${habit._id}:${habit.targetReachedAt}`;
    if (typeof window !== 'undefined' && !window.sessionStorage.getItem(seenKey)) {
      window.sessionStorage.setItem(seenKey, '1');
      setTargetReachedOpen(true);
    }
  }, [targetAwaitingDecision, habit._id, habit.targetReachedAt]);

  const today = new Date().toISOString().slice(0, 10);
  const completedToday = habit.lastCompletedAt
    ? new Date(habit.lastCompletedAt).toISOString().slice(0, 10) === today
    : false;

  const days = Math.max(
    1,
    Math.floor((Date.now() - new Date(habit.startedAt).getTime()) / 86_400_000) + 1
  );
  const completionPct = Math.min(100, Math.round((habit.totalCompletions / days) * 100));

  const hasTarget = !!(habit.targetDays && habit.targetMetric);
  const targetProgress = !hasTarget
    ? 0
    : habit.targetMetric === 'streak'
      ? habit.currentStreak
      : habit.totalCompletions;
  const targetPct = hasTarget
    ? Math.min(100, Math.round((targetProgress / (habit.targetDays as number)) * 100))
    : 0;
  const targetLabel = hasTarget
    ? habit.targetMetric === 'streak'
      ? 'Streak target'
      : habit.targetMetric === 'days'
        ? 'Days target'
        : 'Completion target'
    : '';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full opacity-30 blur-2xl transition-opacity group-hover:opacity-60"
        style={{ backgroundColor: habit.color }}
      />

      <div className="relative flex items-start gap-3">
        <div
          className="grid h-12 w-12 shrink-0 place-items-center rounded-xl text-white shadow-lg"
          style={{ backgroundColor: habit.color }}
        >
          <span className="text-base font-bold">{habit.name[0]?.toUpperCase()}</span>
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/habits/${habit._id}`} className="block truncate font-semibold hover:underline">
            {habit.name}
          </Link>
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge variant="outline">{habit.category}</Badge>
            <Badge>{DIFFICULTY_LABEL[habit.difficulty]}</Badge>
            {habit.status !== 'active' && <Badge variant="warn">{habit.status}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => update.mutate({ id: habit._id, status: habit.status === 'paused' ? 'active' : 'paused' })}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Pause"
          >
            {habit.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${habit.name}"? This is permanent.`)) remove.mutate(habit._id);
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/20 hover:text-destructive"
            aria-label="Delete"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="relative mt-4 grid grid-cols-3 gap-2 text-center text-xs">
        <Stat label="Streak" value={`${habit.currentStreak}d`} icon={<Flame className="h-3 w-3 text-amber-400" />} />
        <Stat label="Done" value={habit.totalCompletions} />
        <Stat label="Hours" value={`${(habit.totalMinutes / 60).toFixed(1)}h`} />
      </div>

      <div className="relative mt-3">
        <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
          <span>Completion</span>
          <span>{completionPct}%</span>
        </div>
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full"
            style={{
              width: `${completionPct}%`,
              background: `linear-gradient(90deg, ${habit.color}, hsl(var(--primary)))`,
            }}
          />
        </div>
      </div>

      {hasTarget && (
        <div className="relative mt-3">
          <div className="mb-1 flex items-center justify-between text-[10px] uppercase tracking-wide text-muted-foreground">
            <span>{targetLabel}</span>
            <span>
              {targetProgress}/{habit.targetDays}
              {habit.targetReachedAt && ' ✓'}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full transition-all"
              style={{
                width: `${targetPct}%`,
                background: `linear-gradient(90deg, ${habit.color}, hsl(var(--secondary)))`,
              }}
            />
          </div>
        </div>
      )}

      {targetAwaitingDecision && (
        <button
          type="button"
          onClick={() => setTargetReachedOpen(true)}
          className="relative mt-3 flex w-full items-center justify-between gap-2 rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent px-3 py-2 text-left text-xs font-semibold text-amber-200 hover:from-amber-500/25 hover:to-amber-500/5 transition-colors"
        >
          <span className="flex items-center gap-2">
            <Trophy className="h-4 w-4" /> Target reached — choose what&apos;s next
          </span>
          <span aria-hidden>→</span>
        </button>
      )}

      <div className="relative mt-4 flex items-center gap-2">
        <Button
          size="sm"
          variant={completedToday ? 'outline' : 'glow'}
          disabled={habit.status !== 'active'}
          onClick={() => setCompleteOpen(true)}
          className="flex-1"
        >
          <Check className="h-4 w-4" />
          {completedToday ? 'Done today  Log past' : `Complete  +${xpFor(habit.difficulty)} XP`}
        </Button>
        <Button asChild size="sm" variant="ghost">
          <Link href={`/habits/${habit._id}`}>
            <MoreVertical className="h-4 w-4" />
          </Link>
        </Button>
      </div>

      <CompleteDialog
        habit={habit}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        onCompleted={(res) => {
          if (res.targetReached) setTargetReachedOpen(true);
        }}
      />
      <TargetReachedDialog
        habit={habit}
        open={targetReachedOpen}
        onOpenChange={setTargetReachedOpen}
      />
    </motion.div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border/60 bg-card/40 p-2">
      <div className="flex items-center justify-center gap-1 text-muted-foreground">
        {icon}
        <span className="text-[10px] uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-0.5 font-semibold">{value}</div>
    </div>
  );
}

function xpFor(d: string) {
  return ({ easy: 10, medium: 20, hard: 35, epic: 60 } as Record<string, number>)[d] ?? 20;
}
