'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
import { initTheme } from '@/stores/theme';
import { useAuth } from '@/stores/auth';
import { useAchievementQueue } from '@/stores/achievements';
import { api, onApiError } from '@/lib/api';
import { AchievementPopup } from '@/components/achievements/AchievementPopup';

function AchievementChecker() {
  const user = useAuth((s) => s.user);
  const enqueue = useAchievementQueue((s) => s.enqueue);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.post('/achievements/check');
        if (!cancelled) enqueue(res.data?.unlockedAchievements);
      } catch {
        // swallow — popup is best-effort
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, enqueue]);

  return null;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const lastRateLimitToastAt = useRef(0);
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

  useEffect(() => {
    const unsubscribe = onApiError((error) => {
      if (error.response?.status !== 429) return;

      const now = Date.now();
      if (now - lastRateLimitToastAt.current < 2500) return;
      lastRateLimitToastAt.current = now;

      const data = error.response.data as { error?: string; message?: string } | undefined;
      const message = data?.error || data?.message || 'Too many requests. Please try again shortly.';
      toast.error(message, { id: 'rate-limit-error' });
    });

    return unsubscribe;
  }, []);

  return (
    <QueryClientProvider client={client}>
      {children}
      <AchievementChecker />
      <AchievementPopup />
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
    </QueryClientProvider>
  );
}
