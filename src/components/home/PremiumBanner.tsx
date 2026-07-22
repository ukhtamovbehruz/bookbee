"use client";

import Link from "next/link";
import {
  CloudDownload,
  BookText,
  Infinity as InfinityIcon,
  Sparkles,
  LineChart,
  ShieldOff,
  Crown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const BENEFITS = [
  {
    icon: CloudDownload,
    title: "Offline Listening",
    description: "Download audiobooks and listen without a connection.",
  },
  {
    icon: BookText,
    title: "Offline Reading",
    description: "Save e-book companions to read anywhere, anytime.",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited Downloads",
    description: "No caps — fill your library without limits.",
  },
  {
    icon: Sparkles,
    title: "AI Summary",
    description: "Get instant chapter summaries powered by AI.",
  },
  {
    icon: LineChart,
    title: "Listening Statistics",
    description: "Track your habits, streaks, and time listened.",
  },
  {
    icon: ShieldOff,
    title: "No Ads",
    description: "Uninterrupted listening, from start to finish.",
  },
];

export function PremiumBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1710] via-card to-[#1b1530] p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-[-6rem] size-72 rounded-full bg-secondary/25 blur-3xl"
        />

        <div className="relative flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
            <Crown className="size-4" />
            BookBee Premium
          </span>
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Listen without limits. Read without interruption.
          </h2>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="glass flex items-start gap-3 rounded-2xl p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          <Button asChild size="lg" className="h-12 rounded-full px-8 text-base">
            <Link href="/premium">Upgrade to Premium</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
