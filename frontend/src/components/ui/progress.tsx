'use client';
import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export function Progress({
  value = 0,
  className,
  glow = false,
}: {
  value?: number;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div className={cn('relative h-2 w-full overflow-hidden rounded-full bg-secondary', className)}>
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        transition={{ type: 'spring', stiffness: 60, damping: 18 }}
        className={cn(
          'h-full bg-primary',
          glow && 'shadow-[0_0_18px_hsl(var(--primary)/0.7)]'
        )}
      />
    </div>
  );
}
