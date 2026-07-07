import { readStorage, writeStorage } from "@/lib/local-storage";
import type { Book } from "@/lib/types";

const RATINGS_KEY = "bookbee_user_ratings";

type RatingsStore = Record<string, number>;

export function getUserRating(bookId: string): number | undefined {
  const store = readStorage<RatingsStore>(RATINGS_KEY, {});
  return store[bookId];
}

export function setUserRating(bookId: string, value: number): void {
  const store = readStorage<RatingsStore>(RATINGS_KEY, {});
  writeStorage(RATINGS_KEY, { ...store, [bookId]: value });
}

export function getEffectiveRating(book: Book): {
  rating: number;
  ratingCount: number;
} {
  const userRating = getUserRating(book.id);
  if (userRating === undefined) {
    return { rating: book.rating, ratingCount: book.ratingCount };
  }
  const totalScore = book.rating * book.ratingCount + userRating;
  const totalCount = book.ratingCount + 1;
  return { rating: totalScore / totalCount, ratingCount: totalCount };
}
