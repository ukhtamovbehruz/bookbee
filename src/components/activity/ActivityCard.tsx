"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Check, Coins, Flame, Trophy } from "lucide-react";
import Link from "next/link";
import {
  DAILY_GOAL_SECONDS,
  DAILY_POINTS,
  getActivityStreak,
  getTodayActivity,
  getWeekActivity,
  onActivityChanged,
  type WeekDay,
} from "@/lib/activity";
import { getPoints } from "@/lib/points";
import { cn } from "@/lib/utils";

function Ring({ ratio, goalMet }: { ratio: number; goalMet: boolean }) {
  const r = 52;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-36">
      <svg viewBox="0 0 120 120" className="size-full -rotate-90">
        <circle cx="60" cy="60" r={r} fill="none" stroke="var(--muted)" strokeWidth="10" />
        <motion.circle
          cx="60"
          cy="60"
          r={r}
          fill="none"
          stroke="#22c55e"
          strokeWidth="10"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * ratio }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        {goalMet ? (
          <>
            <span className="flex size-11 items-center justify-center rounded-full bg-green-500 text-white">
              <Check className="size-6" strokeWidth={3} />
            </span>
            <span className="mt-1.5 text-xs font-semibold text-green-500">
              Plan complete
            </span>
          </>
        ) : (
          <>
            <span className="text-2xl font-bold">{Math.round(ratio * 100)}%</span>
            <span className="text-[11px] text-muted-foreground">of daily goal</span>
          </>
        )}
      </div>
    </div>
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
          !day.goalMet && day.isToday && "ring-2 ring-primary text-foreground",
          !day.goalMet && !day.isToday && "bg-muted text-muted-foreground",
          day.isFuture && "opacity-40",
        )}
      >
        {day.goalMet ? <Check className="size-4" strokeWidth={3} /> : day.dayNum}
      </span>
    </div>
  );
}

export function ActivityCard() {
  const [today, setToday] = useState({ ratio: 0, goalMet: false, seconds: 0 });
  const [week, setWeek] = useState<WeekDay[]>([]);
  const [streak, setStreak] = useState(0);
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const refresh = () => {
      setToday(getTodayActivity());
      setWeek(getWeekActivity());
      setStreak(getActivityStreak());
      setPoints(getPoints());
    };
    refresh();
    const off = onActivityChanged(refresh);
    const interval = setInterval(refresh, 5000);
    return () => {
      off();
      clearInterval(interval);
    };
  }, []);

  const minutes = Math.floor(today.seconds / 60);
  const goalMin = Math.round(DAILY_GOAL_SECONDS / 60);

  return (
    <div className="glass rounded-2xl p-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Your activity</h2>
        <Link
          href="/leaderboard"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
        >
          <Trophy className="size-4" />
          Leaderboard
        </Link>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-6 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center">
          <Ring ratio={today.ratio} goalMet={today.goalMet} />
          <p className="mt-3 text-center text-sm text-muted-foreground">
            {today.goalMet ? (
              <span className="font-medium text-green-500">
                Today&apos;s plan completed 🎉
              </span>
            ) : (
              <>
                Listen <span className="font-medium text-foreground">{minutes}</span>/
                {goalMin} min today to earn{" "}
                <span className="font-medium text-primary">+{DAILY_POINTS} pts</span>
              </>
            )}
          </p>
        </div>

        <div className="flex flex-col justify-between gap-5">
          <div className="flex items-center justify-between gap-3">
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
              <p className="mt-1 text-2xl font-bold">
                {streak}
                <span className="ml-1 text-sm font-normal text-muted-foreground">
                  days
                </span>
              </p>
            </div>
            <div className="rounded-2xl border border-border p-4">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Coins className="size-4 text-primary" />
                BookBee Points
              </div>
              <p className="mt-1 text-2xl font-bold">{points.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
