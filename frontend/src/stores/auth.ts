import { create } from 'zustand';
import type { User } from '@/lib/types';
import { api, setAccessToken } from '@/lib/api';

interface AuthState {
  user: User | null;
  loading: boolean;
  hydrate: () => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (u: User | null) => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  hydrate: async () => {
    try {
      const res = await api.get('/users/me');
      set({ user: res.data.user, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    setAccessToken(res.data.accessToken);
    set({ user: res.data.user });
  },
  register: async (email, username, password) => {
    const res = await api.post('/auth/register', { email, username, password });
    setAccessToken(res.data.accessToken);
    set({ user: res.data.user });
  },
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      /* ignore */
    }
    setAccessToken(null);
    set({ user: null });
  },
  setUser: (u) => set({ user: u }),
}));
