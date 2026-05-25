'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, Sparkles, Target, Settings, LogOut, Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useAuth } from '@/stores/auth';
import { useRouter } from 'next/navigation';

const items = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: Target },
  { href: '/todos', label: 'Todos', icon: ListTodo },
  { href: '/about', label: 'Achievements', icon: Trophy },
  { href: '/settings', label: 'Settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const logout = useAuth((s) => s.logout);
  const user = useAuth((s) => s.user);

  return (
    <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-border/60 bg-card/40 p-4 backdrop-blur-xl md:flex">
      <Link href="/dashboard" className="flex items-center gap-2 px-2 py-2 font-display text-lg font-bold">
        <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-lg shadow-primary/30">
          <Sparkles className="h-4 w-4" />
        </span>
        Loop Atom
      </Link>

      <nav className="mt-8 flex flex-col gap-1">
        {items.map((it) => {
          const active = pathname.startsWith(it.href);
          return (
            <Link
              key={it.href}
              href={it.href}
              className={cn(
                'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors',
                active ? 'text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/40'
              )}
            >
              {active && (
                <motion.span
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-lg bg-primary/10 ring-1 ring-primary/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                />
              )}
              <it.icon className="relative h-4 w-4" />
              <span className="relative">{it.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-xl border border-border/60 p-3">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-semibold text-primary-foreground">
            {user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-medium">{user?.username}</div>
            <div className="text-xs text-muted-foreground">Lvl {user?.level ?? 1}</div>
          </div>
          <button
            onClick={async () => {
              await logout();
              router.push('/login');
            }}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
