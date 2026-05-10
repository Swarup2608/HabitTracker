import { create } from 'zustand';
import type { ThemeMode } from '@/lib/types';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const STORAGE_KEY = 'tracker_theme';

const apply = (t: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', t);
};

export const useTheme = create<ThemeState>((set) => ({
  theme: (typeof window !== 'undefined' && (localStorage.getItem(STORAGE_KEY) as ThemeMode)) || 'dark',
  setTheme: (t) => {
    apply(t);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
    set({ theme: t });
  },
}));

export const initTheme = () => {
  if (typeof document === 'undefined') return;
  const stored = (localStorage.getItem(STORAGE_KEY) as ThemeMode) || 'dark';
  apply(stored);
};
