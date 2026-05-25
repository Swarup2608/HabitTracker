"use client";

import { motion } from 'framer-motion';
import type { ElementType } from 'react';
import { Moon, Sword, Sprout } from 'lucide-react';
import { useTheme } from '@/stores/theme';
import type { ThemeMode } from '@/lib/types';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const THEMES: { id: ThemeMode; title: string; subtitle: string; icon: ElementType; gradient: string }[] = [
  { id: 'dark', title: 'Dark', subtitle: 'Calm focus', icon: Moon, gradient: 'from-zinc-700 to-zinc-900' },
  { id: 'gaming', title: 'Gaming', subtitle: 'Neon, glow, XP', icon: Sword, gradient: 'from-cyan-500 to-fuchsia-600' },
  { id: 'fantasy', title: 'Fantasy', subtitle: 'Calm, nature, poetic', icon: Sprout, gradient: 'from-emerald-400 to-amber-300' },
];

interface ThemeModePickerProps {
  className?: string;
  onSelect?: (theme: ThemeMode) => void;
}

export function ThemeModePicker({ className, onSelect }: ThemeModePickerProps) {
  const { theme, setTheme } = useTheme();

  const handleSelect = (themeId: ThemeMode) => {
    setTheme(themeId);
    onSelect?.(themeId);
  };

  return (
    <div className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {THEMES.map((mode) => {
        const Icon = mode.icon;
        const active = theme === mode.id;
        return (
          <motion.button
            key={mode.id}
            type="button"
            whileHover={{ y: -3 }}
            onClick={() => handleSelect(mode.id)}
            aria-pressed={active}
            className={cn(
              'group relative overflow-hidden rounded-3xl border p-4 text-left transition-all duration-300',
              active
                ? 'border-primary ring-2 ring-primary/30 bg-white/10 shadow-[0_20px_60px_-20px_rgba(109,40,217,0.6)]'
                : 'border-border/60 bg-background/90 hover:border-border/90 hover:bg-white/5'
            )}
          >
            <div className={cn('absolute inset-0 bg-gradient-to-br opacity-30 transition-opacity', mode.gradient, active ? 'opacity-40' : 'opacity-0 group-hover:opacity-20')} />
            <div className="relative flex items-center justify-between">
              <Icon className="h-5 w-5 text-foreground" aria-hidden="true" />
              {active && <Badge>Active</Badge>}
            </div>
            <div className="relative mt-4 text-sm font-semibold text-foreground">{mode.title}</div>
            <div className="relative mt-1 text-xs text-muted-foreground">{mode.subtitle}</div>
          </motion.button>
        );
      })}
    </div>
  );
}
