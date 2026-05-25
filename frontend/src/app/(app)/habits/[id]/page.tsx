'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowLeft, CalendarPlus, Check, Flame, Pencil, Sparkles, Trash2, X, Zap } from 'lucide-react';
import { useHabit, useHabitLogs, useUpdateHabit, useUpdateLog, useDeleteLog } from '@/hooks/useHabits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { CompleteDialog } from '@/components/habits/CompleteDialog';
import { HabitMonthHeatmap } from '@/components/habits/HabitMonthHeatmap';
import { formatRelativeDay } from '@/lib/utils';
import type { HabitLog } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const INSIGHTS = [
  'Small reps, repeated, beat heroic single days.',
  'Your brain rewards sequences — keep the chain alive.',
  'A bad day with one rep beats a perfect rest day.',
  "You're not building a habit, you're becoming the kind of person who has it.",
  'Recovery is part of the rhythm. Skip without guilt — just don\'t skip twice.',
];

const MOOD_EMOJI: Record<string, string> = {
  awful: '😖', bad: '😕', okay: '😐', good: '🙂', great: '🤩',
};
const MOODS = ['awful', 'bad', 'okay', 'good', 'great'] as const;
type Mood = (typeof MOODS)[number];

const todayKey = () => new Date().toISOString().slice(0, 10);

export default function HabitDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params.id;
  const { data: habit, isLoading } = useHabit(id);
  const {
    data: logsData,
    isFetching,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useHabitLogs(id, 20);
  const updateHabit = useUpdateHabit();
  const loadMoreRef = useRef<HTMLDivElement | null>(null);

  const allLogs = useMemo(
    () => logsData?.pages.flatMap((p) => p.items) ?? [],
    [logsData]
  );
  const totalLogs = logsData?.pages[0]?.total ?? 0;

  useEffect(() => {
    if (!hasNextPage || isFetchingNextPage) return;
    const node = loadMoreRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          fetchNextPage();
        }
      },
      { rootMargin: '220px 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  const [completeOpen, setCompleteOpen] = useState(false);
  const [completeDate, setCompleteDate] = useState<string | undefined>();
  const [editingStartedAt, setEditingStartedAt] = useState(false);
  const [startedDraft, setStartedDraft] = useState('');
  const [startedErr, setStartedErr] = useState<string | null>(null);
  const [startDateConfirmOpen, setStartDateConfirmOpen] = useState(false);

  if (isLoading || !habit) {
    return (
      <div className="mx-auto max-w-5xl space-y-4">
        <Skeleton className="h-12 w-1/2" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const insight = INSIGHTS[Math.floor(habit.currentStreak) % INSIGHTS.length];
  const startKey = habit.startedAt.slice(0, 10);

  const saveStartedAt = async () => {
    setStartedErr(null);
    if (!startedDraft) {
      setEditingStartedAt(false);
      return;
    }
    if (startedDraft === startKey) {
      setEditingStartedAt(false);
      return;
    }
    setStartDateConfirmOpen(true);
  };

  const doSaveStartedAt = async () => {
    try {
      await updateHabit.mutateAsync({ id: habit._id, startedAt: startedDraft });
      setEditingStartedAt(false);
    } catch (e) {
      const msg = (e as { response?: { data?: { error?: { message?: string } } }; message?: string })
        ?.response?.data?.error?.message ?? (e as Error)?.message ?? 'Failed to update start date';
      setStartedErr(msg);
    }
  };

  const openLogPast = () => {
    setCompleteDate(undefined);
    setCompleteOpen(true);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        href="/habits"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" /> All habits
      </Link>

      <header className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div
            className="grid h-14 w-14 place-items-center rounded-2xl text-white shadow-xl"
            style={{ backgroundColor: habit.color }}
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold">{habit.name}</h1>
            <div className="mt-1 flex flex-wrap items-center gap-1.5 text-xs">
              <Badge variant="outline">{habit.category}</Badge>
              <Badge>{habit.difficulty}</Badge>
              {habit.status !== 'active' && <Badge variant="warn">{habit.status}</Badge>}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={openLogPast}>
            <CalendarPlus className="h-4 w-4" /> Log past day
          </Button>
          <Button variant="glow" onClick={() => setCompleteOpen(true)}>
            <Check className="h-4 w-4" /> Complete today
          </Button>
        </div>
      </header>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Start date</CardTitle>
            <CardDescription>
              Used for completion math and as the earliest backfill date.
            </CardDescription>
          </div>
          {!editingStartedAt && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setStartedDraft(startKey);
                setEditingStartedAt(true);
              }}
            >
              <Pencil className="h-3.5 w-3.5" /> Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {editingStartedAt ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Input
                  type="date"
                  value={startedDraft}
                  max={todayKey()}
                  onChange={(e) => setStartedDraft(e.target.value)}
                  className="max-w-[180px]"
                />
                <Button size="sm" onClick={saveStartedAt} loading={updateHabit.isPending}>
                  Save
                </Button>
                <Button size="sm" variant="ghost" onClick={() => { setStartedErr(null); setEditingStartedAt(false); }}>
                  Cancel
                </Button>
              </div>
              {startedErr && <p className="text-sm text-destructive">{startedErr}</p>}
            </div>
          ) : (
            <p className="text-sm">
              {new Date(habit.startedAt).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-2 sm:gap-3 md:grid-cols-4">
        <Stat title="Streak" value={`${habit.currentStreak}d`} icon={<Flame className="h-4 w-4 text-amber-400" />} />
        <Stat title="Longest" value={`${habit.longestStreak}d`} />
        <Stat title="XP earned" value={habit.xpEarned} icon={<Zap className="h-4 w-4 text-primary" />} />
        <Stat title="Hours" value={`${(habit.totalMinutes / 60).toFixed(1)}h`} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Insight</CardTitle>
          <CardDescription>Generated for your current streak.</CardDescription>
        </CardHeader>
        <CardContent>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-border/60 bg-muted/30 p-4 text-sm leading-relaxed"
          >
            {insight}
          </motion.p>
        </CardContent>
      </Card>

      <HabitMonthHeatmap habit={habit} variant="detail" />

      <Card>
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle>Daily timeline</CardTitle>
            <CardDescription>Day-by-day history. Click a row to edit notes.</CardDescription>
          </div>
          <div className="text-xs text-muted-foreground">{totalLogs} entries</div>
        </CardHeader>
        <CardContent className="space-y-2">
          {allLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No completions yet. Mark today complete or log a past day.
            </p>
          )}
          {allLogs.map((l, idx) => (
            <LogRow key={l._id} habitId={habit._id} log={l} index={idx} />
          ))}

          {hasNextPage && (
            <div className="flex justify-center pt-2">
              <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage || isFetching}>
                Load more
              </Button>
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Log Grid View</CardTitle>
          <CardDescription>Visual timeline grid with {totalLogs} completions.</CardDescription>
        </CardHeader>
        <CardContent>
          {allLogs.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No completions yet. Mark today complete or log a past day.
            </p>
          )}
          {allLogs.length > 0 && (
            <>
              <div className="rounded-lg border border-border/40 bg-muted/10 p-3 sm:p-4">
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-8 lg:grid-cols-12 2xl:grid-cols-15">
                {allLogs.map((l, idx) => (
                  <LogGridItem key={l._id} log={l} index={idx} />
                ))}
              </div>              </div>            </>
          )}

          {hasNextPage && (
            <div className="flex justify-center pt-4">
              <Button variant="outline" onClick={() => fetchNextPage()} loading={isFetchingNextPage || isFetching}>
                Load more logs
              </Button>
            </div>
          )}
          <div ref={loadMoreRef} className="h-1" aria-hidden="true" />
        </CardContent>
      </Card>

      <CompleteDialog
        habit={habit}
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        defaultDate={completeDate}
      />
      <ConfirmDialog
        open={startDateConfirmOpen}
        onOpenChange={setStartDateConfirmOpen}
        onConfirm={doSaveStartedAt}
        title="Change start date"
        description="Changing the start date will discard logs from before that date. Continue?"
        confirmLabel="Continue"
        variant="default"
      />
    </div>
  );
}

function Stat({ title, value, icon }: { title: string; value: string | number; icon?: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border/60 bg-card/60 p-4">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        <span>{title}</span>
      </div>
      <div className="mt-1 text-2xl font-bold">{value}</div>
    </div>
  );
}

function LogGridItem({ log, index }: { log: HabitLog; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.01 }}
      className="group flex flex-col items-center justify-center rounded-lg border border-border/60 bg-card/40 p-2 hover:bg-card/80 transition-colors cursor-pointer aspect-square"
      title={`${formatRelativeDay(log.dayKey)} - ${log.minutes}m`}
    >
      <div className="text-lg font-bold text-emerald-400">✓</div>
      <div className="mt-1 text-center">
        <div className="text-[10px] font-medium text-muted-foreground">{log.dayKey.split('-')[2]}</div>
        {log.mood && <div className="text-sm" title={log.mood}>{MOOD_EMOJI[log.mood]}</div>}
        {typeof log.energy === 'number' && <div className="text-[9px] text-muted-foreground">⚡{log.energy}</div>}
      </div>
    </motion.div>
  );
}

function LogRow({ habitId, log, index }: { habitId: string; log: HabitLog; index: number }) {
  const update = useUpdateLog(habitId);
  const remove = useDeleteLog(habitId);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(log.notes ?? '');
  const [mood, setMood] = useState<Mood | undefined>(log.mood as Mood | undefined);
  const [energy, setEnergy] = useState<number | undefined>(log.energy);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const startEdit = () => {
    setDraft(log.notes ?? '');
    setMood(log.mood as Mood | undefined);
    setEnergy(log.energy);
    setEditing(true);
  };

  const save = async () => {
    await update.mutateAsync({
      logId: log._id,
      notes: draft.trim() || undefined,
      mood,
      energy,
    });
    setEditing(false);
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.02 }}
      className="group flex items-start gap-3 rounded-xl border border-border/60 bg-card/40 p-3"
    >
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-emerald-500/15 text-emerald-400">
        ✓
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="font-medium">{formatRelativeDay(log.dayKey)}</span>
          <span className="text-xs text-muted-foreground">{log.minutes}m</span>
          {log.mood && <span title={log.mood}>{MOOD_EMOJI[log.mood]}</span>}
          {typeof log.energy === 'number' && <Badge variant="outline">⚡ {log.energy}/5</Badge>}
          <Badge variant="success">+{log.xpAwarded} XP</Badge>
        </div>

        {editing ? (
          <div className="mt-2 space-y-3">
            <Textarea
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="What happened on this day?"
            />
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Mood</div>
              <div className="flex flex-wrap gap-1.5">
                {MOODS.map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setMood((cur) => (cur === m ? undefined : m))}
                    className={`inline-flex items-center gap-1 rounded-md border px-2 py-1 text-xs transition-colors ${
                      mood === m
                        ? 'border-primary bg-primary/15 text-foreground'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    <span>{MOOD_EMOJI[m]}</span>
                    <span className="capitalize">{m}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Energy</div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setEnergy((cur) => (cur === n ? undefined : n))}
                    className={`h-8 w-8 rounded-md border text-xs font-semibold transition-colors ${
                      energy === n
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border/60 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={save} loading={update.isPending}>
                Save
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                <X className="h-3.5 w-3.5" /> Cancel
              </Button>
            </div>
          </div>
        ) : log.notes ? (
          <p className="mt-1 text-sm text-muted-foreground">{log.notes}</p>
        ) : (
          <p className="mt-1 text-xs text-muted-foreground/70 italic">No description.</p>
        )}
      </div>

      {!editing && (
        <div className="flex items-center gap-1">
          <button
            onClick={startEdit}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Edit log"
          >
            <Pencil className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => setDeleteConfirmOpen(true)}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/15 hover:text-destructive"
            aria-label="Delete log"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      )}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={() => remove.mutate(log._id)}
        title="Delete log entry"
        description="Delete this log entry? Streak and XP will recompute."
        confirmLabel="Delete"
      />
    </motion.div>
  );
}
