"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Headphones, Quote, Sparkles, Star } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { books } from "@/lib/mock-data/books";
import { getCatalogBookById, onCatalogChanged } from "@/lib/mock-data/catalog";
import type { Book } from "@/lib/types";
import { useEffect, useState, type ReactNode } from "react";

const SHOWCASE_IDS = ["atomic-habits", "sapiens", "1984"];

const SEED_SHOWCASE = SHOWCASE_IDS.map((id) =>
  books.find((b) => b.id === id),
).filter((b): b is Book => Boolean(b));

export function AuthSplitLayout({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: ReactNode;
}) {
  const imageOnLeft = mode === "signup";

  // Seed covers on first paint, then swap in admin cover edits after mount so
  // the auth pages reflect the same catalog as the rest of the app.
  const [showcase, setShowcase] = useState<Book[]>(SEED_SHOWCASE);

  useEffect(() => {
    const refresh = () =>
      setShowcase(
        SHOWCASE_IDS.map((id) => getCatalogBookById(id)).filter(
          (b): b is Book => Boolean(b),
        ),
      );
    refresh();
    return onCatalogChanged(refresh);
  }, []);

  const brandPanel = (
    <motion.div
      key="brand-panel"
      initial={{ opacity: 0, x: imageOnLeft ? -32 : 32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative hidden flex-1 flex-col justify-between overflow-hidden bg-gradient-to-br from-[#17171D] via-[#1b1530] to-[#0b0b0f] p-10 lg:flex"
    >
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 size-72 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute bottom-[-6rem] right-[-4rem] size-80 rounded-full bg-secondary/25 blur-3xl" />
      </div>

      <div className="relative z-10">
        <Logo />
      </div>

      {/* floating book covers */}
      <div className="relative z-10 my-8 flex items-end justify-center gap-4">
        {showcase.map((book, i) => (
          <motion.div
            key={book.id}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: i === 1 ? -20 : 0 }}
            transition={{ duration: 0.6, delay: 0.2 + i * 0.12 }}
            className="relative aspect-2/3 w-28 overflow-hidden rounded-xl border border-white/10 shadow-2xl shadow-black/50"
            style={{ rotate: `${i === 0 ? -6 : i === 2 ? 6 : 0}deg` }}
          >
            <Image src={book.coverUrl} alt="" fill sizes="112px" className="object-cover" />
          </motion.div>
        ))}
      </div>

      <div className="relative z-10 max-w-sm">
        <div className="glass-strong rounded-2xl p-5">
          <Quote className="size-5 text-primary" />
          <p className="mt-2 text-sm text-white/90">
            &ldquo;A reader lives a thousand lives before he dies. The man who
            never reads lives only one.&rdquo;
          </p>
          <p className="mt-2 text-xs text-white/60">— George R.R. Martin</p>
        </div>

        <div className="mt-6 flex items-center gap-4 text-sm text-white/70">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 font-semibold text-primary">
            <Sparkles className="size-3.5" />
            200K+ listeners
          </span>
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-primary text-primary" />
            4.8 rating
          </span>
          <span className="flex items-center gap-1">
            <Headphones className="size-4" />
            1,000+ titles
          </span>
        </div>
      </div>
    </motion.div>
  );

  const formPanel = (
    <motion.div
      key="form-panel"
      initial={{ opacity: 0, x: imageOnLeft ? 32 : -32 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="flex flex-1 flex-col justify-center px-6 py-12 sm:px-12 lg:px-20"
    >
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 lg:hidden">
          <Logo />
        </div>
        {children}
      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 z-40 flex overflow-y-auto bg-background">
      <Link
        href="/"
        className="absolute right-6 top-6 z-20 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        Back to BookBee
      </Link>
      {imageOnLeft ? (
        <>
          {brandPanel}
          {formPanel}
        </>
      ) : (
        <>
          {formPanel}
          {brandPanel}
        </>
      )}
    </div>
  );
}
