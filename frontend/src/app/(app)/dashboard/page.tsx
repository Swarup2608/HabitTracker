'use client';

import { motion } from 'framer-motion';
import {
  Activity,
  Brain,
  Crown,
  Flame,
  Gauge,
  Sparkles,
  Star,
  Target,
  Trophy,
  Zap,
} from 'lucide-react';
import { useDashboard } from '@/hooks/useDashboard';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { Heatmap } from '@/components/dashboard/Heatmap';
import { MonthlyChart, WeeklyChart } from '@/components/dashboard/PerformanceCharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/stores/auth';

const ACH_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Sparkles, Flame, Zap, Crown, Star, Trophy,
};

export default function DashboardPage() {
  const user = useAuth((s) => s.user);
  const { data, isLoading } = useDashboard();

  if (isLoading || !data) return <DashboardSkeleton />;

  const m = data.metrics;
  const burnoutColor = m.burnoutRisk === 'high' ? 'danger' : m.burnoutRisk === 'medium' ? 'warn' : 'success';

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <motion.header
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between"
      >
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="font-display text-3xl font-bold tracking-tight md:text-4xl">
            {user?.username}, <span className="text-gradient">level {data.user.level}</span>
          </h1>
        </div>
        <div className="w-full md:w-80">
          <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
            <span>{data.user.xp} XP</span>
            <span>
              {data.user.levelInto} / {data.user.levelSpan} to next
            </span>
          </div>
          <Progress value={data.user.levelPercent} glow />
        </div>
      </motion.header>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <MetricCard label="Current streak" value={`${m.currentStreak}d`} icon={Flame} accent="amber" delay={0.0} hint={`Longest ${m.longestStreak}d`} />
        <MetricCard label="Today" value={`${m.completionPct}%`} icon={Target} accent="primary" delay={0.05} hint={`${m.completedToday} / ${m.activeHabits}`} />
        <MetricCard label="Consistency" value={`${m.consistencyRate}%`} icon={Activity} accent="cyan" delay={0.1} hint="Last 30 days" />
        <MetricCard label="Productivity" value={m.productivityScore} icon={Gauge} accent="emerald" delay={0.15} hint="Composite score" />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Weekly performance</span>
              <Badge variant="outline">7 days</Badge>
            </CardTitle>
            <CardDescription>Daily completions over the last week.</CardDescription>
          </CardHeader>
          <CardContent>
            <WeeklyChart data={data.weekly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Burnout risk</span>
              <Badge variant={burnoutColor as 'danger' | 'warn' | 'success'}>{m.burnoutRisk.toUpperCase()}</Badge>
            </CardTitle>
            <CardDescription>Trend signal across active habits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                <Brain className="h-5 w-5" />
              </div>
              <div>
                <div className="text-2xl font-semibold">{m.habitVelocity}</div>
                <div className="text-xs text-muted-foreground">Velocity (avg/day, 7d)</div>
              </div>
            </div>
            <p className="rounded-lg border border-border/60 bg-muted/30 p-3 text-sm leading-relaxed">
              {m.burnoutRisk === 'high'
                ? 'You\'re pushing hard. Consider archiving one habit or scheduling a recovery day.'
                : m.burnoutRisk === 'medium'
                ? 'Slight downward trend — protect your top 2 habits this week.'
                : 'Pace looks healthy. Stack one micro-habit if you have bandwidth.'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>30-day heatmap</CardTitle>
            <CardDescription>Each square is one day. Brighter = more completions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Heatmap data={data.heatmap} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly</CardTitle>
            <CardDescription>Completions per week.</CardDescription>
          </CardHeader>
          <CardContent>
            <MonthlyChart data={data.monthly} />
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Top habits</CardTitle>
            <CardDescription>Your highest streaks right now.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topHabits.length === 0 && (
              <p className="text-sm text-muted-foreground">No habits yet — create one on the Habits page.</p>
            )}
            {data.topHabits.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/60 p-3">
                <div
                  className="grid h-10 w-10 place-items-center rounded-lg text-white"
                  style={{ backgroundColor: h.color }}
                >
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate font-medium">{h.name}</span>
                    <span className="inline-flex items-center gap-1 text-sm text-amber-400">
                      <Flame className="h-3.5 w-3.5" /> {h.currentStreak}
                    </span>
                  </div>
                  <div className="mt-1.5">
                    <Progress value={h.completionRate} />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>{data.achievements.length} unlocked</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-2">
            {data.achievements.length === 0 && (
              <p className="col-span-3 text-sm text-muted-foreground">Your first badge is one streak away.</p>
            )}
            {data.achievements.map((a) => {
              const Icon = ACH_ICONS[a.icon] ?? Trophy;
              return (
                <motion.div
                  key={a._id}
                  whileHover={{ y: -3 }}
                  className="flex flex-col items-center gap-1.5 rounded-xl border border-border/60 bg-card/40 p-3 text-center"
                  title={a.description}
                >
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-primary/15 text-primary animate-glow-pulse">
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="text-[11px] font-medium leading-tight">{a.title}</div>
                </motion.div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <Skeleton className="h-12 w-1/3" />
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
  );
}
