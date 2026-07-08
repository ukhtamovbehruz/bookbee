"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { getPoints } from "@/lib/points";
import { getLevelInfo, type LevelInfo } from "@/lib/level";
import { onActivityChanged } from "@/lib/activity";

function Ring({ progress, level }: { progress: number; level: number }) {
  const r = 34;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative size-24 shrink-0">
      <svg viewBox="0 0 80 80" className="size-full -rotate-90">
        <circle cx="40" cy="40" r={r} fill="none" stroke="var(--muted)" strokeWidth="7" />
        <motion.circle
          cx="40"
          cy="40"
          r={r}
          fill="none"
          stroke="var(--primary)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={{ strokeDashoffset: c }}
          animate={{ strokeDashoffset: c - c * progress }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          Level
        </span>
        <span className="text-2xl font-bold leading-none tabular-nums">{level}</span>
      </div>
    </div>
  );
}

export function LevelBadge() {
  const [info, setInfo] = useState<LevelInfo | null>(null);

  useEffect(() => {
    const refresh = () => setInfo(getLevelInfo(getPoints()));
    refresh();
    return onActivityChanged(refresh);
  }, []);

  if (!info) return null;

  return (
    <div className="glass relative overflow-hidden rounded-2xl p-5">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-8 -top-8 size-28 rounded-full bg-primary/20 blur-2xl"
      />
      <div className="relative flex items-center gap-4">
        <Ring progress={info.progress} level={info.level} />
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2 py-0.5 text-[11px] font-semibold text-primary">
            <Sparkles className="size-3" />
            Rank
          </span>
          <p className="mt-1 truncate text-base font-semibold">{info.title}</p>
          <p className="text-xs text-muted-foreground">
            {info.xp.toLocaleString()} XP earned
          </p>
        </div>
      </div>

      <div className="relative mt-4">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{info.intoLevel} / {info.levelSpan} XP</span>
          <span>{info.toNext} to Lv {info.level + 1}</span>
        </div>
        <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-muted">
          <motion.div
            className="h-full rounded-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${Math.round(info.progress * 100)}%` }}
            transition={{ duration: 1, ease: "easeOut" }}
          />
        </div>
      </div>
    </div>
  );
}
