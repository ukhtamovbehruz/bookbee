"use client";

import { useEffect, useState } from "react";
import { BookCard } from "@/components/book/BookCard";
import { getCatalogCollectionById, onCatalogChanged } from "@/lib/mock-data/curation";
import { getCatalogBookById } from "@/lib/mock-data/catalog";
import type { Book, Collection } from "@/lib/types";

export function CollectionView({ initial }: { initial: Collection }) {
  const [collection, setCollection] = useState<Collection>(initial);
  const [books, setBooks] = useState<Book[]>([]);

  useEffect(() => {
    const refresh = () => {
      const next = getCatalogCollectionById(initial.id) ?? initial;
      setCollection(next);
      setBooks(
        next.bookIds
          .map((id) => getCatalogBookById(id))
          .filter((b): b is Book => b !== undefined),
      );
    };
    refresh();
    return onCatalogChanged(refresh);
  }, [initial]);

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
