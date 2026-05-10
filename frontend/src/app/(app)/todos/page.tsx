'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { useCreateTodo, useDeleteTodo, useTodos, useUpdateTodo } from '@/hooks/useTodos';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatRelativeDay, cn } from '@/lib/utils';
import type { Todo } from '@/lib/types';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const PRIORITY_COLOR: Record<string, string> = {
  low: 'bg-slate-500/20 text-slate-300',
  medium: 'bg-cyan-500/20 text-cyan-300',
  high: 'bg-amber-500/20 text-amber-300',
  urgent: 'bg-rose-500/20 text-rose-300',
};

export default function TodosPage() {
  const { data, isLoading } = useTodos();
  const create = useCreateTodo();
  const [title, setTitle] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high' | 'urgent'>('medium');

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    await create.mutateAsync({ title: title.trim(), priority });
    setTitle('');
  };

  if (isLoading || !data) {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <Skeleton className="h-12" />
        <Skeleton className="h-40" />
      </div>
    );
  }

  const todayList = data.grouped[data.today] ?? [];
  const todayDone = todayList.filter((t) => t.completed).length;
  const todayPct = todayList.length === 0 ? 0 : Math.round((todayDone / todayList.length) * 100);
  const otherDays = Object.keys(data.grouped)
    .filter((k) => k !== data.today)
    .sort()
    .reverse();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="font-display text-3xl font-bold">Today</h1>
        <p className="text-sm text-muted-foreground">{formatRelativeDay(data.today)} · {todayPct}% complete</p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Add to today</CardTitle>
          <CardDescription>Capture it fast. Reorder it later.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex flex-col gap-2 md:flex-row">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What needs to happen today?"
              className="flex-1"
            />
            <Select value={priority} onValueChange={(v) => setPriority(v as typeof priority)}>
              <SelectTrigger className="md:w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
            <Button type="submit" loading={create.isPending}>
              <Plus className="h-4 w-4" /> Add
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Today</span>
            <Badge variant={todayPct === 100 ? 'success' : 'outline'}>{todayDone}/{todayList.length}</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {todayList.length === 0 && (
            <p className="text-sm text-muted-foreground">Nothing here yet. Capture one tiny task above.</p>
          )}
          <AnimatePresence initial={false}>
            {todayList.map((t) => (
              <TodoRow key={t._id} todo={t} />
            ))}
          </AnimatePresence>
        </CardContent>
      </Card>

      {otherDays.map((day) => {
        const list = data.grouped[day];
        const done = list.filter((t) => t.completed).length;
        return (
          <Card key={day} className="opacity-90">
            <CardHeader>
              <CardTitle className="text-base">{formatRelativeDay(day)}</CardTitle>
              <CardDescription>{done}/{list.length} completed</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              {list.map((t) => (
                <TodoRow key={t._id} todo={t} faded />
              ))}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function TodoRow({ todo, faded = false }: { todo: Todo; faded?: boolean }) {
  const update = useUpdateTodo();
  const remove = useDeleteTodo();
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -10 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border/60 bg-card/40 p-3 transition-colors',
        faded && 'opacity-70'
      )}
    >
      <button
        onClick={() => update.mutate({ id: todo._id, completed: !todo.completed })}
        className="text-muted-foreground transition-colors hover:text-primary"
        aria-label="Toggle complete"
      >
        {todo.completed ? (
          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        ) : (
          <Circle className="h-5 w-5" />
        )}
      </button>
      <div className="min-w-0 flex-1">
        <div className={cn('truncate text-sm', todo.completed && 'text-muted-foreground line-through')}>
          {todo.title}
        </div>
        {todo.notes && <p className="mt-0.5 text-xs text-muted-foreground">{todo.notes}</p>}
      </div>
      <span className={cn('rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wide', PRIORITY_COLOR[todo.priority])}>
        {todo.priority}
      </span>
      <button
        onClick={() => remove.mutate(todo._id)}
        className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
        aria-label="Delete todo"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </motion.div>
  );
}
