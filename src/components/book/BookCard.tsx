"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { Play, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { cardHover } from "@/animations/variants";
import { cn, formatDuration } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function BookCard({
  book,
  className,
  width = "w-40 sm:w-44",
}: {
  book: Book;
  className?: string;
  width?: string;
}) {
  const { playBook, currentBook, isPlaying } = useAudioPlayer();
  const isCurrentlyPlaying = currentBook?.id === book.id && isPlaying;

  return (
    <motion.div
      initial="rest"
      whileHover="hover"
      animate="rest"
      variants={cardHover}
      className={cn("shrink-0 snap-start", width, className)}
    >
      <Link
        href={`/book/${book.id}`}
        className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-2xl"
      >
        <div className="relative aspect-2/3 overflow-hidden rounded-2xl bg-muted shadow-lg shadow-black/30">
          <Image
            src={book.coverUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 40vw, 176px"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-black/0 opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

          {book.isPremium && (
            <Badge className="absolute left-2 top-2 bg-primary text-primary-foreground">
              Premium
            </Badge>
          )}

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              playBook(book);
            }}
            aria-label={`Play ${book.title}`}
            className="absolute bottom-2 right-2 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg shadow-black/40 transition-all duration-200 group-hover:opacity-100 group-hover:translate-y-0 translate-y-2 hover:scale-110"
          >
            {isCurrentlyPlaying ? (
              <span className="flex gap-0.5">
                <span className="h-3 w-0.5 animate-pulse bg-current" />
                <span className="h-3 w-0.5 animate-pulse bg-current [animation-delay:150ms]" />
                <span className="h-3 w-0.5 animate-pulse bg-current [animation-delay:300ms]" />
              </span>
            ) : (
              <Play className="size-4 fill-current ml-0.5" />
            )}
          </button>
        </div>

        <div className="mt-2.5 space-y-0.5">
          <h3 className="truncate text-sm font-medium text-foreground">
            {book.title}
          </h3>
          <p className="truncate text-xs text-muted-foreground">{book.author}</p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-0.5">
              <Star className="size-3 fill-primary text-primary" />
              {book.rating.toFixed(1)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{formatDuration(book.durationSec)}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
