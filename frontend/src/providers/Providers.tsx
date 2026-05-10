'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { initTheme } from '@/stores/theme';
import { useAuth } from '@/stores/auth';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: 1, refetchOnWindowFocus: false },
        },
      })
  );

  const hydrate = useAuth((s) => s.hydrate);

  useEffect(() => {
    initTheme();
    hydrate();
  }, [hydrate]);

  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}
