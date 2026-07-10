"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Check, Coins, Flame, Target } from "lucide-react";
import {
  DAILY_GOAL_SECONDS,
  DAILY_POINTS,
  getActivityStreak,
  getTodayActivity,
  getWeekActivity,
  onActivityChanged,
  type WeekDay,
} from "@/lib/activity";
import { useAuth } from "@/context/AuthProvider";
import { cn } from "@/lib/utils";

const MILESTONES = [7, 14, 30, 60, 100, 180, 365];

function nextMilestoneLabel(streak: number): string {
  const next = MILESTONES.find((m) => m > streak);
  if (!next) return "Maxed out";
  const days = next - streak;
  if (days >= 14) return `${Math.round(days / 7)} weeks`;
  if (days === 7) return "1 week";
  return `${days} ${days === 1 ? "day" : "days"}`;
}

function Ring({ ratio, goalMet }: { ratio: number; goalMet: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  const angle = -90 + 360 * Math.min(1, ratio);
  const rad = (angle * Math.PI) / 180;
  const knobX = 60 + r * Math.cos(rad);
  const knobY = 60 + r * Math.sin(rad);

  return (
    <svg viewBox="0 0 120 120" className="size-full">
      <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="9" />
      <motion.circle
        cx="60"
        cy="60"
        r={r}
        fill="none"
        stroke="#f97316"
        strokeWidth="9"
        strokeLinecap="round"
        transform="rotate(-90 60 60)"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: c - c * Math.min(1, ratio) }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
      {(ratio > 0 || goalMet) && <circle cx={knobX} cy={knobY} r="7" fill="#f97316" />}
    </svg>
  );
}

function DayChip({ day }: { day: WeekDay }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <span className="text-[11px] text-muted-foreground">{day.label}</span>
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full text-sm font-semibold",
          day.goalMet && "bg-green-500 text-white",
          !day.goalMet && day.isToday && "text-foreground ring-2 ring-orange-500",
          !day.goalMet && !day.isToday && "bg-muted text-muted-foreground",
          day.isFuture && "opacity-40",
        )}
      >
        {day.goalMet ? <Check className="size-4" strokeWidth={3} /> : day.dayNum}
      </span>
    </div>
  );
}

export function HomeStreakCard() {
  const { user } = useAuth();
  const [today, setToday] = useState({ ratio: 0, goalMet: false, seconds: 0 });
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setToday(getTodayActivity());
      setWeek(getWeekActivity());
      setStreak(getActivityStreak());
    };
    refresh();
    const off = onActivityChanged(refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      off();
      clearInterval(interval);
    };
  }, []);

  // Streaks belong to a member's account, so only show this to signed-in users.
  if (!user) return null;

  const remaining = Math.max(0, DAILY_GOAL_SECONDS - today.seconds);
  const mm = Math.floor(remaining / 60);
  const ss = remaining % 60;
  const timeLabel = today.goalMet ? "Done" : `${mm}:${String(ss).padStart(2, "0")}`;

  return (
    <div className="glass flex h-full flex-col rounded-3xl p-5 sm:p-7">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold tracking-tight sm:text-xl">Your activity</h2>
        <Link
          href="/profile"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View full
          <ArrowRight className="size-4" />
        </Link>
      </div>

        <div className="mt-5 grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr] md:gap-8">
          {/* progress ring */}
          <div className="flex flex-col items-center justify-center">
            <div className="relative size-36">
              <Ring ratio={today.ratio} goalMet={today.goalMet} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-xs text-muted-foreground">Today&apos;s plan</span>
                <span className="text-3xl font-bold tabular-nums">{timeLabel}</span>
              </div>
            </div>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
              <Coins className="size-4" />
              {today.goalMet ? "Earned" : `+${DAILY_POINTS}`}
            </span>
          </div>

          {/* week + stats */}
          <div className="flex flex-col justify-between gap-5">
            <div className="flex items-center justify-between gap-2">
              {week.map((d) => (
                <DayChip key={d.key} day={d} />
              ))}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Flame className="size-4 text-primary" />
                  Current streak
                </div>
                <p className="mt-1 text-2xl font-bold tabular-nums">
                  {streak}
                  <span className="ml-1 text-sm font-normal text-muted-foreground">
                    {streak === 1 ? "day" : "days"}
                  </span>
                </p>
              </div>
              <div className="rounded-2xl border border-border p-4">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Target className="size-4 text-primary" />
                  Next milestone
                </div>
                <p className="mt-1 text-2xl font-bold">{nextMilestoneLabel(streak)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
}
