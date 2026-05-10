import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Todo } from '@/lib/types';

export function useTodos() {
  return useQuery({
    queryKey: ['todos'],
    queryFn: async () =>
      (await api.get<{ today: string; grouped: Record<string, Todo[]> }>('/todos')).data,
  });
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { title: string; priority?: string; notes?: string }) =>
      (await api.post<{ todo: Todo }>('/todos', input)).data.todo,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useUpdateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...input }: Partial<Todo> & { id: string }) =>
      (await api.patch<{ todo: Todo }>(`/todos/${id}`, input)).data.todo,
    onMutate: async ({ id, ...patch }) => {
      await qc.cancelQueries({ queryKey: ['todos'] });
      const prev = qc.getQueryData<{ today: string; grouped: Record<string, Todo[]> }>(['todos']);
      if (prev) {
        const next = { ...prev, grouped: { ...prev.grouped } };
        for (const k of Object.keys(next.grouped)) {
          next.grouped[k] = next.grouped[k].map((t) => (t._id === id ? { ...t, ...patch } : t));
        }
        qc.setQueryData(['todos'], next);
      }
      return { prev };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.prev) qc.setQueryData(['todos'], ctx.prev);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}

export function useDeleteTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => (await api.delete(`/todos/${id}`)).data,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['todos'] }),
  });
}
