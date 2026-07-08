"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Award, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import { getBookById } from "@/lib/mock-data/books";
import { getCustomBookById } from "@/lib/mock-data/custom-books";
import { getLibraryEntry } from "@/lib/library";
import type { Book } from "@/lib/types";
import type { LibraryEntry } from "@/lib/library";

export default function CertificatePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, isReady } = useAuth();
  const [book, setBook] = useState<Book | null | undefined>(undefined);
  const [entry, setEntry] = useState<LibraryEntry | undefined>(undefined);

  useEffect(() => {
    setBook(getBookById(params.id) ?? getCustomBookById(params.id) ?? null);
    setEntry(getLibraryEntry(params.id));
  }, [params.id]);

  useEffect(() => {
    if (isReady && !user) router.replace("/signup");
  }, [isReady, user, router]);

  if (!isReady || !user || book === undefined) return null;

  if (book === null || !entry?.certificateEarned) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold">No certificate found</h1>
        <p className="mt-2 text-muted-foreground">
          Complete the quiz for this book to earn your certificate.
        </p>
        <Button asChild className="mt-6 rounded-full">
          <Link href={`/book/${params.id}/quiz`}>Take the quiz</Link>
        </Button>
      </div>
    );
  }

  const finishedDate = entry.finishedAt
    ? new Date(entry.finishedAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="print:hidden mb-6 flex justify-end">
        <Button className="gap-2 rounded-full" onClick={() => window.print()}>
          <Printer className="size-4" />
          Print / Save as PDF
        </Button>
      </div>

      <div className="relative overflow-hidden rounded-3xl border-2 border-primary/30 bg-gradient-to-br from-card via-card to-[#151022] p-10 text-center sm:p-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 border-[12px] border-double border-primary/10"
        />
        <div className="relative flex flex-col items-center">
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/bookbee-logo-full.svg"
              alt="BookBee"
              width={64}
              height={64}
              className="size-14"
            />
            <span className="text-lg font-bold uppercase tracking-[0.35em]">
              BookBee
            </span>
          </div>

          <span className="mt-8 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Award className="size-8" />
          </span>

          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
            Certificate of Completion
          </p>
          <p className="mt-6 text-sm text-muted-foreground">This certifies that</p>
          <p className="mt-2 text-2xl font-bold sm:text-3xl">{user.name}</p>
          <p className="mt-6 text-sm text-muted-foreground">
            has successfully completed the audiobook
          </p>
          <p className="mt-2 max-w-lg text-xl font-semibold text-foreground sm:text-2xl">
            &ldquo;{book.title}&rdquo;
          </p>
          <p className="mt-1 text-sm text-muted-foreground">by {book.author}</p>

          <div className="mt-8 flex items-center gap-8 text-sm text-muted-foreground">
            <div>
              <p className="text-xs uppercase tracking-wide">Score</p>
              <p className="font-medium text-foreground">{entry.quizScore}/10</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide">Date</p>
              <p className="font-medium text-foreground">{finishedDate}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
