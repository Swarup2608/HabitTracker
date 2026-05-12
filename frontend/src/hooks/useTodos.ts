import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import type { Todo } from '@/lib/types';

export interface TodosResponse {
  today: string;
  grouped: Record<string, Todo[]>;
  range?: { from: string; to: string };
}

export function useTodos(params?: { year?: number; month?: number }) {
  const qs =
    params?.year && params?.month
      ? `?year=${params.year}&month=${params.month}`
      : '';
  const key = params?.year && params?.month
    ? ['todos', params.year, params.month]
    : ['todos'];
  return useQuery({
    queryKey: key,
    queryFn: async () => (await api.get<TodosResponse>(`/todos${qs}`)).data,
  });
}

export interface CreateTodoInput {
  title: string;
  priority?: string;
  notes?: string;
  dayKey?: string;
  imageUrl?: string;
  link?: string;
  location?: string;
}

export function useCreateTodo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: CreateTodoInput) =>
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
      const prev = qc.getQueryData<TodosResponse>(['todos']);
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
