// XP curve: level n requires 100 * n * (n + 1) / 2 cumulative XP
export function levelForXp(xp: number): number {
  let level = 1;
  while (100 * level * (level + 1) * 0.5 <= xp) level++;
  return Math.max(1, level);
}

export function xpForLevel(level: number): number {
  return Math.floor((100 * level * (level + 1)) / 2);
}

export function progressInLevel(xp: number) {
  const level = levelForXp(xp);
  const floor = level === 1 ? 0 : xpForLevel(level - 1);
  const ceiling = xpForLevel(level);
  const into = xp - floor;
  const span = Math.max(1, ceiling - floor);
  return { level, into, span, percent: Math.min(100, Math.round((into / span) * 100)) };
}
