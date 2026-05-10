'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowRight, Flame, Sparkles, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 gradient-mesh opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/40 to-background" />

      <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/30">
            <Sparkles className="h-5 w-5" />
          </span>
          Tracker
        </Link>
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild size="sm" variant="glow">
            <Link href="/register">Get started</Link>
          </Button>
        </div>
      </nav>

      <section className="relative z-10 mx-auto max-w-4xl px-6 pt-20 pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card/40 px-3 py-1 text-xs text-muted-foreground backdrop-blur">
            <Sparkles className="h-3 w-3 text-primary" /> v1 — gamified habits, beautifully tracked
          </span>
          <h1 className="mt-6 font-display text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Build habits that
            <br />
            <span className="text-gradient">level you up.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Streaks, XP, achievements, and a dashboard that feels like a game analytics panel.
            Designed for consistency. Engineered for delight.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" variant="glow">
              <Link href="/register">
                Start your streak <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
        </motion.div>
      </section>

      <section className="relative z-10 mx-auto grid max-w-5xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-3">
        {[
          { icon: Flame, title: 'Streaks that matter', body: 'Daily flame counter, longest streak history, and recovery prediction.' },
          { icon: Zap, title: 'XP & levels', body: 'Earn XP per habit difficulty. Level up through a smooth progression curve.' },
          { icon: Trophy, title: 'Achievements', body: 'Unlock badges as you grow. Heatmaps and analytics to feel the momentum.' },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
            className="rounded-2xl border border-border/60 bg-card/40 p-6 backdrop-blur-xl"
          >
            <f.icon className="h-6 w-6 text-primary" />
            <h3 className="mt-4 font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
          </motion.div>
        ))}
      </section>
    </main>
  );
}
