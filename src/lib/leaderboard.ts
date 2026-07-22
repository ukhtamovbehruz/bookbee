import { createClient } from "@/lib/supabase/client";

export interface LeaderRow {
  name: string;
  points: number;
  isCurrentUser: boolean;
}

const supabase = createClient();

/**
 * Global leaderboard, ranking every account that has a `user_stats` row
 * (every listener who has signed in at least once) by BookBee Points.
 */
export async function fetchLeaderboard(currentEmail: string | null): Promise<LeaderRow[]> {
  const { data, error } = await supabase
    .from("user_stats")
    .select("email, name, points")
    .order("points", { ascending: false })
    .limit(100);

  if (error || !data) return [];

  const normalizedCurrent = currentEmail?.trim().toLowerCase() ?? null;
  return data.map((row) => ({
    name: row.name,
    points: row.points,
    isCurrentUser: normalizedCurrent !== null && row.email.toLowerCase() === normalizedCurrent,
  }));
}
