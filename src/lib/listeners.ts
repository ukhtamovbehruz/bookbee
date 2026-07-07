import { readStorage, writeStorage } from "@/lib/local-storage";

const PLAY_COUNTS_KEY = "bookbee_play_counts";

type PlayCountsStore = Record<string, number>;

export function getPlayCount(bookId: string): number {
  const store = readStorage<PlayCountsStore>(PLAY_COUNTS_KEY, {});
  return store[bookId] ?? 0;
}

export function incrementPlayCount(bookId: string): void {
  const store = readStorage<PlayCountsStore>(PLAY_COUNTS_KEY, {});
  writeStorage(PLAY_COUNTS_KEY, { ...store, [bookId]: (store[bookId] ?? 0) + 1 });
}
