// BookBee Points double as XP. Each level costs 35% more than the last,
// producing a gentle escalating curve (100, 135, 182, 246 … points per level).

export const RANK_TITLES = [
  "Curious Reader",
  "Page Turner",
  "Bookworm",
  "Story Seeker",
  "Chapter Champion",
  "Literary Scholar",
  "Master Bibliophile",
  "BookBee Legend",
] as const;

export interface LevelInfo {
  /** 1-based level number. */
  level: number;
  /** Rank name for the current level. */
  title: string;
  /** Total XP (points) earned. */
  xp: number;
  /** XP at which the current level began. */
  levelFloor: number;
  /** XP required to reach the next level. */
  levelCeil: number;
  /** XP earned within the current level. */
  intoLevel: number;
  /** XP span of the current level. */
  levelSpan: number;
  /** XP remaining until the next level. */
  toNext: number;
  /** Progress through the current level, 0–1. */
  progress: number;
}

export function getLevelInfo(xp: number): LevelInfo {
  const safeXp = Math.max(0, Math.floor(xp));

  let level = 1;
  let floor = 0;
  let need = 100;
  while (safeXp >= floor + need) {
    floor += need;
    level += 1;
    need = Math.round(need * 1.35);
  }

  const levelCeil = floor + need;
  const intoLevel = safeXp - floor;

  return {
    level,
    title: RANK_TITLES[Math.min(level - 1, RANK_TITLES.length - 1)],
    xp: safeXp,
    levelFloor: floor,
    levelCeil,
    intoLevel,
    levelSpan: need,
    toNext: levelCeil - safeXp,
    progress: need > 0 ? intoLevel / need : 1,
  };
}
