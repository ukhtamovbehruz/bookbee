import type { ContinueListeningEntry } from "@/lib/types";
import { getBookById } from "./books";

const raw: ContinueListeningEntry[] = [
  { bookId: "atomic-habits", chapterId: "atomic-habits-ch-3", progressSec: 1800 },
  { bookId: "sapiens", chapterId: "sapiens-ch-5", progressSec: 9600 },
  { bookId: "clean-code", chapterId: "clean-code-ch-2", progressSec: 2400 },
  { bookId: "psychology-of-money", chapterId: "psychology-of-money-ch-4", progressSec: 6300 },
];

export const continueListening = raw.filter((entry) => getBookById(entry.bookId));

export function getProgressRatio(entry: ContinueListeningEntry): number {
  const book = getBookById(entry.bookId);
  if (!book || book.durationSec === 0) return 0;
  return Math.min(1, entry.progressSec / book.durationSec);
}
