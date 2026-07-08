export interface LeaderRow {
  name: string;
  points: number;
  isCurrentUser: boolean;
}

// The platform has no community yet, so the board reflects real listeners
// only — that means just the signed-in user (starting at 0 points), or
// nobody at all when signed out. No fictional members are seeded.
export function getLeaderboard(
  currentName: string | null,
  currentPoints: number,
): LeaderRow[] {
  if (!currentName) return [];
  return [{ name: currentName, points: currentPoints, isCurrentUser: true }];
}
