import type { Book } from "@/lib/types";
import { getCategoryById } from "@/lib/mock-data/categories";

export function filterBooks(query: string, source: Book[]): Book[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  return source.filter((book) => {
    if (book.title.toLowerCase().includes(q)) return true;
    if (book.author.toLowerCase().includes(q)) return true;
    if (book.language.toLowerCase().includes(q)) return true;
    return book.categoryIds.some((id) =>
      getCategoryById(id)?.name.toLowerCase().includes(q),
    );
  });
}
