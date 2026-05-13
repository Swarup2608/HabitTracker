import type { Metadata } from 'next';
import './globals.css';
import { Providers } from '@/providers/Providers';
import { PublicMobileNav } from '@/components/shell/PublicMobileNav';

export const metadata: Metadata = {
  title: 'Tracker — Gamified Habit Tracker',
  description: 'A premium, gamified habit tracker that makes consistency addictive.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground dyana-puff">
        <Providers>
          {children}
          <PublicMobileNav />
        </Providers>
      </body>
    </html>
  );
}
