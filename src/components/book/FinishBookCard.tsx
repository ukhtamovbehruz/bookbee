"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Award, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getLibraryEntry } from "@/lib/library";
import type { Book } from "@/lib/types";

export function FinishBookCard({ book }: { book: Book }) {
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    setFinished(Boolean(getLibraryEntry(book.id)?.certificateEarned));
  }, [book.id]);

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1710] via-card to-[#101828] p-6 sm:p-8">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-56 rounded-full bg-primary/15 blur-3xl"
      />
      <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
            {finished ? <Award className="size-6" /> : <GraduationCap className="size-6" />}
          </span>
          <div>
            <h2 className="text-lg font-bold sm:text-xl">
              {finished ? "You've completed this book!" : "Did you finish the book?"}
            </h2>
            <p className="mt-1 max-w-md text-sm text-muted-foreground">
              {finished
                ? "Nicely done. View or print your certificate of completion anytime."
                : "Answer 10 questions about the book to test what you learned and earn a personalized certificate."}
            </p>
          </div>
        </div>

        {finished ? (
          <Button asChild className="h-11 gap-2 rounded-full px-6">
            <Link href={`/book/${book.id}/certificate`}>
              <Award className="size-4" />
              View certificate
            </Link>
          </Button>
        ) : (
          <Button asChild className="h-11 gap-2 rounded-full px-6">
            <Link href={`/book/${book.id}/quiz`}>
              <GraduationCap className="size-4" />
              Take the quiz
            </Link>
          </Button>
        )}
      </div>
    </section>
  );
}
