import { cn } from '@/lib/utils';

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'animate-pulse rounded-lg bg-gradient-to-r from-muted/40 via-muted/70 to-muted/40 bg-[length:200%_100%]',
        className
      )}
      {...props}
    />
  );
}
