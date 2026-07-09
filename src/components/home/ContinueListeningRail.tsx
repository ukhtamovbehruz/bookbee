"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { BookOpen, RotateCcw } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Button } from "@/components/ui/button";
import { useGuardedPlay } from "@/hooks/useGuardedPlay";
import { getAllPlaybackProgress, onPlaybackChanged } from "@/lib/playback-progress";
import { getCatalogBookById, onCatalogChanged } from "@/lib/mock-data/catalog";
import type { Book } from "@/lib/types";

interface LastListen {
  book: Book;
  percent: number;
}

function resolveLastListen(): LastListen | null {
  const latest = getAllPlaybackProgress()[0];
  if (!latest) return null;
  const book = getCatalogBookById(latest.bookId);
  if (!book) return null;

  const idx = book.chapters.findIndex((c) => c.id === latest.chapterId);
  const priorSec =
    idx > 0 ? book.chapters.slice(0, idx).reduce((s, c) => s + c.durationSec, 0) : 0;
  const total =
    book.durationSec || book.chapters.reduce((s, c) => s + c.durationSec, 0) || 1;
  const percent = Math.min(100, Math.round(((priorSec + latest.positionSec) / total) * 100));

  return { book, percent };
}

export function ContinueListeningRail() {
  const guardedPlay = useGuardedPlay();
  const [last, setLast] = useState<LastListen | null>(null);

  useEffect(() => {
    const refresh = () => setLast(resolveLastListen());
    refresh();
    const offPlayback = onPlaybackChanged(refresh);
    const offCatalog = onCatalogChanged(refresh);
    return () => {
      offPlayback();
      offCatalog();
    };
  }, []);

  if (!last) return null;
  const { book, percent } = last;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Continue Listening" className="mb-5" />

      <div className="glass flex items-center gap-5 rounded-3xl p-5 sm:gap-7 sm:p-7">
        {/* cover on a shelf */}
        <div className="relative shrink-0">
          <Link href={`/book/${book.id}`} className="block">
            <div className="relative aspect-2/3 w-24 overflow-hidden rounded-lg shadow-xl shadow-black/40 sm:w-28">
              <Image
                src={book.coverUrl}
                alt={book.title}
                fill
                sizes="112px"
                className="object-cover"
              />
            </div>
          </Link>
          {/* wooden shelf */}
          <div
            aria-hidden
            className="absolute -bottom-3 -left-3 -right-3 h-3 rounded-full"
            style={{
              background: "linear-gradient(180deg, #d7a86e, #b07a45)",
              boxShadow: "0 6px 12px rgba(0,0,0,.35)",
            }}
          />
        </div>

        {/* details */}
        <div className="min-w-0 flex-1">
          <Link href={`/book/${book.id}`} className="block">
            <h3 className="truncate text-lg font-bold tracking-tight sm:text-xl">
              {book.title}
            </h3>
            <p className="truncate text-sm text-muted-foreground">{book.author}</p>
          </Link>

          <div className="mt-4 flex items-center gap-3">
            <BookOpen className="size-5 shrink-0 text-muted-foreground" />
            <div className="relative h-2.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-orange-500 transition-[width] duration-500"
                style={{ width: `${percent}%` }}
              />
            </div>
            <span className="w-10 shrink-0 text-right text-sm font-semibold tabular-nums">
              {percent}%
            </span>
          </div>

          <Button
            className="mt-5 gap-2 rounded-full"
            onClick={() => guardedPlay(book)}
          >
            <RotateCcw className="size-4" />
            Resume
          </Button>
        </div>
      </div>
    </section>
  );
}
