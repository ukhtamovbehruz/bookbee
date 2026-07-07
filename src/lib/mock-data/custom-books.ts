import type { Book } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/local-storage";
import { generateChapters } from "./chapters";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";

const CUSTOM_BOOKS_KEY = "bookbee_custom_books";

export interface NewBookInput {
  title: string;
  author: string;
  narrator: string;
  publisher: string;
  description: string;
  categoryIds: string[];
  language: Book["language"];
  hours: number;
  isPremium: boolean;
  coverUrl?: string;
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCustomBooks(): Book[] {
  return readStorage<Book[]>(CUSTOM_BOOKS_KEY, []);
}

export function getCustomBookById(id: string): Book | undefined {
  return getCustomBooks().find((b) => b.id === id);
}

export function addCustomBook(input: NewBookInput): Book {
  const existing = getCustomBooks();
  const baseId = slugify(input.title) || "book";
  let id = baseId;
  let suffix = 1;
  while (existing.some((b) => b.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const durationSec = Math.round(input.hours * 3600);
  const chapterCount = Math.max(4, Math.round(input.hours));

  const book: Book = {
    id,
    title: input.title,
    author: input.author,
    narrator: input.narrator || input.author,
    publisher: input.publisher || "BookBee Originals",
    coverUrl: input.coverUrl?.trim() || `https://picsum.photos/seed/${id}/480/720`,
    description: input.description,
    categoryIds: input.categoryIds,
    language: input.language,
    durationSec,
    rating: 0,
    ratingCount: 0,
    listenerCount: 0,
    isPremium: input.isPremium,
    isNew: true,
    publishedAt: new Date().toISOString(),
    audioSampleUrl: SAMPLE_AUDIO_URLS[existing.length % SAMPLE_AUDIO_URLS.length],
    chapters: generateChapters(id, durationSec, chapterCount),
  };

  writeStorage(CUSTOM_BOOKS_KEY, [...existing, book]);
  return book;
}

export function removeCustomBook(id: string): void {
  writeStorage(
    CUSTOM_BOOKS_KEY,
    getCustomBooks().filter((b) => b.id !== id),
  );
}
