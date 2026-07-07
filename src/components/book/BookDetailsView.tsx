import { BookHero } from "@/components/book/BookHero";
import { ChapterList } from "@/components/book/ChapterList";
import { RecommendedBooksRail } from "@/components/book/RecommendedBooksRail";
import { SectionHeading } from "@/components/shared/SectionHeading";
import type { Book } from "@/lib/types";

export function BookDetailsView({ book }: { book: Book }) {
  return (
    <div className="flex flex-col gap-12 pb-24">
      <BookHero book={book} />

      <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading title="Table of Contents" className="mb-5" />
        <ChapterList book={book} />
      </section>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <RecommendedBooksRail book={book} />
      </div>
    </div>
  );
}
