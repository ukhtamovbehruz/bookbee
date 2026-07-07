"use client";

import { useEffect, useState } from "react";
import { BookDetailsView } from "@/components/book/BookDetailsView";
import { Skeleton } from "@/components/ui/skeleton";
import { getCustomBookById } from "@/lib/mock-data/custom-books";
import type { Book } from "@/lib/types";
import BookNotFound from "@/app/(site)/book/[id]/not-found";

export function CustomBookGate({ id }: { id: string }) {
  const [book, setBook] = useState<Book | null | undefined>(undefined);

  useEffect(() => {
    setBook(getCustomBookById(id) ?? null);
  }, [id]);

  if (book === undefined) {
    return (
      <div className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
        <Skeleton className="mx-auto aspect-2/3 w-56 rounded-2xl" />
      </div>
    );
  }

  if (book === null) return <BookNotFound />;

  return <BookDetailsView book={book} />;
}
