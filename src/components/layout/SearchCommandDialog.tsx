"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Search, Star } from "lucide-react";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "@/components/ui/command";
import { books } from "@/lib/mock-data/books";
import { categories } from "@/lib/mock-data/categories";
import { filterBooks } from "@/lib/search";

export function SearchCommandDialog() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  const results = useMemo(() => filterBooks(query, books).slice(0, 8), [query]);

  function goToBook(id: string) {
    setOpen(false);
    setQuery("");
    router.push(`/book/${id}`);
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Search books, authors, or categories"
        className="glass hidden md:flex h-10 w-72 items-center gap-2 rounded-full px-4 text-sm text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground"
      >
        <Search className="size-4" aria-hidden="true" />
        <span className="flex-1 text-left">Search books, authors...</span>
        <CommandShortcut className="text-xs">Ctrl K</CommandShortcut>
      </button>

      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open search"
        className="flex md:hidden size-9 items-center justify-center rounded-full text-muted-foreground hover:text-foreground"
      >
        <Search className="size-5" />
      </button>

      <CommandDialog
        open={open}
        onOpenChange={setOpen}
        title="Search BookBee"
        description="Search by title, author, category, or language"
      >
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Search by title, author, category, or language..."
            value={query}
            onValueChange={setQuery}
          />
          <CommandList>
            {query.trim() === "" ? (
              <CommandEmpty>Start typing to search the library.</CommandEmpty>
            ) : results.length === 0 ? (
              <CommandEmpty>No books found for &ldquo;{query}&rdquo;.</CommandEmpty>
            ) : (
              <CommandGroup heading="Books">
                {results.map((book) => (
                  <CommandItem
                    key={book.id}
                    value={book.id}
                    onSelect={() => goToBook(book.id)}
                    className="gap-3"
                  >
                    <div className="relative size-10 shrink-0 overflow-hidden rounded-md bg-muted">
                      <Image
                        src={book.coverUrl}
                        alt=""
                        fill
                        sizes="40px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex min-w-0 flex-1 flex-col">
                      <span className="truncate font-medium">{book.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {book.author} ·{" "}
                        {book.categoryIds
                          .map((id) => categories.find((c) => c.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                    <Star className="size-3.5 fill-primary text-primary" />
                    <span className="text-xs text-muted-foreground">
                      {book.rating.toFixed(1)}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  );
}
