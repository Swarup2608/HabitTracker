import { create } from 'zustand';

export interface UnlockedAchievement {
  code: string;
  title: string;
  description: string;
  icon: string;
}

interface AchievementQueueState {
  queue: UnlockedAchievement[];
  seen: Set<string>;
  enqueue: (items: UnlockedAchievement[] | undefined) => void;
  shift: () => void;
}

export const useAchievementQueue = create<AchievementQueueState>((set, get) => ({
  queue: [],
  seen: new Set<string>(),
  enqueue: (items) => {
    if (!items || items.length === 0) return;
    const { seen, queue } = get();
    const fresh = items.filter((a) => !seen.has(a.code));
    if (fresh.length === 0) return;
    const nextSeen = new Set(seen);
    fresh.forEach((a) => nextSeen.add(a.code));
    set({ queue: [...queue, ...fresh], seen: nextSeen });
  },
  shift: () => set({ queue: get().queue.slice(1) }),
}));
