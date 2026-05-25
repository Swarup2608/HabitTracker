'use client';

import { motion } from 'framer-motion';

export function Heatmap({ data }: { data: { day: string; count: number }[] }) {
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {data.map((d, i) => {
        return (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012 }}
            title={`${d.day} — ${d.count} completed`}
            className="aspect-square !rounded-md"
            style={{
              background: d.count === 0
                ? 'hsl(var(--muted) / 0.5)'
                : 'hsl(var(--primary))',
              boxShadow: d.count > 0 ? '0 0 8px hsl(var(--primary) / 0.35)' : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
