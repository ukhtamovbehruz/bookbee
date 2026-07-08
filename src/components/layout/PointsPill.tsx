"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Coins } from "lucide-react";
import { getPoints } from "@/lib/points";
import { onActivityChanged } from "@/lib/activity";
import { useAuth } from "@/context/AuthProvider";

export function PointsPill() {
  const { user } = useAuth();
  const [points, setPoints] = useState(0);

  useEffect(() => {
    const refresh = () => setPoints(getPoints());
    refresh();
    return onActivityChanged(refresh);
  }, []);

  if (!user) return null;

  return (
    <Link
      href="/leaderboard"
      title="Your BookBee Points"
      className="hidden items-center gap-1.5 rounded-full bg-primary/15 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/25 md:inline-flex"
    >
      <Coins className="size-4" />
      {points.toLocaleString()}
    </Link>
  );
}
