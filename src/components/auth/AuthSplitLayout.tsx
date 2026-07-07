"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Headphones, Sparkles, Star } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import type { ReactNode } from "react";

export function AuthSplitLayout({
  mode,
  children,
}: {
  mode: "login" | "signup";
  children: ReactNode;
}) {
  const imageOnLeft = mode === "signup";

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

      <div className="relative z-10 max-w-sm">
        <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
          <Sparkles className="size-4" />
          Join 200K+ listeners
        </span>
        <h2 className="mt-5 text-3xl font-bold leading-tight tracking-tight text-foreground">
          Your next favorite book is waiting.
        </h2>
        <p className="mt-3 text-muted-foreground">
          Stream thousands of audiobooks, pick up exactly where you left off,
          and build a listening habit that sticks.
        </p>
        <div className="mt-6 flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Star className="size-4 fill-primary text-primary" />
            4.8 average rating
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
