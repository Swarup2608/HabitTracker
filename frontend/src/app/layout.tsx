import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers/Providers';
import { PublicMobileNav } from '@/components/shell/PublicMobileNav';
import { ErrorBoundary } from '@/components/ui/error-boundary';

export const metadata: Metadata = {
  title: 'Loop Atom — Gamified Habit Tracker',
  description: 'Transform your life through tiny, consistent daily actions. Enterprise-grade habit tracking with gamification.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground dyana-puff">
        <ErrorBoundary>
          <Providers>
            {children}
            <PublicMobileNav />
          </Providers>
        </ErrorBoundary>
      </body>
    </html>
  );
}
