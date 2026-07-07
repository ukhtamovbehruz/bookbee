"use client";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollRail } from "@/components/shared/ScrollRail";
import { BookCard } from "@/components/book/BookCard";
import { useCatalog } from "@/hooks/useCatalog";
import { getRecommendedBooks } from "@/lib/mock-data/books";
import type { Book } from "@/lib/types";

export function RecommendedBooksRail({ book }: { book: Book }) {
  const recommended = useCatalog(
    (all) =>
      all
        .filter(
          (b) =>
            b.id !== book.id &&
            b.categoryIds.some((c) => book.categoryIds.includes(c)),
        )
        .slice(0, 10),
    getRecommendedBooks(book, 10),
  );

  if (recommended.length === 0) return null;

  return (
    <section>
      <SectionHeading title="You Might Also Like" className="mb-5" />
      <ScrollRail>
        {recommended.map((rec) => (
          <BookCard key={rec.id} book={rec} />
        ))}
      </ScrollRail>
    </section>
  );
}
