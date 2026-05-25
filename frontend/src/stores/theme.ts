import { create } from 'zustand';
import type { ThemeMode } from '@/lib/types';

interface ThemeState {
  theme: ThemeMode;
  setTheme: (t: ThemeMode) => void;
}

const STORAGE_KEY = 'loop_atom_theme';
const THEMES: ThemeMode[] = ['dark', 'gaming', 'fantasy'];

const normalizeTheme = (t: string | null): ThemeMode =>
  THEMES.includes(t as ThemeMode) ? (t as ThemeMode) : 'dark';

const apply = (t: ThemeMode) => {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', t);
};

export const useTheme = create<ThemeState>((set) => ({
  theme: typeof window !== 'undefined' ? normalizeTheme(localStorage.getItem(STORAGE_KEY)) : 'dark',
  setTheme: (t) => {
    apply(t);
    if (typeof window !== 'undefined') localStorage.setItem(STORAGE_KEY, t);
    set({ theme: t });
  },
}));

export const initTheme = () => {
  if (typeof document === 'undefined') return;
  const stored = normalizeTheme(localStorage.getItem(STORAGE_KEY));
  localStorage.setItem(STORAGE_KEY, stored);
  apply(stored);
};
