import { Sidebar } from '@/components/shell/Sidebar';
import { MobileNav } from '@/components/shell/MobileNav';
import { AuthGate } from '@/components/shell/AuthGate';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGate>
      <div className="relative flex min-h-screen">
        <div className="pointer-events-none fixed inset-0 -z-10 gradient-mesh opacity-40" />
        <Sidebar />
        <main className="flex-1 px-4 pb-24 pt-6 md:px-8 md:pb-10">{children}</main>
        <MobileNav />
      </div>
    </AuthGate>
  );
}
