import type { Book, BookLanguage } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/local-storage";
import { books as seedBooks } from "./books";
import { getCustomBooks, removeCustomBook } from "./custom-books";
import { generateChapters } from "./chapters";
import { notifyCatalogChanged, onCatalogChanged } from "./catalog-events";

export { notifyCatalogChanged, onCatalogChanged };

const BOOK_EDITS_KEY = "bookbee_book_edits";

export interface BookEdit {
  title?: string;
  author?: string;
  narrator?: string;
  publisher?: string;
  description?: string;
  coverUrl?: string;
  categoryIds?: string[];
  language?: BookLanguage;
  durationSec?: number;
  isPremium?: boolean;
  audioUrl?: string;
  hidden?: boolean;
}

type BookEditsStore = Record<string, BookEdit>;

export function getBookEdits(): BookEditsStore {
  return readStorage<BookEditsStore>(BOOK_EDITS_KEY, {});
}

export function saveBookEdit(bookId: string, edit: BookEdit): void {
  const store = getBookEdits();
  store[bookId] = { ...store[bookId], ...edit };
  writeStorage(BOOK_EDITS_KEY, store);
  notifyCatalogChanged();
}

/** Remove a book from the catalog: delete custom books, hide seed books. */
export function deleteBook(bookId: string): void {
  if (isSeedBook(bookId)) {
    saveBookEdit(bookId, { hidden: true });
  } else {
    removeCustomBook(bookId);
    notifyCatalogChanged();
  }
}

function applyEdit(book: Book, edit: BookEdit | undefined): Book {
  if (!edit) return book;

  const durationSec = edit.durationSec ?? book.durationSec;
  const needsChapterRebuild =
    edit.durationSec !== undefined || edit.audioUrl !== undefined;

  const merged: Book = {
    ...book,
    ...(edit.title !== undefined && { title: edit.title }),
    ...(edit.author !== undefined && { author: edit.author }),
    ...(edit.narrator !== undefined && { narrator: edit.narrator }),
    ...(edit.publisher !== undefined && { publisher: edit.publisher }),
    ...(edit.description !== undefined && { description: edit.description }),
    ...(edit.coverUrl !== undefined && edit.coverUrl !== "" && { coverUrl: edit.coverUrl }),
    ...(edit.categoryIds !== undefined && { categoryIds: edit.categoryIds }),
    ...(edit.language !== undefined && { language: edit.language }),
    ...(edit.isPremium !== undefined && { isPremium: edit.isPremium }),
    durationSec,
  };

  if (edit.audioUrl) {
    merged.audioSampleUrl = edit.audioUrl;
  }

  if (needsChapterRebuild) {
    const count = Math.max(4, Math.round(durationSec / 3600));
    merged.chapters = generateChapters(book.id, durationSec, count, edit.audioUrl);
  }

  return merged;
}

/** Every visible book on the platform, with admin edits applied. */
export function getAllBooks(): Book[] {
  const edits = getBookEdits();
  const custom = getCustomBooks();
  return [...seedBooks, ...custom]
    .filter((book) => !edits[book.id]?.hidden)
    .map((book) => applyEdit(book, edits[book.id]));
}

/** Every book including hidden ones — for the admin catalog view. */
export function getAdminBooks(): Book[] {
  const edits = getBookEdits();
  const custom = getCustomBooks();
  return [...seedBooks, ...custom].map((book) => ({
    ...applyEdit(book, edits[book.id]),
    hidden: Boolean(edits[book.id]?.hidden),
  })) as (Book & { hidden: boolean })[];
}

export function getCatalogBookById(id: string): Book | undefined {
  const edits = getBookEdits();
  const custom = getCustomBooks();
  const base = seedBooks.find((b) => b.id === id) ?? custom.find((b) => b.id === id);
  return base ? applyEdit(base, edits[id]) : undefined;
}

export function isSeedBook(id: string): boolean {
  return seedBooks.some((b) => b.id === id);
}

export function getCatalogByCategory(categoryId: string): Book[] {
  return getAllBooks().filter((b) => b.categoryIds.includes(categoryId));
}

export function getCatalogTrending(limit = 14): Book[] {
  return [...getAllBooks()]
    .sort((a, b) => b.listenerCount - a.listenerCount)
    .slice(0, limit);
}

export function getCatalogNewReleases(limit = 12): Book[] {
  return [...getAllBooks()]
    .filter((b) => b.isNew)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )
    .slice(0, limit);
}

export function getCatalogMostPopular(limit = 10): Book[] {
  return [...getAllBooks()]
    .sort((a, b) => b.rating * b.ratingCount - a.rating * a.ratingCount)
    .slice(0, limit);
}

export function getCatalogRecommended(book: Book, limit = 10): Book[] {
  return getAllBooks()
    .filter(
      (b) =>
        b.id !== book.id &&
        b.categoryIds.some((c) => book.categoryIds.includes(c)),
    )
    .slice(0, limit);
}
