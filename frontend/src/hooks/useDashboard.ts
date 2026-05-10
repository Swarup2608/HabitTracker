import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { DashboardSummary } from '@/lib/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: async () => {
      const res = await api.get<DashboardSummary>('/dashboard');
      return res.data;
    },
  });
}
