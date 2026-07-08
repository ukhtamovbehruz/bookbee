import { readStorage, writeStorage } from "@/lib/local-storage";
import { addPoints } from "@/lib/points";

export const DAILY_GOAL_SECONDS = 7 * 60; // listen 7 minutes to complete the day
export const DAILY_POINTS = 25;

interface DayRecord {
  seconds: number;
  awarded: boolean;
}

type ActivityStore = Record<string, DayRecord>;

const ACTIVITY_KEY = "bookbee_activity";
const ACTIVITY_EVENT = "bookbee:activity-changed";

function dateKey(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

function read(): ActivityStore {
  return readStorage<ActivityStore>(ACTIVITY_KEY, {});
}

export function onActivityChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ACTIVITY_EVENT, handler);
  return () => window.removeEventListener(ACTIVITY_EVENT, handler);
}

export function recordListenSeconds(sec: number): void {
  if (sec <= 0) return;
  const store = read();
  const key = dateKey();
  const day = store[key] ?? { seconds: 0, awarded: false };
  day.seconds += sec;

  let awardedNow = false;
  if (!day.awarded && day.seconds >= DAILY_GOAL_SECONDS) {
    day.awarded = true;
    awardedNow = true;
  }

  store[key] = day;
  writeStorage(ACTIVITY_KEY, store);

  if (awardedNow) addPoints(DAILY_POINTS);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  }
}

export interface TodayActivity {
  seconds: number;
  ratio: number;
  goalMet: boolean;
}

export function getTodayActivity(): TodayActivity {
  const day = read()[dateKey()] ?? { seconds: 0, awarded: false };
  return {
    seconds: day.seconds,
    ratio: Math.min(1, day.seconds / DAILY_GOAL_SECONDS),
    goalMet: day.seconds >= DAILY_GOAL_SECONDS,
  };
}

export interface WeekDay {
  key: string;
  label: string;
  dayNum: number;
  goalMet: boolean;
  isToday: boolean;
  isFuture: boolean;
  ratio: number;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export function getWeekActivity(): WeekDay[] {
  const store = read();
  const today = new Date();
  const todayKey = dateKey(today);
  // Start from Monday of the current week
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  const days: WeekDay[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = dateKey(d);
    const rec = store[key];
    days.push({
      key,
      label: WEEKDAY_LABELS[d.getDay()],
      dayNum: d.getDate(),
      goalMet: Boolean(rec && rec.seconds >= DAILY_GOAL_SECONDS),
      isToday: key === todayKey,
      isFuture: d > today && key !== todayKey,
      ratio: rec ? Math.min(1, rec.seconds / DAILY_GOAL_SECONDS) : 0,
    });
  }
  return days;
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.round((new Date(b).getTime() - new Date(a).getTime()) / msPerDay);
}

/** Longest run of consecutive completed days ever recorded. */
export function getBestStreak(): number {
  const completed = Object.entries(read())
    .filter(([, rec]) => rec.seconds >= DAILY_GOAL_SECONDS)
    .map(([key]) => key)
    .sort();

  let best = 0;
  let run = 0;
  let prev: string | null = null;
  for (const key of completed) {
    run = prev && daysBetween(prev, key) === 1 ? run + 1 : 1;
    best = Math.max(best, run);
    prev = key;
  }
  return best;
}

/** Total listening seconds accrued across every recorded day. */
export function getTotalListenSeconds(): number {
  return Object.values(read()).reduce((total, rec) => total + rec.seconds, 0);
}

/** Listening seconds accrued Monday–Sunday of the current week. */
export function getWeekListenSeconds(): number {
  const store = read();
  const today = new Date();
  const dayOfWeek = (today.getDay() + 6) % 7; // 0 = Monday
  const monday = new Date(today);
  monday.setDate(today.getDate() - dayOfWeek);

  let total = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    total += store[dateKey(d)]?.seconds ?? 0;
  }
  return total;
}

/** Number of distinct days with any recorded listening. */
export function getActiveDaysCount(): number {
  return Object.values(read()).filter((rec) => rec.seconds > 0).length;
}

export function getActivityStreak(): number {
  const store = read();
  let streak = 0;
  const cursor = new Date();

  // If today's goal isn't met yet, start counting from yesterday
  const todayRec = store[dateKey(cursor)];
  if (!todayRec || todayRec.seconds < DAILY_GOAL_SECONDS) {
    cursor.setDate(cursor.getDate() - 1);
  }

  for (;;) {
    const rec = store[dateKey(cursor)];
    if (rec && rec.seconds >= DAILY_GOAL_SECONDS) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}
