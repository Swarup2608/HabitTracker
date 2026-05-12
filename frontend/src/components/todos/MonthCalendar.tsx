'use client';

import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useTodos } from '@/hooks/useTodos';
import { CreateTodoDialog } from './CreateTodoDialog';
import { cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function buildMonthGrid(year: number, month: number) {
  // month is 1-12
  const first = new Date(Date.UTC(year, month - 1, 1));
  const startWeekday = first.getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells: { key: string; day: number; inMonth: boolean }[] = [];
  // Leading blanks from previous month
  const prevDays = new Date(Date.UTC(year, month - 1, 0)).getUTCDate();
  for (let i = startWeekday - 1; i >= 0; i--) {
    const d = prevDays - i;
    const pm = month === 1 ? 12 : month - 1;
    const py = month === 1 ? year - 1 : year;
    cells.push({ key: `${py}-${pad(pm)}-${pad(d)}`, day: d, inMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ key: `${year}-${pad(month)}-${pad(d)}`, day: d, inMonth: true });
  }
  // Pad to a full 6-week grid (42 cells) for stable height
  let next = 1;
  const nm = month === 12 ? 1 : month + 1;
  const ny = month === 12 ? year + 1 : year;
  while (cells.length < 42) {
    cells.push({ key: `${ny}-${pad(nm)}-${pad(next)}`, day: next, inMonth: false });
    next++;
  }
  return cells;
}

const PRIORITY_DOT: Record<string, string> = {
  low: 'bg-slate-400',
  medium: 'bg-cyan-400',
  high: 'bg-amber-400',
  urgent: 'bg-rose-500',
};

export function MonthCalendar() {
  const today = new Date();
  const todayKey = `${today.getFullYear()}-${pad(today.getMonth() + 1)}-${pad(today.getDate())}`;
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState<string | null>(todayKey);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading } = useTodos({ year, month });
  const cells = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const goPrev = () => {
    if (month === 1) {
      setYear((y) => y - 1);
      setMonth(12);
    } else {
      setMonth((m) => m - 1);
    }
  };
  const goNext = () => {
    if (month === 12) {
      setYear((y) => y + 1);
      setMonth(1);
    } else {
      setMonth((m) => m + 1);
    }
  };

  const monthLabel = new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  });

  const selectedTodos: Todo[] = (selectedDay && data?.grouped[selectedDay]) || [];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={goPrev} aria-label="Previous month">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="min-w-[10rem] text-center text-base font-semibold">{monthLabel}</div>
          <Button variant="ghost" size="icon" onClick={goNext} aria-label="Next month">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button
          variant="glow"
          size="sm"
          onClick={() => {
            if (!selectedDay) setSelectedDay(todayKey);
            setDialogOpen(true);
          }}
        >
          <Plus className="h-4 w-4" /> Add for selected day
        </Button>
      </div>

      <div className="grid grid-cols-7 gap-1.5 text-xs text-muted-foreground">
        {WEEKDAYS.map((d) => (
          <div key={d} className="px-2 py-1 text-center font-medium uppercase tracking-wide">
            {d}
          </div>
        ))}
      </div>

      {isLoading ? (
        <Skeleton className="h-[28rem]" />
      ) : (
        <div className="grid grid-cols-7 gap-1.5">
          {cells.map((cell) => {
            const list = data?.grouped[cell.key] ?? [];
            const isToday = cell.key === todayKey;
            const isSelected = cell.key === selectedDay;
            const done = list.filter((t) => t.completed).length;
            return (
              <button
                key={`${cell.key}-${cell.inMonth ? 'in' : 'out'}`}
                onClick={() => setSelectedDay(cell.key)}
                className={cn(
                  'group flex min-h-[5rem] flex-col rounded-lg border p-1.5 text-left transition-all',
                  cell.inMonth
                    ? 'bg-card/40 border-border/60 hover:border-primary/40'
                    : 'bg-transparent border-border/20 text-muted-foreground/50',
                  isSelected && 'ring-2 ring-primary border-primary/60',
                  isToday && 'bg-primary/10'
                )}
              >
                <div className="flex items-center justify-between text-xs">
                  <span className={cn('font-semibold', isToday && 'text-primary')}>{cell.day}</span>
                  {list.length > 0 && (
                    <span className="text-[10px] text-muted-foreground">
                      {done}/{list.length}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex flex-wrap gap-1">
                  {list.slice(0, 4).map((t) => (
                    <span
                      key={t._id}
                      className={cn('h-1.5 w-1.5 rounded-full', PRIORITY_DOT[t.priority] ?? 'bg-muted')}
                    />
                  ))}
                  {list.length > 4 && (
                    <span className="text-[10px] text-muted-foreground">+{list.length - 4}</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {selectedDay && (
        <div className="rounded-xl border border-border/60 bg-card/30 p-4">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <div className="text-sm font-semibold">
                {new Date(`${selectedDay}T00:00:00Z`).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  timeZone: 'UTC',
                })}
              </div>
              <div className="text-xs text-muted-foreground">
                {selectedTodos.length} {selectedTodos.length === 1 ? 'todo' : 'todos'}
              </div>
            </div>
            <Button size="sm" onClick={() => setDialogOpen(true)}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </div>
          {selectedTodos.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nothing scheduled. Add a todo for this day.</p>
          ) : (
            <ul className="space-y-2">
              {selectedTodos.map((t) => (
                <li
                  key={t._id}
                  className="flex items-start gap-2 rounded-lg border border-border/40 bg-background/40 p-2"
                >
                  <span className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', PRIORITY_DOT[t.priority])} />
                  <div className="min-w-0 flex-1">
                    <div className={cn('text-sm', t.completed && 'text-muted-foreground line-through')}>
                      {t.title}
                    </div>
                    {(t.location || t.link || t.imageUrl) && (
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
                        {t.location && <span>📍 {t.location}</span>}
                        {t.link && (
                          <a
                            href={t.link}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            🔗 link
                          </a>
                        )}
                        {t.imageUrl && (
                          <a
                            href={t.imageUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="text-primary hover:underline"
                          >
                            🖼 image
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                  <Badge variant="outline" className="text-[10px] capitalize">
                    {t.priority}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      <CreateTodoDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        defaultDayKey={selectedDay ?? todayKey}
      />
    </div>
  );
}
