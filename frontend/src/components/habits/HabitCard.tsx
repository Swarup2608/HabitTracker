'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useEffect } from 'react';
import { Check, Flame, MoreVertical, Pause, Pencil, Play, Trash2, Trophy } from 'lucide-react';
import type { Habit } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useDeleteHabit, useUpdateHabit } from '@/hooks/useHabits';
import { CompleteDialog } from '@/components/habits/CompleteDialog';
import { HabitMonthHeatmap } from '@/components/habits/HabitMonthHeatmap';
import { TargetReachedDialog } from '@/components/habits/TargetReachedDialog';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

const DIFFICULTY_LABEL: Record<string, string> = { easy: 'Easy', medium: 'Medium', hard: 'Hard', epic: 'Epic' };
const HABIT_COLORS = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#f97316', '#3b82f6', '#facc15'];

function sanitizeHabitIcon(icon: string | undefined, name: string) {
  const normalized = (icon ?? '').trim();
  if (!normalized) return name[0]?.toUpperCase() ?? 'H';
  if (/^[A-Za-z\d _-]+$/.test(normalized)) return normalized[0]?.toUpperCase() ?? 'H';
  return Array.from(normalized)[0] ?? 'H';
}

export function HabitCard({ habit }: { habit: Habit }) {
  const update = useUpdateHabit();
  const remove = useDeleteHabit();
  const [completeOpen, setCompleteOpen] = useState(false);
  const [targetReachedOpen, setTargetReachedOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);

  const [name, setName] = useState(habit.name);
  const [description, setDescription] = useState(habit.description ?? '');
  const [icon, setIcon] = useState(habit.icon ?? '');
  const [color, setColor] = useState(habit.color);
  const [estimatedMinutes, setEstimatedMinutes] = useState(habit.estimatedMinutes);
  const [streakTarget, setStreakTarget] = useState(
    habit.targetMetric === 'streak' && habit.targetDays ? String(habit.targetDays) : ''
  );

  const targetAwaitingDecision =
    !!habit.targetReachedAt && habit.status === 'active';

  useEffect(() => {
    if (!editOpen) return;
    setName(habit.name);
    setDescription(habit.description ?? '');
    setIcon(habit.icon ?? '');
    setColor(habit.color);
    setEstimatedMinutes(habit.estimatedMinutes);
    setStreakTarget(habit.targetMetric === 'streak' && habit.targetDays ? String(habit.targetDays) : '');
  }, [editOpen, habit]);

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
  const cardIcon = sanitizeHabitIcon(habit.icon, habit.name);

  const saveEdits = async () => {
    const trimmedName = name.trim();
    if (!trimmedName) return;

    const payload: {
      id: string;
      name: string;
      description?: string;
      icon?: string;
      color: string;
      estimatedMinutes: number;
      targetDays?: number | null;
      targetMetric?: 'streak' | null;
    } = {
      id: habit._id,
      name: trimmedName,
      description: description.trim() ? description.trim() : undefined,
      icon: icon.trim() ? icon.trim().slice(0, 5) : undefined,
      color,
      estimatedMinutes: Math.max(1, Math.min(600, Math.round(estimatedMinutes))),
    };

    const parsedTarget = Number(streakTarget);
    if (streakTarget.trim()) {
      payload.targetMetric = 'streak';
      payload.targetDays = Math.max(1, Math.min(3650, Number.isFinite(parsedTarget) ? Math.round(parsedTarget) : 1));
    } else if (habit.targetMetric === 'streak') {
      payload.targetMetric = null;
      payload.targetDays = null;
    }

    await update.mutateAsync(payload);
    setEditOpen(false);
  };

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
          <span className="text-xl font-bold">{cardIcon}</span>
        </div>
        <div className="min-w-0 flex-1">
          <Link href={`/habits/${habit._id}`} className="block truncate font-semibold hover:underline">
            {habit.name}
          </Link>
          {habit.description && (
            <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{habit.description}</p>
          )}
          <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
            <Badge variant="outline">{habit.category}</Badge>
            <Badge>{DIFFICULTY_LABEL[habit.difficulty]}</Badge>
            {habit.status !== 'active' && <Badge variant="warn">{habit.status}</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit habit"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={() => update.mutate({ id: habit._id, status: habit.status === 'paused' ? 'active' : 'paused' })}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Pause"
          >
            {habit.status === 'paused' ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setDeleteOpen(true)}
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
              backgroundColor: habit.color,
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
                backgroundColor: habit.color,
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

      <div className="relative mt-3">
        <HabitMonthHeatmap habit={habit} />
      </div>

      <div className="relative mt-4 flex items-center gap-2">
        <Button
          size="sm"
          variant={completedToday ? 'outline' : 'glow'}
          disabled={habit.status !== 'active'}
          onClick={() => setCompleteOpen(true)}
          className="flex-1"
        >
          <Check className="h-4 w-4" />
          {completedToday ? 'Done today • Log past' : `Complete • +${xpFor(habit.difficulty)} XP`}
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
      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={() => remove.mutate(habit._id)}
        title="Delete habit"
        description={`Delete "${habit.name}"? This is permanent.`}
        confirmLabel="Delete"
      />

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit habit</DialogTitle>
            <DialogDescription>
              Update title, description, icon, color, daily minutes, and streak target.
            </DialogDescription>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void saveEdits();
            }}
            className="space-y-3"
          >
            <div className="space-y-1.5">
              <Label htmlFor={`habit-name-${habit._id}`}>Title</Label>
              <Input
                id={`habit-name-${habit._id}`}
                value={name}
                maxLength={80}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor={`habit-description-${habit._id}`}>Description</Label>
              <Textarea
                id={`habit-description-${habit._id}`}
                value={description}
                maxLength={500}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Why this habit matters"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor={`habit-icon-${habit._id}`}>Icon</Label>
                <Input
                  id={`habit-icon-${habit._id}`}
                  value={icon}
                  maxLength={5}
                  onChange={(e) => setIcon(e.target.value)}
                  placeholder="e.g. ✨ or 💪"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor={`habit-minutes-${habit._id}`}>Daily minutes (hours)</Label>
                <Input
                  id={`habit-minutes-${habit._id}`}
                  type="number"
                  min={1}
                  max={600}
                  value={estimatedMinutes}
                  onChange={(e) => setEstimatedMinutes(Number(e.target.value || 1))}
                />
                <p className="text-[11px] text-muted-foreground">
                  {(Math.max(1, estimatedMinutes) / 60).toFixed(1)}h per day
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <Label>Color</Label>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {HABIT_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
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

            <div className="space-y-1.5">
              <Label htmlFor={`habit-streak-target-${habit._id}`}>Streak target (days)</Label>
              <Input
                id={`habit-streak-target-${habit._id}`}
                type="number"
                min={1}
                max={3650}
                value={streakTarget}
                onChange={(e) => setStreakTarget(e.target.value)}
                placeholder="Leave blank to disable"
              />
            </div>

            <Button type="submit" className="w-full" variant="glow" loading={update.isPending}>
              Save changes
            </Button>
          </form>
        </DialogContent>
      </Dialog>
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
