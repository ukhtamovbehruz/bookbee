"use client";

import Image from "next/image";
import Link from "next/link";
import { Play, Star, Users } from "lucide-react";
import { SectionHeading } from "@/components/shared/SectionHeading";
import { Badge } from "@/components/ui/badge";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useGuardedPlay } from "@/hooks/useGuardedPlay";
import { useCatalog } from "@/hooks/useCatalog";
import { getMostPopularBooks } from "@/lib/mock-data/books";
import { formatCount } from "@/lib/utils";
import type { Book } from "@/lib/types";

const POPULAR = (books: Book[]) =>
  [...books]
    .sort((a, b) => b.listenerCount - a.listenerCount)
    .slice(0, 12);

export function MostPopularCarousel() {
  const guardedPlay = useGuardedPlay();
  const popular = useCatalog(POPULAR, getMostPopularBooks(12));

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <SectionHeading title="Most Popular Books" className="mb-5" />
      <Carousel opts={{ align: "start", dragFree: true }}>
        <CarouselContent>
          {popular.map((book, i) => (
            <CarouselItem
              key={book.id}
              className="basis-[42%] sm:basis-[30%] md:basis-[22%] lg:basis-[18%]"
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
                    sizes="(max-width: 640px) 42vw, 220px"
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* rank */}
                  <span className="absolute left-2 top-2 flex size-7 items-center justify-center rounded-full bg-black/55 text-xs font-bold text-white backdrop-blur-sm">
                    {i + 1}
                  </span>

                  {book.isPremium && (
                    <Badge className="absolute right-2 top-2 bg-primary text-primary-foreground">
                      Premium
                    </Badge>
                  )}

                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      guardedPlay(book);
                    }}
                    aria-label={`Play ${book.title}`}
                    className="absolute bottom-2 right-2 flex size-10 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all group-hover:opacity-100 hover:scale-110"
                  >
                    <Play className="size-4 fill-current ml-0.5" />
                  </button>
                </div>

                <div className="mt-2.5 space-y-0.5">
                  <p className="truncate text-sm font-semibold text-foreground">
                    {book.title}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {book.author}
                  </p>
                  <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-0.5">
                      <Star className="size-3 fill-primary text-primary" />
                      {book.rating.toFixed(1)}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="flex items-center gap-1">
                      <Users className="size-3" />
                      {formatCount(book.listenerCount)}
                    </span>
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
