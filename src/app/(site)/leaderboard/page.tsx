"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Coins, Crown, Medal, Sparkles, Trophy } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { fetchLeaderboard, type LeaderRow } from "@/lib/leaderboard";
import { onActivityChanged } from "@/lib/activity";
import { cn } from "@/lib/utils";

function initialsOf(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const RANK_COLORS = ["#F4B400", "#C0C0C0", "#CD7F32"];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [rows, setRows] = useState<LeaderRow[]>([]);

  useEffect(() => {
    let active = true;
    const refresh = () => {
      fetchLeaderboard(user?.email ?? null).then((rows) => {
        if (active) setRows(rows);
      });
    };
    refresh();
    const off = onActivityChanged(refresh);
    return () => {
      active = false;
      off();
    };
  }, [user]);

  const top3 = rows.slice(0, 3);
  const rest = rows.slice(3);
  const soloUser = rows.length === 1 && rows[0].isCurrentUser;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
          <Trophy className="size-4" />
          Leaderboard
        </span>
        <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
          Top listeners this season
        </h1>
        <p className="mt-2 text-muted-foreground">
          Earn BookBee Points by hitting your daily listening goal. Keep your
          streak alive to climb the ranks.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="glass mt-10 flex flex-col items-center rounded-2xl px-6 py-14 text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Sparkles className="size-8" />
          </span>
          <h2 className="mt-5 text-xl font-semibold">The board is wide open</h2>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            No listeners have scored points yet. Sign in and hit your daily
            listening goal to claim the very first spot.
          </p>
          <Button asChild className="mt-6 rounded-full">
            <Link href="/login">Sign in to compete</Link>
          </Button>
        </div>
      ) : (
        <>
          {/* podium */}
          <div className="mt-10 grid grid-cols-3 items-end gap-3">
            {[1, 0, 2].map((idx) => {
              const row = top3[idx];
              if (!row) return <div key={idx} />;
              const heights = ["h-28", "h-36", "h-24"];
              return (
                <motion.div
                  key={row.name}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 * idx }}
                  className="flex flex-col items-center"
                >
                  <Avatar className={cn("mb-2", idx === 0 ? "size-16" : "size-12")}>
                    <AvatarFallback
                      className="font-semibold"
                      style={{ backgroundColor: `${RANK_COLORS[idx]}22`, color: RANK_COLORS[idx] }}
                    >
                      {initialsOf(row.name)}
                    </AvatarFallback>
                  </Avatar>
                  <p className="max-w-full truncate text-sm font-medium">
                    {row.isCurrentUser ? "You" : row.name}
                  </p>
                  <p className="text-xs text-muted-foreground">{row.points} pts</p>
                  <div
                    className={cn(
                      "mt-2 flex w-full items-start justify-center rounded-t-2xl pt-3 text-lg font-bold",
                      heights[idx],
                    )}
                    style={{ background: `linear-gradient(180deg, ${RANK_COLORS[idx]}33, transparent)` }}
                  >
                    #{idx + 1}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {soloUser && (
            <p className="mt-6 rounded-2xl bg-primary/10 px-4 py-3 text-center text-sm text-muted-foreground">
              You&apos;re the first listener on the board — keep your streak alive
              to defend the top spot as more readers join.
            </p>
          )}

          {/* list */}
          {rest.length > 0 && (
            <div className="glass mt-6 divide-y divide-border rounded-2xl">
              {rest.map((row, i) => {
                const rank = i + 4;
                return (
                  <div
                    key={`${row.name}-${rank}`}
                    className={cn(
                      "flex items-center gap-3 p-4",
                      row.isCurrentUser && "bg-primary/10",
                    )}
                  >
                    <span className="w-6 text-center text-sm font-semibold text-muted-foreground">
                      {rank}
                    </span>
                    <Avatar size="sm">
                      <AvatarFallback className="bg-muted text-xs">
                        {initialsOf(row.name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="flex-1 truncate text-sm font-medium">
                      {row.isCurrentUser ? (
                        <span className="inline-flex items-center gap-1.5">
                          You
                          <Crown className="size-3.5 text-primary" />
                        </span>
                      ) : (
                        row.name
                      )}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Coins className="size-3.5 text-primary" />
                      {row.points}
                    </span>
                    {rank <= 3 && <Medal className="size-4 text-primary" />}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
