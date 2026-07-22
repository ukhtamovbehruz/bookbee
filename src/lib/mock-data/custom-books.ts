import type { Book, Chapter } from "@/lib/types";
import { readCatalogStore, writeCatalogStore } from "./catalog-store";
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
  durationSec: number;
  isPremium: boolean;
  coverUrl?: string;
  audioUrl?: string;
  tags?: string[];
  chapters?: Chapter[];
}

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function getCustomBooks(): Book[] {
  return readCatalogStore<Book[]>(CUSTOM_BOOKS_KEY, []);
}

export function getCustomBookById(id: string): Book | undefined {
  return getCustomBooks().find((b) => b.id === id);
}

export async function addCustomBook(input: NewBookInput): Promise<Book> {
  const existing = getCustomBooks();
  const baseId = slugify(input.title) || "book";
  let id = baseId;
  let suffix = 1;
  while (existing.some((b) => b.id === id)) {
    id = `${baseId}-${suffix}`;
    suffix += 1;
  }

  const hasChapters = input.chapters !== undefined && input.chapters.length > 0;
  // Re-key explicit chapters to this book's id so their ids are stable/unique.
  const chapters: Chapter[] = hasChapters
    ? input.chapters!.map((c, i) => ({ ...c, id: `${id}-ch-${i + 1}`, index: i + 1 }))
    : generateChapters(
        id,
        Math.max(60, Math.round(input.durationSec)),
        Math.max(4, Math.round(Math.max(60, input.durationSec) / 3600)),
        input.audioUrl?.trim() || undefined,
      );

  const durationSec = chapters.reduce((sum, c) => sum + c.durationSec, 0);
  const audioSampleUrl =
    chapters[0]?.audioUrl ||
    input.audioUrl?.trim() ||
    SAMPLE_AUDIO_URLS[existing.length % SAMPLE_AUDIO_URLS.length];

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
    tags: input.tags && input.tags.length > 0 ? input.tags : undefined,
    audioSampleUrl,
    chapters,
  };

  await writeCatalogStore(CUSTOM_BOOKS_KEY, [...existing, book]);
  return book;
}

export async function removeCustomBook(id: string): Promise<void> {
  await writeCatalogStore(
    CUSTOM_BOOKS_KEY,
    getCustomBooks().filter((b) => b.id !== id),
  );
}
