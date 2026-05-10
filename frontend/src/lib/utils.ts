import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDate = (d: Date | string) => {
  const date = new Date(d);
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

export const formatRelativeDay = (dayKey: string) => {
  const today = new Date().toISOString().slice(0, 10);
  if (dayKey === today) return 'Today';
  const y = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
  if (dayKey === y) return 'Yesterday';
  return new Date(dayKey).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
};
