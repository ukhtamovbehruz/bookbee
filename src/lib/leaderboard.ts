export interface LeaderRow {
  name: string;
  points: number;
  isCurrentUser: boolean;
}

// Fictional community members so a new listener has a leaderboard to climb.
const MOCK_LEADERS: { name: string; points: number }[] = [
  { name: "Aziza Karimova", points: 1240 },
  { name: "Daniel Foster", points: 1085 },
  { name: "Sardor Rahimov", points: 970 },
  { name: "Mika Tanaka", points: 815 },
  { name: "Elena Petrova", points: 690 },
  { name: "Jamshid Yusupov", points: 560 },
  { name: "Chloe Bennett", points: 445 },
  { name: "Omar Haddad", points: 320 },
  { name: "Nilufar Abdullaeva", points: 210 },
  { name: "Lucas Meyer", points: 120 },
];

export function getLeaderboard(
  currentName: string | null,
  currentPoints: number,
): LeaderRow[] {
  const rows: LeaderRow[] = MOCK_LEADERS.map((l) => ({ ...l, isCurrentUser: false }));
  if (currentName) {
    rows.push({ name: currentName, points: currentPoints, isCurrentUser: true });
  }
  return rows.sort((a, b) => b.points - a.points);
}
