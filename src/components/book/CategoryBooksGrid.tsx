"use client";

import { BookCard } from "@/components/book/BookCard";
import { useCatalog } from "@/hooks/useCatalog";
import type { Book } from "@/lib/types";

export function CategoryBooksGrid({
  categoryId,
  initial,
}: {
  categoryId: string;
  initial: Book[];
}) {
  const books = useCatalog(
    (all) => all.filter((b) => b.categoryIds.includes(categoryId)),
    initial,
  );

  if (books.length === 0) {
    return <p className="text-muted-foreground">No books in this category yet.</p>;
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
      {books.map((book) => (
        <BookCard key={book.id} book={book} width="w-full" />
      ))}
    </div>
  );
}
