import {
  BookOpen,
  Dumbbell,
  Sparkles,
  Briefcase,
  HeartPulse,
  Palette,
  Users,
  PiggyBank,
  Leaf,
  Tag,
  type LucideIcon,
} from 'lucide-react';

export interface HabitCategory {
  value: string;
  label: string;
  icon: LucideIcon;
}

export const HABIT_CATEGORIES: HabitCategory[] = [
  { value: 'study', label: 'Study', icon: BookOpen },
  { value: 'gym', label: 'Gym & Fitness', icon: Dumbbell },
  { value: 'spiritual', label: 'Spiritual', icon: Sparkles },
  { value: 'work', label: 'Work', icon: Briefcase },
  { value: 'wellness', label: 'Wellness', icon: HeartPulse },
  { value: 'creative', label: 'Creative', icon: Palette },
  { value: 'social', label: 'Social', icon: Users },
  { value: 'finance', label: 'Finance', icon: PiggyBank },
  { value: 'lifestyle', label: 'Lifestyle', icon: Leaf },
  { value: 'other', label: 'Other', icon: Tag },
];

export const CATEGORY_BY_VALUE: Record<string, HabitCategory> = Object.fromEntries(
  HABIT_CATEGORIES.map((c) => [c.value, c])
);

/**
 * Match a habit's category string to one of the known categories, or fall back
 * to "other" (which still shows the original label).
 */
export function resolveCategory(value: string | undefined | null): HabitCategory {
  if (!value) return CATEGORY_BY_VALUE.other;
  const key = value.toLowerCase().trim();
  return CATEGORY_BY_VALUE[key] ?? { value: key, label: value, icon: Tag };
}
