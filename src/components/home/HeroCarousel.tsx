"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight, Headphones, Play, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { books as seedBooks } from "@/lib/mock-data/books";
import { getAllBooks, onCatalogChanged } from "@/lib/mock-data/catalog";
import type { Book } from "@/lib/types";

/** Which slice of the catalog a slide pulls its cover art from. */
type CoverKey = "top" | "next" | "new";

interface Slide {
  eyebrow: string;
  title: string;
  highlight: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  from: string;
  to: string;
  accent: string;
  coverKey: CoverKey;
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Welcome to BookBee",
    title: "Listen to the books you",
    highlight: "love.",
    subtitle:
      "Learn, grow, and find inspiration with BookBee — anytime, anywhere, on any device.",
    ctaLabel: "Explore library",
    ctaHref: "#trending",
    from: "#241a3a",
    to: "#0b0b0f",
    accent: "#6C4CF1",
    coverKey: "top",
  },
  {
    eyebrow: "1,000+ titles narrated by pros",
    title: "Your commute just got",
    highlight: "smarter.",
    subtitle:
      "Thousands of business, psychology, and technology audiobooks, ready when you are.",
    ctaLabel: "Browse categories",
    ctaHref: "#categories",
    from: "#2a2412",
    to: "#0b0b0f",
    accent: "#F4B400",
    coverKey: "next",
  },
  {
    eyebrow: "BookBee Premium",
    title: "Go Premium. Listen",
    highlight: "offline.",
    subtitle:
      "Unlimited downloads, AI chapter summaries, listening stats, and zero ads.",
    ctaLabel: "See Premium",
    ctaHref: "/premium",
    from: "#0f2a24",
    to: "#0b0b0f",
    accent: "#22C55E",
    coverKey: "new",
  },
  {
    eyebrow: "Earn as you listen",
    title: "Turn listening into a",
    highlight: "streak.",
    subtitle:
      "Hit your daily goal to earn BookBee Points, build streaks, and climb the leaderboard.",
    ctaLabel: "View leaderboard",
    ctaHref: "/leaderboard",
    from: "#2a1a12",
    to: "#0b0b0f",
    accent: "#F97316",
    coverKey: "top",
  },
  {
    eyebrow: "New every week",
    title: "Fresh audiobooks, just",
    highlight: "landed.",
    subtitle:
      "Discover just-added titles across every category, updated all the time.",
    ctaLabel: "See new releases",
    ctaHref: "#new-releases",
    from: "#12212a",
    to: "#0b0b0f",
    accent: "#38BDF8",
    coverKey: "next",
  },
];

export function HeroCarousel() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Start from the seed catalog for a deterministic first paint, then swap in
  // the merged catalog (admin cover edits + custom books) after mount.
  const [allBooks, setAllBooks] = useState<Book[]>(seedBooks);

  useEffect(() => {
    const refresh = () => setAllBooks(getAllBooks());
    refresh();
    return onCatalogChanged(refresh);
  }, []);

  const coversByKey = useMemo<Record<CoverKey, Book[]>>(() => {
    const byListeners = [...allBooks].sort(
      (a, b) => b.listenerCount - a.listenerCount,
    );
    const newest = [...allBooks]
      .filter((b) => b.isNew)
      .sort(
        (a, b) =>
          new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
      );
    const top = byListeners.slice(0, 3);
    return {
      top,
      next: byListeners.slice(3, 6),
      new: newest.slice(0, 3).length >= 3 ? newest.slice(0, 3) : top,
    };
  }, [allBooks]);

  const next = useCallback(() => setIndex((i) => (i + 1) % SLIDES.length), []);

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(next, 6000);
    return () => clearInterval(timer);
  }, [paused, next]);

  const slide = SLIDES[index];
  const covers = coversByKey[slide.coverKey];

  return (
    <section className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl shadow-black/30"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="relative"
            style={{
              background: `linear-gradient(120deg, ${slide.from}, ${slide.to})`,
            }}
          >
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-0"
            >
              <div
                className="absolute -top-24 right-1/3 size-80 rounded-full blur-3xl"
                style={{ backgroundColor: `${slide.accent}33` }}
              />
              <div
                className="absolute -bottom-24 -left-16 size-72 rounded-full blur-3xl"
                style={{ backgroundColor: `${slide.accent}22` }}
              />
            </div>

            <div className="relative grid min-h-[22rem] grid-cols-1 items-center gap-8 p-8 sm:p-12 lg:grid-cols-2 lg:min-h-[24rem]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="max-w-lg"
              >
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold sm:text-sm"
                  style={{
                    backgroundColor: `${slide.accent}22`,
                    color: slide.accent,
                  }}
                >
                  <Sparkles className="size-3.5" />
                  {slide.eyebrow}
                </span>
                <h1 className="mt-5 text-3xl font-extrabold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
                  {slide.title}{" "}
                  <span style={{ color: slide.accent }}>{slide.highlight}</span>
                </h1>
                <p className="mt-4 max-w-md text-sm text-white/70 sm:text-base">
                  {slide.subtitle}
                </p>
                <div className="mt-7 flex flex-wrap items-center gap-3">
                  <Button
                    asChild
                    size="lg"
                    className="h-12 gap-2 rounded-full px-7 text-base"
                  >
                    <Link href={slide.ctaHref}>
                      <Play className="size-4 fill-current" />
                      {slide.ctaLabel}
                    </Link>
                  </Button>
                  <Link
                    href="/signup"
                    className="inline-flex items-center gap-1 text-sm font-medium text-white/80 transition-colors hover:text-white"
                  >
                    Create free account
                    <ArrowRight className="size-4" />
                  </Link>
                </div>
              </motion.div>

              <div className="relative hidden h-full items-center justify-center lg:flex">
                <div className="relative flex items-end gap-3">
                  {covers.map((book, i) => (
                    <motion.div
                      key={book.id}
                      initial={{ opacity: 0, y: 30, rotate: 0 }}
                      animate={{
                        opacity: 1,
                        y: i === 1 ? -18 : 0,
                        rotate: i === 0 ? -8 : i === 2 ? 8 : 0,
                      }}
                      transition={{ duration: 0.5, delay: 0.15 + i * 0.1 }}
                      className="relative aspect-2/3 w-28 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 xl:w-32"
                      style={{ zIndex: i === 1 ? 3 : 1 }}
                    >
                      <Image
                        src={book.coverUrl}
                        alt=""
                        fill
                        sizes="128px"
                        priority={index === 0}
                        className="object-cover"
                      />
                    </motion.div>
                  ))}
                </div>
                <div className="glass-strong absolute bottom-2 right-2 flex items-center gap-2 rounded-full px-3 py-1.5 text-xs text-white">
                  <Headphones className="size-3.5" style={{ color: slide.accent }} />
                  Now streaming
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-primary" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
