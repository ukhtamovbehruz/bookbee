import { readStorage } from "@/lib/local-storage";
import { getAllBooks, getCatalogBookById } from "@/lib/mock-data/catalog";
import { categories } from "@/lib/mock-data/categories";
import type { LibraryEntry } from "@/lib/library";
import type { Book } from "@/lib/types";

interface CustomBookRecord {
  id: string;
  title: string;
  publishedAt: string;
}

export interface ActivityItem {
  id: string;
  text: string;
  ts: number;
  kind: "title" | "library" | "certificate" | "rating";
}

export interface PlatformMetrics {
  totalPlays: number;
  registeredUsers: number;
  totalTitles: number;
  ratingsGiven: number;
  avgUserRating: number;
  certificatesIssued: number;
  booksInLibraries: number;
  genreDistribution: { label: string; value: number; color: string }[];
  mostPlayed: { book: Book; plays: number }[];
  recentActivity: ActivityItem[];
}

export function getPlatformMetrics(): PlatformMetrics {
  const playCounts = readStorage<Record<string, number>>("bookbee_play_counts", {});
  const userRatings = readStorage<Record<string, number>>("bookbee_user_ratings", {});
  const accounts = readStorage<{ email: string }[]>("bookbee_accounts", []);
  const library = readStorage<Record<string, LibraryEntry>>("bookbee_library", {});
  const customBooks = readStorage<CustomBookRecord[]>("bookbee_custom_books", []);

  const catalog = getAllBooks();

  const totalPlays = Object.values(playCounts).reduce((sum, n) => sum + n, 0);
  const ratingValues = Object.values(userRatings);
  const ratingsGiven = ratingValues.length;
  const avgUserRating =
    ratingsGiven > 0 ? ratingValues.reduce((s, r) => s + r, 0) / ratingsGiven : 0;

  const libraryEntries = Object.values(library);
  const certificatesIssued = libraryEntries.filter((e) => e.certificateEarned).length;

  const genreDistribution = categories
    .map((c) => ({
      label: c.name,
      value: catalog.filter((b) => b.categoryIds.includes(c.id)).length,
      color: c.colorHex,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 5);

  const mostPlayed = catalog
    .map((book) => ({ book, plays: playCounts[book.id] ?? 0 }))
    .filter((row) => row.plays > 0)
    .sort((a, b) => b.plays - a.plays)
    .slice(0, 5);

  const activity: ActivityItem[] = [];
  for (const cb of customBooks) {
    activity.push({
      id: `title-${cb.id}`,
      kind: "title",
      text: `New title added: “${cb.title}”`,
      ts: new Date(cb.publishedAt).getTime() || 0,
    });
  }
  for (const entry of libraryEntries) {
    const title = getCatalogBookById(entry.bookId)?.title ?? "a book";
    activity.push({
      id: `lib-${entry.bookId}`,
      kind: "library",
      text: `A member saved “${title}” to their library`,
      ts: new Date(entry.addedAt).getTime() || 0,
    });
    if (entry.certificateEarned && entry.finishedAt) {
      activity.push({
        id: `cert-${entry.bookId}`,
        kind: "certificate",
        text: `Certificate earned for “${title}”`,
        ts: new Date(entry.finishedAt).getTime() || 0,
      });
    }
  }
  activity.sort((a, b) => b.ts - a.ts);

  return {
    totalPlays,
    registeredUsers: accounts.length,
    totalTitles: catalog.length,
    ratingsGiven,
    avgUserRating,
    certificatesIssued,
    booksInLibraries: libraryEntries.length,
    genreDistribution,
    mostPlayed,
    recentActivity: activity.slice(0, 6),
  };
}

export function timeAgo(ts: number): string {
  if (!ts) return "just now";
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min${mins === 1 ? "" : "s"} ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
