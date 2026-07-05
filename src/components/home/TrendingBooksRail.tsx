import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollRail } from "@/components/shared/ScrollRail";
import { BookCard } from "@/components/book/BookCard";
import { getTrendingBooks } from "@/lib/mock-data/books";

export function TrendingBooksRail() {
  const trending = getTrendingBooks(14);

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
