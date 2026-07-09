"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { CommandShortcut } from "@/components/ui/command";

export function SearchTrigger() {
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        router.push("/search");
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <>
      <button
        type="button"
        onClick={() => router.push("/search")}
        aria-label="Search books, authors, or categories"
        className="glass hidden md:flex h-10 w-72 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="flex-1 truncate text-left">Search books, authors...</span>
        <CommandShortcut className="text-xs">Ctrl K</CommandShortcut>
      </button>

      <button
        type="button"
        onClick={() => router.push("/search")}
        aria-label="Open search"
        className="flex md:hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <Search className="size-5" />
      </button>
    </>
  );
}
