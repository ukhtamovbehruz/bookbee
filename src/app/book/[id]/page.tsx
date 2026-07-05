import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookHero } from "@/components/book/BookHero";
import { ChapterList } from "@/components/book/ChapterList";
import { RecommendedBooksRail } from "@/components/book/RecommendedBooksRail";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { books, getBookById } from "@/lib/mock-data/books";

export function generateStaticParams() {
  return books.map((book) => ({ id: book.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) return {};
  return {
    title: `${book.title} by ${book.author} — BookBee`,
    description: book.description,
  };
}

export default async function BookDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const book = getBookById(id);
  if (!book) notFound();

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
