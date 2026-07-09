"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  CalendarCheck,
  CalendarDays,
  Coins,
  Crown,
  Flame,
  GraduationCap,
  Headphones,
  Library,
  Lock,
  Radio,
  Rocket,
  Sparkles,
  Target,
  Trophy,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { getAchievements, type Achievement } from "@/lib/achievements";
import { getLibraryEntries } from "@/lib/library";
import { getPoints } from "@/lib/points";
import {
  getActiveDaysCount,
  getBestStreak,
  getTotalListenSeconds,
  onActivityChanged,
} from "@/lib/activity";
import { cn } from "@/lib/utils";

const ICONS: Record<string, LucideIcon> = {
  Sparkles,
  Coins,
  Rocket,
  Crown,
  BookOpen,
  GraduationCap,
  Trophy,
  Flame,
  Zap,
  CalendarCheck,
  CalendarDays,
  Headphones,
  Radio,
  Target,
  Library,
};

export function AchievementsPanel() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const refresh = () => {
      const entries = getLibraryEntries();
      setAchievements(
        getAchievements({
          points: getPoints(),
          booksFinished: entries.filter((e) => e.certificateEarned).length,
          bestStreak: getBestStreak(),
          libraryCount: entries.length,
          bestQuizScore: entries.reduce(
            (max, e) => Math.max(max, e.quizScore ?? 0),
            0,
          ),
          totalHours: Math.floor(getTotalListenSeconds() / 3600),
          activeDays: getActiveDaysCount(),
        }),
      );
    };
    refresh();
    return onActivityChanged(refresh);
  }, []);

  const earnedCount = achievements.filter((a) => a.earned).length;

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Achievements</h2>
        <span className="text-sm text-muted-foreground">
          {earnedCount}/{achievements.length} unlocked
        </span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {achievements.map((a) => {
          const Icon = ICONS[a.icon] ?? Sparkles;
          return (
            <div
              key={a.id}
              className={cn(
                "flex items-center gap-3 rounded-2xl border p-4 transition-colors",
                a.earned
                  ? "border-primary/40 bg-primary/5"
                  : "border-border",
              )}
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl",
                  a.earned
                    ? "bg-primary/15 text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                {a.earned ? <Icon className="size-5" /> : <Lock className="size-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold">{a.title}</p>
                  <span className="shrink-0 text-[11px] text-muted-foreground">
                    {a.goalLabel}
                  </span>
                </div>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {a.description}
                </p>
                {!a.earned && (
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                    <motion.div
                      className="h-full rounded-full bg-primary/60"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.round(a.progress * 100)}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
