"use client";

import Image from "next/image";
import { Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { books } from "@/lib/mock-data/books";
import { formatCount } from "@/lib/utils";

export function Hero() {
  const { playBook } = useAudioPlayer();
  const featured = books.find((b) => b.id === "sapiens") ?? books[0];

  return (
    <section className="relative overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 -left-40 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute top-10 right-[-8rem] size-[28rem] rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-2 lg:items-center lg:px-8 lg:py-28">
        <div className="flex flex-col gap-6">
          <Badge variant="secondary" className="w-fit gap-1">
            <Sparkles className="size-3" />
            New: AI summaries for every book
          </Badge>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            Your next favorite book,{" "}
            <span className="text-gradient-brand">narrated</span>.
          </h1>
          <p className="max-w-lg text-base text-muted-foreground sm:text-lg">
            Stream thousands of audiobooks across business, psychology,
            technology, and more — pick up exactly where you left off, on any
            device.
          </p>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              size="lg"
              className="h-12 gap-2 rounded-full px-6 text-base"
              onClick={() => playBook(featured)}
            >
              <Play className="size-4 fill-current" />
              Start Listening Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-12 rounded-full px-6 text-base"
              asChild
            >
              <a href="#trending">Explore Trending</a>
            </Button>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-sm lg:max-w-md">
          <div className="glass-strong relative flex items-center gap-4 rounded-3xl p-5 shadow-2xl shadow-black/40">
            <div className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-xl shadow-lg">
              <Image
                src={featured.coverUrl}
                alt=""
                fill
                sizes="112px"
                priority
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-widest text-primary">
                Featured today
              </p>
              <p className="mt-1 truncate font-semibold">{featured.title}</p>
              <p className="truncate text-sm text-muted-foreground">
                {featured.author}
              </p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatCount(featured.listenerCount)} listening now
              </p>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="glass absolute -bottom-6 -left-6 hidden rounded-2xl px-4 py-3 sm:block"
          >
            <p className="text-xs text-muted-foreground">Now trending</p>
            <p className="text-sm font-semibold text-primary">+18% this week</p>
          </div>
        </div>
      </div>
    </section>
  );
}
