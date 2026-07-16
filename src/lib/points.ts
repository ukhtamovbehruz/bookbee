import { createClient } from "@/lib/supabase/client";
import { notifyActivityChanged } from "@/lib/activity-events";

/**
 * BookBee Points, synced to the global `user_stats` table so the leaderboard
 * reflects every account rather than whichever browser earned them. Reads
 * stay synchronous against an in-memory cache for the signed-in user (same
 * shape as the old localStorage-backed API); writes upsert in the
 * background. AuthProvider drives `syncPointsForUser` on every auth change.
 */

export interface CurrentStatsUser {
  id: string;
  email: string;
  name: string;
}

const supabase = createClient();

let currentUser: CurrentStatsUser | null = null;
let cachedPoints = 0;

export function getPoints(): number {
  return cachedPoints;
}

export function addPoints(amount: number): number {
  cachedPoints += amount;
  notifyActivityChanged();
  if (currentUser) void persist(currentUser, cachedPoints);
  return cachedPoints;
}

async function persist(user: CurrentStatsUser, points: number): Promise<void> {
  await supabase.from("user_stats").upsert({
    user_id: user.id,
    email: user.email,
    name: user.name,
    points,
    updated_at: new Date().toISOString(),
  });
}

/** Called by AuthProvider whenever the signed-in user changes. */
export async function syncPointsForUser(user: CurrentStatsUser | null): Promise<void> {
  currentUser = user;

  if (!user) {
    cachedPoints = 0;
    notifyActivityChanged();
    return;
  }

  const { data } = await supabase
    .from("user_stats")
    .select("points")
    .eq("user_id", user.id)
    .maybeSingle();

  if (data) {
    cachedPoints = data.points ?? 0;
  } else {
    // First time we see this account — give it a row so it shows up on the
    // global leaderboard right away, even at 0 points.
    cachedPoints = 0;
    await persist(user, 0);
  }
  notifyActivityChanged();
}
