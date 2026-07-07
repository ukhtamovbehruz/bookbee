"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Pause, Play, Star, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookActions } from "@/components/book/BookActions";
import { RatingWidget } from "@/components/book/RatingWidget";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { useGuardedPlay } from "@/hooks/useGuardedPlay";
import { useLiveListenerCount } from "@/hooks/useLiveListenerCount";
import { getEffectiveRating } from "@/lib/ratings";
import { formatCount, formatDuration } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function BookHero({ book }: { book: Book }) {
  const { currentBook, isPlaying, togglePlayPause } = useAudioPlayer();
  const guardedPlay = useGuardedPlay();
  const isCurrent = currentBook?.id === book.id;
  const liveListenerCount = useLiveListenerCount(book);
  const [effectiveRating, setEffectiveRating] = useState(() => getEffectiveRating(book));

  useEffect(() => {
    setEffectiveRating(getEffectiveRating(book));
  }, [book]);

  return (
    <section className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 lg:px-8">
      <div className="flex flex-col gap-8 sm:flex-row">
        <div className="relative mx-auto aspect-2/3 w-56 shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 sm:mx-0">
          <Image
            src={book.coverUrl}
            alt=""
            fill
            sizes="224px"
            priority
            className="object-cover"
          />
          {book.isPremium && (
            <Badge className="absolute left-3 top-3 bg-primary text-primary-foreground">
              Premium
            </Badge>
          )}
        </div>

        <div className="flex flex-1 flex-col justify-center gap-3">
          <div className="flex flex-wrap gap-2">
            {book.tags?.map((tag) => (
              <Badge key={tag} variant="secondary" className="capitalize">
                {tag.replace("-", " ")}
              </Badge>
            ))}
          </div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-4xl">
            {book.title}
          </h1>
          <p className="text-lg text-muted-foreground">{book.author}</p>

          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wide">Narrator</dt>
              <dd className="text-foreground">{book.narrator}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Publisher</dt>
              <dd className="text-foreground">{book.publisher}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wide">Length</dt>
              <dd className="text-foreground">{formatDuration(book.durationSec)}</dd>
            </div>
          </dl>

          <div className="flex flex-wrap items-center gap-4 text-sm">
            <span className="flex items-center gap-1 font-medium text-foreground">
              <Star className="size-4 fill-primary text-primary" />
              {effectiveRating.rating.toFixed(1)}
              <span className="text-muted-foreground">
                ({formatCount(effectiveRating.ratingCount)})
              </span>
            </span>
            <span className="flex items-center gap-1 text-muted-foreground">
              <Users className="size-4" />
              {formatCount(liveListenerCount)} listeners
            </span>
          </div>

          <RatingWidget book={book} onRated={() => setEffectiveRating(getEffectiveRating(book))} />

          <div className="mt-2 flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-8 text-base"
              onClick={() => (isCurrent ? togglePlayPause() : guardedPlay(book))}
            >
              {isCurrent && isPlaying ? (
                <Pause className="size-4 fill-current" />
              ) : (
                <Play className="size-4 fill-current" />
              )}
              {isCurrent && isPlaying ? "Pause" : "Play"}
            </Button>
            <BookActions book={book} />
          </div>
        </div>
      </div>

      <p className="mt-10 max-w-3xl text-base leading-relaxed text-muted-foreground">
        {book.description}
      </p>
    </section>
  );
}
