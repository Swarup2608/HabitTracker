'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, ListTodo, Target, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/dashboard', label: 'Home', icon: LayoutDashboard },
  { href: '/habits', label: 'Habits', icon: Target },
  { href: '/todos', label: 'Todos', icon: ListTodo },
  { href: '/settings', label: 'You', icon: Settings },
];

export function MobileNav() {
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 grid grid-cols-4 border-t border-border/60 bg-card/80 backdrop-blur-2xl md:hidden">
      {items.map((it) => {
        const active = pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              'flex flex-col items-center gap-1 py-3 text-[11px]',
              active ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            <it.icon className="h-5 w-5" />
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
