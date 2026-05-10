'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MetricCard({
  label,
  value,
  hint,
  icon: Icon,
  accent,
  delay = 0,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: 'primary' | 'amber' | 'emerald' | 'rose' | 'cyan';
  delay?: number;
}) {
  const accentMap: Record<string, string> = {
    primary: 'from-primary/20 to-primary/0 text-primary',
    amber: 'from-amber-500/20 to-amber-500/0 text-amber-400',
    emerald: 'from-emerald-500/20 to-emerald-500/0 text-emerald-400',
    rose: 'from-rose-500/20 to-rose-500/0 text-rose-400',
    cyan: 'from-cyan-500/20 to-cyan-500/0 text-cyan-400',
  };
  const a = accentMap[accent ?? 'primary'];
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card/60 p-5 backdrop-blur-xl"
    >
      <div className={cn('absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br blur-2xl opacity-60 transition-opacity group-hover:opacity-100', a)} />
      <div className="relative flex items-start justify-between">
        <div>
          <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
          <div className="mt-2 font-display text-3xl font-bold">{value}</div>
          {hint && <div className="mt-1 text-xs text-muted-foreground">{hint}</div>}
        </div>
        <Icon className={cn('h-5 w-5', a.split(' ').pop())} />
      </div>
    </motion.div>
  );
}
