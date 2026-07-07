import type { Metadata } from "next";
import { CatalogBookView } from "@/components/book/CatalogBookView";
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
  if (!book) return { title: "Book — BookBee" };
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
  const fallback = getBookById(id);
  return <CatalogBookView id={id} fallback={fallback} />;
}
