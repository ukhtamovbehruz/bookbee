"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CalendarCheck,
  Clock,
  Flame,
  Headphones,
  Library,
  Tag,
} from "lucide-react";
import {
  getActiveDaysCount,
  getBestStreak,
  getTotalListenSeconds,
  getWeekListenSeconds,
  onActivityChanged,
} from "@/lib/activity";
import { getLibraryEntries } from "@/lib/library";
import { getCatalogBookById } from "@/lib/mock-data/catalog";
import { getCategoryById } from "@/lib/mock-data/categories";

interface Insight {
  label: string;
  value: string;
  hint: string;
  icon: typeof Clock;
}

function formatDuration(sec: number): string {
  const h = Math.floor(sec / 3600);
  const m = Math.round((sec % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

function favouriteCategory(): string {
  const tally = new Map<string, number>();
  for (const entry of getLibraryEntries()) {
    const book = getCatalogBookById(entry.bookId);
    for (const id of book?.categoryIds ?? []) {
      tally.set(id, (tally.get(id) ?? 0) + 1);
    }
  }
  let topId: string | null = null;
  let topCount = 0;
  for (const [id, count] of tally) {
    if (count > topCount) {
      topId = id;
      topCount = count;
    }
  }
  return topId ? getCategoryById(topId)?.name ?? "—" : "—";
}

export function ListeningInsights() {
  const [insights, setInsights] = useState<Insight[]>([]);

  useEffect(() => {
    const refresh = () => {
      const entries = getLibraryEntries();
      const finished = entries.filter((e) => e.certificateEarned).length;
      setInsights([
        {
          label: "Total listening",
          value: formatDuration(getTotalListenSeconds()),
          hint: "all time",
          icon: Headphones,
        },
        {
          label: "This week",
          value: formatDuration(getWeekListenSeconds()),
          hint: "Mon–Sun",
          icon: Clock,
        },
        {
          label: "Best streak",
          value: `${getBestStreak()}`,
          hint: "days in a row",
          icon: Flame,
        },
        {
          label: "Active days",
          value: `${getActiveDaysCount()}`,
          hint: "days listened",
          icon: CalendarCheck,
        },
        {
          label: "Books finished",
          value: `${finished}`,
          hint: "with certificate",
          icon: Library,
        },
        {
          label: "Top category",
          value: favouriteCategory(),
          hint: "in your library",
          icon: Tag,
        },
      ]);
    };
    refresh();
    return onActivityChanged(refresh);
  }, []);

  return (
    <div className="glass rounded-2xl p-6">
      <h2 className="text-lg font-semibold">Listening insights</h2>
      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
      >
        {insights.map((insight) => {
          const Icon = insight.icon;
          return (
            <motion.div
              key={insight.label}
              variants={{
                hidden: { opacity: 0, y: 14 },
                visible: { opacity: 1, y: 0 },
              }}
              className="rounded-2xl border border-border p-4"
            >
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Icon className="size-4 text-primary" />
                {insight.label}
              </div>
              <p className="mt-2 truncate text-xl font-bold tabular-nums">
                {insight.value}
              </p>
              <p className="text-[11px] text-muted-foreground">{insight.hint}</p>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
