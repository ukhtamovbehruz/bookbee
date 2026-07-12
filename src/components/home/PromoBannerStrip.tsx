"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Flame,
  Headphones,
  Sparkles,
  Crown,
  type LucideIcon,
} from "lucide-react";
import { books as seedBooks } from "@/lib/mock-data/books";
import { getAllBooks, onCatalogChanged } from "@/lib/mock-data/catalog";
import type { Book } from "@/lib/types";

interface Banner {
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  from: string;
  to: string;
  accent: string;
  icon: LucideIcon;
  cover?: Book;
}

function buildBanners(allBooks: Book[]): Banner[] {
  const featured = [...allBooks].sort(
    (a, b) => b.listenerCount - a.listenerCount,
  )[0];
  const fresh = [...allBooks]
    .filter((b) => b.isNew)
    .sort(
      (a, b) =>
        new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
    )[0];

  return [
    {
      eyebrow: "Book of the Week",
      title: featured?.title ?? "This week's pick",
      subtitle: "Our most-loved listen right now — start it in one tap.",
      ctaLabel: "Listen now",
      ctaHref: featured ? `/book/${featured.id}` : "#trending",
      from: "#1d2b4a",
      to: "#0b0b0f",
      accent: "#38BDF8",
      icon: Headphones,
      cover: featured,
    },
    {
      eyebrow: "Daily streak",
      title: "Keep your streak alive",
      subtitle:
        "Listen 7 minutes a day to earn BookBee Points and climb the leaderboard.",
      ctaLabel: "View leaderboard",
      ctaHref: "/leaderboard",
      from: "#2a1a12",
      to: "#0b0b0f",
      accent: "#F97316",
      icon: Flame,
    },
    {
      eyebrow: "Fresh arrivals",
      title: "New this week",
      subtitle: "Just-added titles across business, psychology, and more.",
      ctaLabel: "Browse new releases",
      ctaHref: "#new-releases",
      from: "#0f2a24",
      to: "#0b0b0f",
      accent: "#22C55E",
      icon: Sparkles,
      cover: fresh,
    },
    {
      eyebrow: "BookBee Premium",
      title: "Unlock offline listening",
      subtitle: "Unlimited downloads, AI chapter summaries, and zero ads.",
      ctaLabel: "See Premium",
      ctaHref: "#premium",
      from: "#241a3a",
      to: "#0b0b0f",
      accent: "#A78BFA",
      icon: Crown,
    },
  ];
}

export function PromoBannerStrip() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  // Seed catalog for first paint; merged catalog (admin edits) after mount.
  const [allBooks, setAllBooks] = useState<Book[]>(seedBooks);

  useEffect(() => {
    const refresh = () => setAllBooks(getAllBooks());
    refresh();
    return onCatalogChanged(refresh);
  }, []);

  const banners = useMemo(() => buildBanners(allBooks), [allBooks]);

  const go = useCallback(
    (dir: number) => setIndex((i) => (i + dir + banners.length) % banners.length),
    [banners.length],
  );

  useEffect(() => {
    if (paused) return;
    const timer = setInterval(() => go(1), 5000);
    return () => clearInterval(timer);
  }, [paused, go]);

  const banner = banners[index];
  const Icon = banner.icon;

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div
        className="relative overflow-hidden rounded-3xl border border-white/10"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            style={{ background: `linear-gradient(120deg, ${banner.from}, ${banner.to})` }}
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 size-64 rounded-full blur-3xl"
              style={{ backgroundColor: `${banner.accent}22` }}
            />
            <div className="relative flex items-center gap-6 p-6 sm:p-8">
              <div className="min-w-0 flex-1">
                <span
                  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${banner.accent}22`, color: banner.accent }}
                >
                  <Icon className="size-3.5" />
                  {banner.eyebrow}
                </span>
                <h3 className="mt-3 truncate text-xl font-bold tracking-tight text-white sm:text-2xl">
                  {banner.title}
                </h3>
                <p className="mt-1.5 max-w-lg text-sm text-white/70">{banner.subtitle}</p>
                <Link
                  href={banner.ctaHref}
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-black transition-transform hover:scale-[1.03]"
                  style={{ backgroundColor: banner.accent }}
                >
                  {banner.ctaLabel}
                  <ArrowRight className="size-4" />
                </Link>
              </div>

              {banner.cover && (
                <Link
                  href={`/book/${banner.cover.id}`}
                  className="relative hidden aspect-2/3 w-24 shrink-0 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50 sm:block"
                >
                  <Image
                    src={banner.cover.coverUrl}
                    alt=""
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </Link>
              )}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* controls */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous banner"
          className="glass-strong absolute left-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-white"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next banner"
          className="glass-strong absolute right-3 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-white"
        >
          <ChevronRight className="size-4" />
        </button>

        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 items-center gap-2">
          {banners.map((_, i) => (
            <button
              key={i}
              type="button"
              aria-label={`Go to banner ${i + 1}`}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-white" : "w-1.5 bg-white/40 hover:bg-white/70"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
