"use client";

import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollRail } from "@/components/shared/ScrollRail";
import { BookCard } from "@/components/book/BookCard";
import { useCatalog } from "@/hooks/useCatalog";
import { getTrendingBooks } from "@/lib/mock-data/books";
import type { Book } from "@/lib/types";

const TREND = (books: Book[]) =>
  [...books].sort((a, b) => b.listenerCount - a.listenerCount).slice(0, 14);

export function TrendingBooksRail() {
  const trending = useCatalog(TREND, getTrendingBooks(14));

  return (
    <section id="trending" className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8">
      <SectionHeading
        title="Trending Now"
        subtitle="What everyone's listening to this week"
        className="mb-5"
      />
      <ScrollRail>
        {trending.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </ScrollRail>
    </section>
  );
}
