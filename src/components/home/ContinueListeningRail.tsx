"use client";

import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { ScrollRail } from "@/components/shared/ScrollRail";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { continueListening, getProgressRatio } from "@/lib/mock-data/continue-listening";
import { getBookById } from "@/lib/mock-data/books";
import { formatDuration } from "@/lib/utils";

export function ContinueListeningRail() {
  const { playBook } = useAudioPlayer();

  const entries = continueListening
    .map((entry) => ({ entry, book: getBookById(entry.bookId) }))
    .filter((e) => e.book);

  if (entries.length === 0) return null;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Continue Listening" className="mb-5" />
      <ScrollRail>
        {entries.map(({ entry, book }) => {
          if (!book) return null;
          const progress = getProgressRatio(entry) * 100;
          const remaining = book.durationSec - entry.progressSec;

          return (
            <div key={book.id} className="w-56 shrink-0 snap-start sm:w-64">
              <Link
                href={`/book/${book.id}`}
                className="group relative block overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <div className="relative aspect-16/9 overflow-hidden rounded-2xl bg-muted">
                  <Image
                    src={book.coverUrl}
                    alt=""
                    fill
                    sizes="256px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent" />

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      playBook(book, entry.chapterId);
                    }}
                    aria-label={`Resume ${book.title}`}
                    className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110"
                  >
                    <Play className="size-4 fill-current ml-0.5" />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-3">
                    <p className="truncate text-sm font-semibold text-white">
                      {book.title}
                    </p>
                    <p className="truncate text-xs text-white/70">
                      {formatDuration(remaining)} left
                    </p>
                    <div className="mt-2 h-1 w-full overflow-hidden rounded-full bg-white/20">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          );
        })}
      </ScrollRail>
    </section>
  );
}
