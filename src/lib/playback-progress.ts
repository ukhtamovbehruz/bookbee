import { readStorage, writeStorage } from "@/lib/local-storage";

export interface PlaybackProgress {
  bookId: string;
  chapterId: string;
  positionSec: number;
  updatedAt: number;
}

const PROGRESS_KEY = "bookbee_playback";
const PROGRESS_EVENT = "bookbee:playback-changed";

type ProgressStore = Record<string, PlaybackProgress>;

function read(): ProgressStore {
  return readStorage<ProgressStore>(PROGRESS_KEY, {});
}

export function onPlaybackChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROGRESS_EVENT, handler);
  return () => window.removeEventListener(PROGRESS_EVENT, handler);
}

/** Remember where the listener stopped in a book. */
export function savePlaybackProgress(
  bookId: string,
  chapterId: string,
  positionSec: number,
): void {
  if (positionSec <= 0) return;
  const store = read();
  store[bookId] = {
    bookId,
    chapterId,
    positionSec: Math.floor(positionSec),
    updatedAt: Date.now(),
  };
  writeStorage(PROGRESS_KEY, store);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }
}

export function getPlaybackProgress(bookId: string): PlaybackProgress | undefined {
  return read()[bookId];
}

/** Most-recently-listened entries first, for the "Continue listening" rail. */
export function getAllPlaybackProgress(): PlaybackProgress[] {
  return Object.values(read()).sort((a, b) => b.updatedAt - a.updatedAt);
}

export function clearPlaybackProgress(bookId: string): void {
  const store = read();
  if (!store[bookId]) return;
  delete store[bookId];
  writeStorage(PROGRESS_KEY, store);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROGRESS_EVENT));
  }
}
