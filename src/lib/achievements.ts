// Achievements are derived purely from existing stores (points, library,
// streaks), so they stay in sync without any extra persistence. Icons are
// referenced by lucide name and resolved in the UI layer.

export interface AchievementStat {
  points: number;
  booksFinished: number;
  bestStreak: number;
  libraryCount: number;
  bestQuizScore: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  earned: boolean;
  /** Progress toward the goal, 0–1. */
  progress: number;
  /** Human-readable progress, e.g. "3 / 5 books". */
  goalLabel: string;
}

function make(
  id: string,
  title: string,
  description: string,
  icon: string,
  value: number,
  goal: number,
  unit: string,
): Achievement {
  const clamped = Math.min(value, goal);
  return {
    id,
    title,
    description,
    icon,
    earned: value >= goal,
    progress: goal > 0 ? Math.min(1, value / goal) : 1,
    goalLabel: `${clamped} / ${goal} ${unit}`.trim(),
  };
}

export function getAchievements(s: AchievementStat): Achievement[] {
  return [
    make("first-buzz", "First Buzz", "Earn your first BookBee Point.", "Sparkles", s.points, 1, "pt"),
    make("century", "Century Club", "Reach 100 BookBee Points.", "Coins", s.points, 100, "pts"),
    make("high-flyer", "High Flyer", "Reach 500 BookBee Points.", "Rocket", s.points, 500, "pts"),
    make("bookworm", "Bookworm", "Finish your first book.", "BookOpen", s.booksFinished, 1, "book"),
    make("scholar", "Scholar", "Finish 5 books.", "GraduationCap", s.booksFinished, 5, "books"),
    make("on-a-roll", "On a Roll", "Reach a 3-day streak.", "Flame", s.bestStreak, 3, "days"),
    make("unstoppable", "Unstoppable", "Reach a 7-day streak.", "Zap", s.bestStreak, 7, "days"),
    make("top-marks", "Top Marks", "Ace a quiz with a perfect score.", "Target", s.bestQuizScore, 10, ""),
    make("collector", "Collector", "Save 5 books to your library.", "Library", s.libraryCount, 5, "books"),
  ];
}
