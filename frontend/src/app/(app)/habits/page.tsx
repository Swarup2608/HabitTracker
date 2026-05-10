'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Search } from 'lucide-react';
import { useHabits } from '@/hooks/useHabits';
import { HabitCard } from '@/components/habits/HabitCard';
import { CreateHabitDialog } from '@/components/habits/CreateHabitDialog';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');

  const filtered = useMemo(() => {
    if (!habits) return [];
    return habits
      .filter((h) => (filter === 'all' ? true : h.status === filter))
      .filter((h) => h.name.toLowerCase().includes(q.toLowerCase()));
  }, [habits, q, filter]);

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Habits</h1>
          <p className="text-sm text-muted-foreground">{habits?.length ?? 0} total · build your daily ritual.</p>
        </div>
        <CreateHabitDialog />
      </header>

      <div className="flex flex-col items-stretch gap-3 md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search habits…" className="pl-9" />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {(['all', 'active', 'paused', 'archived'] as const).map((f) => (
            <button key={f} onClick={() => setFilter(f)}>
              <Badge variant={filter === f ? 'default' : 'outline'} className="cursor-pointer capitalize">
                {f}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid place-items-center rounded-2xl border border-dashed border-border/60 bg-card/30 py-20 text-center"
        >
          <p className="text-sm text-muted-foreground">No habits match. Try a different filter or create one.</p>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((h) => (
            <HabitCard key={h._id} habit={h} />
          ))}
        </div>
      )}
    </div>
  );
}
