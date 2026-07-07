import { readStorage, writeStorage } from "@/lib/local-storage";

const STREAK_KEY = "bookbee_streak";

export interface StreakState {
  count: number;
  lastListenDate: string | null;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round(
    (new Date(b).getTime() - new Date(a).getTime()) / msPerDay,
  );
}

export function getStreak(): StreakState {
  return readStorage<StreakState>(STREAK_KEY, { count: 0, lastListenDate: null });
}

export function recordListenToday(): StreakState {
  const today = todayKey();
  const current = getStreak();

  if (current.lastListenDate === today) {
    return current;
  }

  let nextCount = 1;
  if (current.lastListenDate) {
    const gap = daysBetween(current.lastListenDate, today);
    if (gap === 1) nextCount = current.count + 1;
  }

  const next: StreakState = { count: nextCount, lastListenDate: today };
  writeStorage(STREAK_KEY, next);
  return next;
}
