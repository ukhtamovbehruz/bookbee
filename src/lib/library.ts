import { readStorage, writeStorage } from "@/lib/local-storage";

export interface LibraryEntry {
  bookId: string;
  note: string;
  addedAt: string;
  finished: boolean;
  finishedAt?: string;
  certificateEarned?: boolean;
  quizScore?: number;
}

const LIBRARY_KEY = "bookbee_library";

type LibraryStore = Record<string, LibraryEntry>;

function readLibrary(): LibraryStore {
  return readStorage<LibraryStore>(LIBRARY_KEY, {});
}

export function getLibraryEntries(): LibraryEntry[] {
  return Object.values(readLibrary()).sort(
    (a, b) => new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime(),
  );
}

export function getLibraryEntry(bookId: string): LibraryEntry | undefined {
  return readLibrary()[bookId];
}

export function isInLibrary(bookId: string): boolean {
  return Boolean(readLibrary()[bookId]);
}

export function addToLibrary(bookId: string): void {
  const store = readLibrary();
  if (store[bookId]) return;
  store[bookId] = {
    bookId,
    note: "",
    addedAt: new Date().toISOString(),
    finished: false,
  };
  writeStorage(LIBRARY_KEY, store);
}

export function removeFromLibrary(bookId: string): void {
  const store = readLibrary();
  delete store[bookId];
  writeStorage(LIBRARY_KEY, store);
}

export function setLibraryNote(bookId: string, note: string): void {
  const store = readLibrary();
  if (!store[bookId]) return;
  store[bookId] = { ...store[bookId], note };
  writeStorage(LIBRARY_KEY, store);
}

export function markFinished(bookId: string, quizScore?: number): void {
  const store = readLibrary();
  const existing = store[bookId] ?? {
    bookId,
    note: "",
    addedAt: new Date().toISOString(),
    finished: false,
  };
  store[bookId] = {
    ...existing,
    finished: true,
    finishedAt: new Date().toISOString(),
    certificateEarned: true,
    quizScore,
  };
  writeStorage(LIBRARY_KEY, store);
}
