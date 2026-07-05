import { notFound } from "next/navigation";
import { BookCard } from "@/components/book/BookCard";
import { collections } from "@/lib/mock-data/collections";
import { getBookById } from "@/lib/mock-data/books";

export function generateStaticParams() {
  return collections.map((collection) => ({ id: collection.id }));
}

export default async function CollectionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const collection = collections.find((c) => c.id === id);
  if (!collection) notFound();

  const books = collection.bookIds
    .map((bookId) => getBookById(bookId))
    .filter((book) => book !== undefined);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          {collection.title}
        </h1>
        <p className="mt-2 max-w-2xl text-muted-foreground">
          {collection.description}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
        {books.map((book) => (
          <BookCard key={book.id} book={book} width="w-full" />
        ))}
      </div>
    </div>
  );
}
