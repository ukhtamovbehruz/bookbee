"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { getMostPopularBooks } from "@/lib/mock-data/books";
import { formatCount, formatDuration } from "@/lib/utils";

export function MostPopularCarousel() {
  const { playBook } = useAudioPlayer();
  const popular = getMostPopularBooks(10);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Most Popular Books" className="mb-5" />
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent>
          {popular.map((book) => (
            <CarouselItem
              key={book.id}
              className="basis-[70%] sm:basis-[42%] md:basis-[32%] lg:basis-[24%]"
            >
              <Link
                href={`/book/${book.id}`}
                className="group relative block aspect-16/9 overflow-hidden rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <Image
                  src={book.coverUrl}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 70vw, 320px"
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    playBook(book);
                  }}
                  aria-label={`Play ${book.title}`}
                  className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
                >
                  <Play className="size-4 fill-current ml-0.5" />
                </button>

                <div className="absolute inset-x-0 bottom-0 p-4">
                  <p className="truncate font-semibold text-white">
                    {book.title}
                  </p>
                  <p className="truncate text-sm text-white/70">{book.author}</p>
                  <div className="mt-1.5 flex items-center gap-2 text-xs text-white/70">
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-primary text-primary" />
                      {book.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{formatDuration(book.durationSec)}</span>
                    <span aria-hidden="true">·</span>
                    <span>{formatCount(book.listenerCount)} listeners</span>
                  </div>
                </div>
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="left-2 hidden sm:flex" />
        <CarouselNext className="right-2 hidden sm:flex" />
      </Carousel>
    </section>
  );
}
