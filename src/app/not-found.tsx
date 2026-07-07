"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { BookOpen, Home, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BeeIcon } from "@/components/shared/BeeIcon";

export default function GlobalNotFound() {
  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-background px-4 text-center">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-32 size-96 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-[-8rem] right-[-6rem] size-[26rem] rounded-full bg-secondary/20 blur-3xl" />
      </div>

      <motion.div
        aria-hidden="true"
        className="relative mb-6 size-16"
        animate={{
          x: [0, 24, -18, 30, 0],
          y: [0, -18, 10, -14, 0],
          rotate: [0, 8, -6, 6, 0],
        }}
        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      >
        <BeeIcon className="size-16" />
      </motion.div>

      <span className="relative bg-gradient-to-r from-[#F4B400] to-[#6C4CF1] bg-clip-text text-7xl font-extrabold tracking-tight text-transparent sm:text-8xl">
        404
      </span>
      <h1 className="relative mt-4 text-xl font-bold text-foreground sm:text-2xl">
        This page buzzed off.
      </h1>
      <p className="relative mt-2 max-w-sm text-sm text-muted-foreground">
        Our bee couldn&apos;t find the page you&apos;re looking for. It might
        have been moved, renamed, or never existed in the hive.
      </p>

      <div className="relative mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild className="h-11 gap-2 rounded-full px-6">
          <Link href="/">
            <Home className="size-4" />
            Back to home
          </Link>
        </Button>
        <Button asChild variant="outline" className="h-11 gap-2 rounded-full px-6">
          <Link href="/#trending">
            <Search className="size-4" />
            Explore books
          </Link>
        </Button>
      </div>

      <div className="relative mt-10 flex items-center gap-2 text-xs text-muted-foreground">
        <BookOpen className="size-3.5" />
        Lost? Try our search — press Ctrl/Cmd + K on any page.
      </div>
    </div>
  );
}
