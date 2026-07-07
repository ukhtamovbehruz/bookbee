import type { Metadata } from "next";
import { BookDetailsView } from "@/components/book/BookDetailsView";
import { CustomBookGate } from "@/components/book/CustomBookGate";
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

  if (book) return <BookDetailsView book={book} />;
  return <CustomBookGate id={id} />;
}
