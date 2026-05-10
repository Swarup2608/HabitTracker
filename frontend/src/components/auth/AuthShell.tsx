'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import Link from 'next/link';

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden p-6">
      <div className="absolute inset-0 gradient-mesh" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-background/60 to-background" />

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="relative z-10 w-full max-w-md rounded-3xl border border-border/60 bg-card/60 p-8 shadow-2xl backdrop-blur-2xl"
      >
        <Link href="/" className="mb-6 inline-flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </span>
          Tracker
        </Link>
        <h1 className="font-display text-2xl font-semibold">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        <div className="mt-6">{children}</div>
        {footer ? <div className="mt-6 text-sm text-muted-foreground">{footer}</div> : null}
      </motion.div>
    </main>
  );
}
