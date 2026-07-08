import { readStorage, writeStorage } from "@/lib/local-storage";

export interface Comment {
  id: string;
  author: string;
  text: string;
  ts: number;
}

const KEY = "bookbee_discussions";

type Store = Record<string, Comment[]>;

// A couple of seed comments so a book's discussion never feels empty.
const SEED: Record<string, Comment[]> = {};

export function getComments(bookId: string): Comment[] {
  const store = readStorage<Store>(KEY, {});
  const saved = store[bookId] ?? [];
  return [...(SEED[bookId] ?? []), ...saved].sort((a, b) => b.ts - a.ts);
}

export function addComment(bookId: string, author: string, text: string): Comment {
  const store = readStorage<Store>(KEY, {});
  const comment: Comment = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author,
    text: text.trim(),
    ts: Date.now(),
  };
  store[bookId] = [...(store[bookId] ?? []), comment];
  writeStorage(KEY, store);
  return comment;
}
