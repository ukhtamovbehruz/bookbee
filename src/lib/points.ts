import { readStorage, writeStorage } from "@/lib/local-storage";

const POINTS_KEY = "bookbee_points";

export function getPoints(): number {
  return readStorage<number>(POINTS_KEY, 0);
}

export function addPoints(amount: number): number {
  const next = getPoints() + amount;
  writeStorage(POINTS_KEY, next);
  return next;
}
