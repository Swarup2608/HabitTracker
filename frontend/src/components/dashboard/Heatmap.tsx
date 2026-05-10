'use client';

import { motion } from 'framer-motion';

export function Heatmap({ data }: { data: { day: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="grid grid-cols-10 gap-1.5">
      {data.map((d, i) => {
        const intensity = d.count / max;
        return (
          <motion.div
            key={d.day}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.012 }}
            title={`${d.day} — ${d.count} completed`}
            className="aspect-square rounded-sm"
            style={{
              background: d.count === 0
                ? 'hsl(var(--muted) / 0.5)'
                : `hsl(var(--primary) / ${0.25 + intensity * 0.75})`,
              boxShadow: d.count > 0 ? `0 0 ${4 + intensity * 8}px hsl(var(--primary) / ${intensity * 0.5})` : 'none',
            }}
          />
        );
      })}
    </div>
  );
}
