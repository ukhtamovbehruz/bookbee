"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
import { Award, Flame, GraduationCap, Library as LibraryIcon, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthProvider";
import { getBookById } from "@/lib/mock-data/books";
import { getCustomBookById } from "@/lib/mock-data/custom-books";
import {
  getLibraryEntries,
  removeFromLibrary,
  setLibraryNote,
  type LibraryEntry,
} from "@/lib/library";
import { getActivityStreak } from "@/lib/activity";
import { formatDuration } from "@/lib/utils";
import type { Book } from "@/lib/types";

interface Row {
  entry: LibraryEntry;
  book: Book;
}

export default function LibraryPage() {
  const { user, isReady } = useAuth();
  const router = useRouter();
  const [rows, setRows] = useState<Row[]>([]);
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  useEffect(() => {
    if (!user) return;
    const entries = getLibraryEntries();
    const resolved = entries
      .map((entry) => {
        const book = getBookById(entry.bookId) ?? getCustomBookById(entry.bookId);
        return book ? { entry, book } : null;
      })
      .filter((row): row is Row => row !== null);
    setRows(resolved);
    setStreak(getActivityStreak());
  }, [user]);

  if (!isReady || !user) return null;

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="flex items-center gap-2">
        <LibraryIcon className="size-5 text-primary" />
        <h1 className="text-2xl font-bold tracking-tight">My Library</h1>
      </div>

      <div
        id="streak"
        className="glass mt-6 flex scroll-mt-24 items-center gap-4 rounded-2xl p-5"
      >
        <span className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <Flame className="size-6" />
        </span>
        <div>
          <p className="text-2xl font-bold">
            {streak} day{streak === 1 ? "" : "s"}
          </p>
          <p className="text-sm text-muted-foreground">
            Listen at least 7 minutes each day to keep your streak alive.
          </p>
        </div>
      </div>

      <div className="mt-8 space-y-4">
        {rows.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You haven&apos;t added any books yet. Browse the{" "}
            <Link href="/" className="text-primary hover:underline">
              homepage
            </Link>{" "}
            and tap &ldquo;Add to Library&rdquo; on a book you like.
          </p>
        )}

        {rows.map(({ entry, book }) => (
          <div key={book.id} className="glass flex flex-col gap-4 rounded-2xl p-4 sm:flex-row">
            <Link href={`/book/${book.id}`} className="relative aspect-2/3 w-20 shrink-0 overflow-hidden rounded-lg sm:w-24">
              <Image src={book.coverUrl} alt="" fill sizes="96px" className="object-cover" />
            </Link>

            <div className="flex-1 space-y-2">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <Link href={`/book/${book.id}`} className="font-semibold hover:underline">
                    {book.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {book.author} · {formatDuration(book.durationSec)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {entry.certificateEarned ? (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link href={`/book/${book.id}/certificate`}>
                        <Award className="size-3.5 text-primary" />
                        Certificate
                      </Link>
                    </Button>
                  ) : (
                    <Button variant="outline" size="sm" className="gap-1.5" asChild>
                      <Link href={`/book/${book.id}/quiz`}>
                        <GraduationCap className="size-3.5" />
                        Finish & Quiz
                      </Link>
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Remove ${book.title} from library`}
                    onClick={() => {
                      removeFromLibrary(book.id);
                      setRows((prev) => prev.filter((r) => r.book.id !== book.id));
                      toast.info(`Removed "${book.title}" from your library.`);
                    }}
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </div>
              </div>

              <Textarea
                placeholder="Add a personal note or description about this book..."
                defaultValue={entry.note}
                rows={2}
                className="text-sm"
                onBlur={(e) => setLibraryNote(book.id, e.currentTarget.value)}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
