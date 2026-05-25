'use client';

import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  useCompleteHabit,
  useDeleteLog,
  useHabitCalendar,
  useUpdateLog,
} from '@/hooks/useHabits';
import { apiError } from '@/lib/api';
import { cn } from '@/lib/utils';
import type { Habit, HabitCalendarDay } from '@/lib/types';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MOODS = ['awful', 'bad', 'okay', 'good', 'great'] as const;

type Mood = (typeof MOODS)[number];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function todayParts() {
  const now = new Date();
  return {
    key: now.toISOString().slice(0, 10),
    year: now.getUTCFullYear(),
    month: now.getUTCMonth() + 1,
  };
}

function monthLabel(year: number, month: number) {
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

function buildMonthGrid(year: number, month: number) {
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: { key: string; day: number; inMonth: boolean }[] = [];

  const prevDays = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  const prevMonth = month === 1 ? 12 : month - 1;
  const prevYear = month === 1 ? year - 1 : year;
  for (let i = startWeekday - 1; i >= 0; i--) {
    const day = prevDays - i;
    cells.push({ key: `${prevYear}-${pad(prevMonth)}-${pad(day)}`, day, inMonth: false });
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push({ key: `${year}-${pad(month)}-${pad(day)}`, day, inMonth: true });
  }

  const nextMonth = month === 12 ? 1 : month + 1;
  const nextYear = month === 12 ? year + 1 : year;
  let nextDay = 1;
  while (cells.length < 42) {
    cells.push({ key: `${nextYear}-${pad(nextMonth)}-${pad(nextDay)}`, day: nextDay, inMonth: false });
    nextDay++;
  }

  return cells;
}

function addMonths(year: number, month: number, delta: number) {
  const cursor = new Date(Date.UTC(year, month - 1 + delta, 1));
  return { year: cursor.getUTCFullYear(), month: cursor.getUTCMonth() + 1 };
}

function monthKey(year: number, month: number) {
  return `${year}-${pad(month)}`;
}

function readableDay(dayKey: string) {
  return new Date(`${dayKey}T00:00:00Z`).toLocaleDateString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
}

export function HabitMonthHeatmap({
  habit,
  variant = 'card',
}: {
  habit: Habit;
  variant?: 'card' | 'detail';
}) {
  const initial = todayParts();
  const [year, setYear] = useState(initial.year);
  const [month, setMonth] = useState(initial.month);
  const [open, setOpen] = useState(false);
  const [selectedDay, setSelectedDay] = useState(initial.key);
  const calendar = useHabitCalendar(habit._id, year, month);

  const daysByKey = useMemo(() => {
    const map = new Map<string, HabitCalendarDay>();
    calendar.data?.days.forEach((day) => map.set(day.day, day));
    return map;
  }, [calendar.data]);

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);
  const done = calendar.data?.days.filter((day) => day.count > 0).length ?? 0;
  const total = calendar.data?.days.length ?? new Date(Date.UTC(year, month, 0)).getUTCDate();
  const startKey = calendar.data?.startedAt ?? habit.startedAt.slice(0, 10);
  const todayKey = calendar.data?.today ?? initial.key;
  const currentMonthKey = monthKey(year, month);

  const openCalendar = (day?: string) => {
    if (day) setSelectedDay(day);
    setOpen(true);
  };

  const goMonth = (delta: number) => {
    const next = addMonths(year, month, delta);
    const firstDay = `${next.year}-${pad(next.month)}-01`;
    const lastDay = `${next.year}-${pad(next.month)}-${pad(
      new Date(Date.UTC(next.year, next.month, 0)).getUTCDate()
    )}`;
    setYear(next.year);
    setMonth(next.month);
    setSelectedDay(firstDay < startKey ? startKey : lastDay > todayKey ? todayKey : firstDay);
  };

  const heatmapGridClass =
    variant === 'detail'
      ? 'grid-cols-7 grid gap-7 sm:grid-cols-10 md:grid-cols-10 lg:grid-cols-15 2xl:grid-cols-15 w-full'
      : 'grid gap-2 grid-cols-10  w-full';
  const heatmapCellClass = variant === 'detail' ? 'h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10' : 'h-5 w-5 sm:h-6 sm:w-6 md:h-7 md:w-7';

  return (
    <>
      <section
        className={cn(
          'relative rounded-xl border border-border/60 bg-card/40',
          variant === 'detail' ? 'p-4 sm:p-5' : 'p-3'
        )}
      >
        <div className="mb-3 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className={cn('font-semibold', variant === 'detail' ? 'text-base' : 'text-xs')}>
              Monthly heat map
            </div>
            <div className="text-[11px] text-muted-foreground">
              {monthLabel(year, month)} · {done}/{total}
            </div>
          </div>
          <Button
            type="button"
            size={variant === 'detail' ? 'sm' : 'icon'}
            variant="ghost"
            onClick={() => openCalendar()}
            aria-label="Open monthly calendar"
            className={variant === 'card' ? 'h-8 w-8 shrink-0' : undefined}
          >
            <CalendarDays className="h-4 w-4" />
            {variant === 'detail' && 'Calendar'}
          </Button>
        </div>

        {calendar.isLoading ? (
          <Skeleton className={variant === 'detail' ? 'h-28' : 'h-20'} />
        ) : (
          <div className={heatmapGridClass}>
            {grid.map((cell, index) => {
              const day = daysByKey.get(cell.key);
              const completed = !!day?.count;
              const disabled =
                !cell.inMonth ||
                cell.key < startKey ||
                cell.key > todayKey;

              return (
                <motion.button
                  key={`${cell.key}-${cell.inMonth ? 'in' : 'out'}`}
                  type="button"
                  initial={{ opacity: 0, scale: 0.72 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(index * 0.006, 0.18) }}
                  disabled={disabled}
                  onClick={() => openCalendar(cell.key)}
                  title={cell.inMonth ? `${cell.key} · ${completed ? 'completed' : 'not completed'}` : undefined}
                  className={cn(
                    'aspect-square border transition-all rounded-full flex items-center justify-center',
                    heatmapCellClass,
                    cell.inMonth ? 'border-border/50' : 'border-border/20 bg-muted/20',
                    !disabled && 'hover:scale-110 hover:border-primary/80',
                    disabled && cell.inMonth && 'cursor-not-allowed opacity-75',
                    completed ? 'border-transparent shadow-sm' : 'bg-muted/75'
                  )}
                  style={{
                    backgroundColor: completed ? habit.color : undefined,
                    boxShadow: completed ? `0 0 10px ${habit.color}55` : undefined,
                  }}
                >
                  {completed && <Check className="h-4 w-4 text-white" />}
                </motion.button>
              );
            })}
          </div>
        )}
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl p-4">
          <DialogHeader className="mb-3">
            <DialogTitle>{habit.name} calendar</DialogTitle>
            <DialogDescription>
              Select any eligible day in the month, then log or update that completion.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_15rem]">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22 }}
              className="rounded-xl border border-border/60 bg-background/25 p-2.5"
            >
              <div className="mb-2 flex items-center justify-between gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => goMonth(-1)}
                  aria-label="Previous month"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-center font-semibold">{monthLabel(year, month)}</div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => goMonth(1)}
                  aria-label="Next month"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {WEEKDAYS.map((day) => (
                  <div key={day}>{day}</div>
                ))}
              </div>

              <div className="mt-1.5 grid grid-cols-7 gap-1">
                {grid.map((cell, index) => {
                  const day = daysByKey.get(cell.key);
                  const completed = !!day?.count;
                  const selected = selectedDay === cell.key;
                  const disabled =
                    !cell.inMonth ||
                    cell.key < startKey ||
                    cell.key > todayKey;

                  return (
                    <motion.button
                      key={`${cell.key}-dialog`}
                      type="button"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      whileHover={!disabled ? { scale: 1.04, y: -1 } : undefined}
                      whileTap={!disabled ? { scale: 0.97 } : undefined}
                      transition={{ delay: Math.min(index * 0.004, 0.12) }}
                      disabled={disabled}
                      onClick={() => setSelectedDay(cell.key)}
                      className={cn(
                        'flex h-10 flex-col items-center justify-center rounded-md border text-[11px] transition-colors',
                        cell.inMonth ? 'border-border/60 bg-card/40' : 'border-border/20 bg-muted/20 text-muted-foreground/40',
                        !disabled && 'hover:border-primary/50 hover:bg-card/70',
                        disabled && cell.inMonth && 'cursor-not-allowed opacity-55',
                        selected && 'border-primary ring-2 ring-primary/50',
                        completed && 'text-white shadow-md'
                      )}
                      style={{
                        backgroundColor: completed ? habit.color : undefined,
                        boxShadow: completed ? `0 0 14px ${habit.color}44` : undefined,
                      }}
                    >
                      <span className="font-semibold">{cell.day}</span>
                      {completed && <Check className="mt-0.5 h-3 w-3" />}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>

            <CalendarEditor
              habit={habit}
              selectedDay={selectedDay}
              disabled={selectedDay.slice(0, 7) !== currentMonthKey || selectedDay < startKey || selectedDay > todayKey}
              day={daysByKey.get(selectedDay)}
              compact
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function CalendarEditor({
  habit,
  selectedDay,
  disabled,
  day,
  compact = false,
}: {
  habit: Habit;
  selectedDay: string;
  disabled?: boolean;
  day?: HabitCalendarDay;
  compact?: boolean;
}) {
  const complete = useCompleteHabit();
  const update = useUpdateLog(habit._id);
  const remove = useDeleteLog(habit._id);
  const [notes, setNotes] = useState(day?.log?.notes ?? '');
  const [minutes, setMinutes] = useState(day?.log?.minutes ?? habit.estimatedMinutes);
  const [mood, setMood] = useState<Mood | undefined>(day?.log?.mood as Mood | undefined);
  const [energy, setEnergy] = useState<string | undefined>(
    typeof day?.log?.energy === 'number' ? String(day.log.energy) : undefined
  );
  const [err, setErr] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const logId = day?.log?._id;
  const fieldClass = compact ? 'h-9 text-sm' : undefined;
  const labelClass = compact ? 'text-xs' : undefined;

  useEffect(() => {
    setNotes(day?.log?.notes ?? '');
    setMinutes(day?.log?.minutes ?? habit.estimatedMinutes);
    setMood(day?.log?.mood as Mood | undefined);
    setEnergy(typeof day?.log?.energy === 'number' ? String(day.log.energy) : undefined);
    setErr(null);
  }, [day?.log, habit.estimatedMinutes]);

  const save = async () => {
    if (disabled) return;
    setErr(null);
    try {
      const payload = {
        notes: notes.trim(),
        minutes,
        mood,
        energy: energy ? Number(energy) : undefined,
      };

      if (logId) {
        await update.mutateAsync({ logId, ...payload });
      } else {
        await complete.mutateAsync({ id: habit._id, date: selectedDay, ...payload });
      }
    } catch (e) {
      setErr(apiError(e));
    }
  };

  const doDelete = async () => {
    if (!logId) return;
    setErr(null);
    try {
      await remove.mutateAsync(logId);
    } catch (e) {
      setErr(apiError(e));
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: 8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.22 }}
      className={cn(
        'rounded-xl border border-border/60 bg-background/35',
        compact ? 'p-2.5' : 'p-4'
      )}
    >
      <div className={cn('flex items-start justify-between gap-2', compact ? 'mb-2' : 'mb-3')}>
        <div>
          <div className={cn('font-semibold', compact && 'text-sm')}>{readableDay(selectedDay)}</div>
          <div className="text-[11px] leading-snug text-muted-foreground">
            {disabled
              ? 'Choose an eligible day from this month to make changes.'
              : logId
                ? 'Completion logged. Update the details below.'
                : 'No completion yet. Add one for this date.'}
          </div>
        </div>
        {logId && (
          <Button type="button" variant="ghost" size="icon" onClick={() => setDeleteConfirmOpen(true)} aria-label="Delete completion">
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        )}
      </div>

      <div className={cn('grid gap-2.5', compact ? 'grid-cols-1' : 'md:grid-cols-[120px_1fr_120px_120px]')}>
        <div className="space-y-1">
          <Label htmlFor="calendar-minutes" className={labelClass}>Minutes</Label>
          <Input
            id="calendar-minutes"
            type="number"
            min={0}
            max={600}
            value={minutes}
            disabled={disabled}
            className={fieldClass}
            onChange={(event) => setMinutes(Number(event.target.value))}
          />
        </div>
        <div className={cn('space-y-1', !compact && 'md:col-span-3')}>
          <Label htmlFor="calendar-notes" className={labelClass}>Notes</Label>
          <Textarea
            id="calendar-notes"
            value={notes}
            disabled={disabled}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="What happened on this day?"
            className={compact ? 'min-h-16 text-sm' : undefined}
          />
        </div>
        <div className={cn('space-y-1', !compact && 'md:col-span-2')}>
          <div className="flex items-center justify-between">
            <Label className={labelClass}>Mood</Label>
            {mood && (
              <button
                type="button"
                onClick={() => setMood(undefined)}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={disabled}
              >
                Clear
              </button>
            )}
          </div>
          <Select value={mood} onValueChange={(value) => setMood(value as Mood)} disabled={disabled}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {MOODS.map((item) => (
                <SelectItem key={item} value={item} className="capitalize">
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <Label className={labelClass}>Energy</Label>
            {energy && (
              <button
                type="button"
                onClick={() => setEnergy(undefined)}
                className="text-xs text-muted-foreground hover:text-foreground"
                disabled={disabled}
              >
                Clear
              </button>
            )}
          </div>
          <Select value={energy} onValueChange={setEnergy} disabled={disabled}>
            <SelectTrigger className={fieldClass}>
              <SelectValue placeholder="Optional" />
            </SelectTrigger>
            <SelectContent>
              {[1, 2, 3, 4, 5].map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item}/5
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant={logId ? 'default' : 'glow'}
            onClick={save}
            loading={complete.isPending || update.isPending}
            disabled={disabled}
            size={compact ? 'sm' : 'default'}
            className="w-full"
          >
            {logId ? 'Update' : 'Log day'}
          </Button>
        </div>
      </div>

      {err && <p className="mt-3 text-sm text-destructive">{err}</p>}
      <ConfirmDialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        onConfirm={doDelete}
        title="Delete completion"
        description="Delete this completion? Streak and XP will recompute."
        confirmLabel="Delete"
      />
    </motion.div>
  );
}
