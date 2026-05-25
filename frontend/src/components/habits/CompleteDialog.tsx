'use client';

import { useState } from 'react';
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
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCompleteHabit, type CompleteHabitResponse } from '@/hooks/useHabits';
import { apiError } from '@/lib/api';
import type { Habit } from '@/lib/types';

const MOODS = ['awful', 'bad', 'okay', 'good', 'great'] as const;

const todayKey = () => new Date().toISOString().slice(0, 10);

export function CompleteDialog({
  habit,
  open,
  onOpenChange,
  defaultDate,
  onCompleted,
}: {
  habit: Habit;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultDate?: string;
  onCompleted?: (res: CompleteHabitResponse) => void;
}) {
  const complete = useCompleteHabit();
  const [date, setDate] = useState(defaultDate ?? todayKey());
  const [notes, setNotes] = useState('');
  const [mood, setMood] = useState<string | undefined>();
  const [energy, setEnergy] = useState<string | undefined>();
  const [minutes, setMinutes] = useState<number>(habit.estimatedMinutes);
  const [err, setErr] = useState<string | null>(null);

  const startKey = habit.startedAt.slice(0, 10);
  const isPast = date < todayKey();

  const submit = async () => {
    setErr(null);
    try {
      const res = await complete.mutateAsync({
        id: habit._id,
        date: date === todayKey() ? undefined : date,
        notes: notes.trim() || undefined,
        mood: mood as 'good' | undefined,
        energy: energy ? Number(energy) : undefined,
        minutes,
      });
      setNotes('');
      setMood(undefined);
      setEnergy(undefined);
      setMinutes(habit.estimatedMinutes);
      setDate(todayKey());
      onOpenChange(false);
      onCompleted?.(res);
    } catch (e) {
      setErr(apiError(e));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Complete: {habit.name}</DialogTitle>
          <DialogDescription>
            Add a description to remember today. You can also log a past day.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={date}
                min={startKey}
                max={todayKey()}
                onChange={(e) => setDate(e.target.value)}
              />
              {isPast && <p className="text-[11px] text-amber-400">Backfilling a past day</p>}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="minutes">Minutes</Label>
              <Input
                id="minutes"
                type="number"
                min={0}
                max={600}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="notes">Description / notes</Label>
            <Textarea
              id="notes"
              placeholder="What happened? What did you notice?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Mood</Label>
                {mood && (
                  <button
                    type="button"
                    onClick={() => setMood(undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Select value={mood} onValueChange={setMood}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {MOODS.map((m) => (
                    <SelectItem key={m} value={m} className="capitalize">
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label>Energy</Label>
                {energy && (
                  <button
                    type="button"
                    onClick={() => setEnergy(undefined)}
                    className="text-xs text-muted-foreground hover:text-foreground"
                  >
                    Clear
                  </button>
                )}
              </div>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger>
                  <SelectValue placeholder="Optional" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map((n) => (
                    <SelectItem key={n} value={String(n)}>
                      {n}/5
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {err && <p className="text-sm text-destructive">{err}</p>}
        </div>

        <div className="mt-5 flex items-center justify-end gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="glow" onClick={submit} loading={complete.isPending}>
            {isPast ? 'Log this day' : 'Complete today'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
