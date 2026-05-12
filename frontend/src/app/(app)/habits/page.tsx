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
import { resolveCategory } from '@/lib/categories';

export default function HabitsPage() {
  const { data: habits, isLoading } = useHabits();
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'paused' | 'archived'>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const categories = useMemo(() => {
    if (!habits) return [] as { value: string; label: string; count: number }[];
    const counts = new Map<string, { label: string; count: number }>();
    for (const h of habits) {
      const c = resolveCategory(h.category);
      const entry = counts.get(c.value) ?? { label: c.label, count: 0 };
      entry.count += 1;
      counts.set(c.value, entry);
    }
    return Array.from(counts.entries()).map(([value, v]) => ({ value, ...v }));
  }, [habits]);

  const filtered = useMemo(() => {
    if (!habits) return [];
    return habits
      .filter((h) => (filter === 'all' ? true : h.status === filter))
      .filter((h) =>
        categoryFilter === 'all' ? true : resolveCategory(h.category).value === categoryFilter
      )
      .filter((h) => h.name.toLowerCase().includes(q.toLowerCase()));
  }, [habits, q, filter, categoryFilter]);

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

      {categories.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs uppercase tracking-wide text-muted-foreground mr-1">Category</span>
          <button onClick={() => setCategoryFilter('all')}>
            <Badge variant={categoryFilter === 'all' ? 'default' : 'outline'} className="cursor-pointer">
              All
            </Badge>
          </button>
          {categories.map((c) => {
            const Icon = resolveCategory(c.value).icon;
            const active = categoryFilter === c.value;
            return (
              <button key={c.value} onClick={() => setCategoryFilter(c.value)}>
                <Badge variant={active ? 'default' : 'outline'} className="cursor-pointer gap-1">
                  <Icon className="h-3 w-3" />
                  {c.label}
                  <span className="opacity-60">· {c.count}</span>
                </Badge>
              </button>
            );
          })}
        </div>
      )}

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
