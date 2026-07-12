"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, Search, X } from "lucide-react";
import { BookCard } from "@/components/book/BookCard";
import { books } from "@/lib/mock-data/books";
import { getAllBooks, onCatalogChanged } from "@/lib/mock-data/catalog";
import { categories, getCategoryById } from "@/lib/mock-data/categories";
import { filterBooks } from "@/lib/search";
import { cn } from "@/lib/utils";
import type { Book, BookLanguage } from "@/lib/types";

type FilterKey = "categories" | "authors" | "narrators" | "publishers" | "languages";

const EMPTY_FILTERS: Record<FilterKey, string[]> = {
  categories: [],
  authors: [],
  narrators: [],
  publishers: [],
  languages: [],
};

const LANGUAGE_ORDER: BookLanguage[] = ["en", "uz", "ru"];
const LANGUAGE_LABELS: Record<BookLanguage, string> = {
  en: "English",
  uz: "O‘zbekcha",
  ru: "Русский",
};

function unique(values: string[]): string[] {
  return [...new Set(values)].sort((a, b) => a.localeCompare(b));
}

function FilterGroup({
  label,
  options,
  selected,
  onToggle,
  renderLabel,
}: {
  label: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
  renderLabel?: (value: string) => string;
}) {
  const [open, setOpen] = useState(false);
  if (options.length === 0) return null;

  return (
    <div className="hairline-b py-3 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-left"
      >
        <span className="font-semibold">
          {label}
          {selected.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              {selected.length}
            </span>
          )}
        </span>
        <span className="flex items-center gap-1 text-sm text-primary">
          {open ? "Close" : "Open"}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </span>
      </button>

      {open && (
        <div className="mt-3 max-h-56 space-y-1.5 overflow-y-auto pr-1">
          {options.map((value) => (
            <label
              key={value}
              className="flex cursor-pointer items-center gap-2.5 rounded-lg px-1 py-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
                className="size-4 accent-[var(--primary)]"
              />
              <span className="truncate">{renderLabel ? renderLabel(value) : value}</span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  const [catalog, setCatalog] = useState<Book[]>(books);
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Record<FilterKey, string[]>>(EMPTY_FILTERS);

  useEffect(() => {
    const refresh = () => setCatalog(getAllBooks());
    refresh();
    return onCatalogChanged(refresh);
  }, []);

  const options = useMemo(
    () => ({
      categories: categories
        .filter((c) => catalog.some((b) => b.categoryIds.includes(c.id)))
        .map((c) => c.id),
      authors: unique(catalog.map((b) => b.author)),
      narrators: unique(catalog.map((b) => b.narrator)),
      publishers: unique(catalog.map((b) => b.publisher)),
      languages: LANGUAGE_ORDER.filter((code) => catalog.some((b) => b.language === code)),
    }),
    [catalog],
  );

  function toggle(key: FilterKey, value: string) {
    setFilters((prev) => {
      const has = prev[key].includes(value);
      return {
        ...prev,
        [key]: has ? prev[key].filter((v) => v !== value) : [...prev[key], value],
      };
    });
  }

  const hasQuery = query.trim().length > 0;
  const hasFilters = Object.values(filters).some((arr) => arr.length > 0);

  const results = useMemo(() => {
    const base = hasQuery ? filterBooks(query, catalog) : catalog;
    return base.filter((book) => {
      if (filters.categories.length && !book.categoryIds.some((id) => filters.categories.includes(id)))
        return false;
      if (filters.authors.length && !filters.authors.includes(book.author)) return false;
      if (filters.narrators.length && !filters.narrators.includes(book.narrator)) return false;
      if (filters.publishers.length && !filters.publishers.includes(book.publisher)) return false;
      if (filters.languages.length && !filters.languages.includes(book.language)) return false;
      return true;
    });
  }, [catalog, query, filters, hasQuery]);

  const recommended = useMemo(
    () => [...catalog].sort((a, b) => b.listenerCount - a.listenerCount).slice(0, 12),
    [catalog],
  );

  const showResults = hasQuery || hasFilters;
  const grid = showResults ? results : recommended;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* search bar */}
      <div className="glass flex items-center gap-3 rounded-2xl px-5 py-4">
        <Search className="size-5 shrink-0 text-muted-foreground" />
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search for a book or author..."
          className="flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground"
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => setQuery("")}
            aria-label="Clear search"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-[280px_1fr]">
        {/* filters */}
        <aside className="glass h-fit rounded-2xl p-5 lg:sticky lg:top-24">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Filter</h2>
            {hasFilters && (
              <button
                type="button"
                onClick={() => setFilters(EMPTY_FILTERS)}
                className="text-sm font-medium text-primary hover:underline"
              >
                Clear filters
              </button>
            )}
          </div>

          <div className="mt-2">
            <FilterGroup
              label="Categories"
              options={options.categories}
              selected={filters.categories}
              onToggle={(v) => toggle("categories", v)}
              renderLabel={(id) => getCategoryById(id)?.name ?? id}
            />
            <FilterGroup
              label="Authors"
              options={options.authors}
              selected={filters.authors}
              onToggle={(v) => toggle("authors", v)}
            />
            <FilterGroup
              label="Narrators"
              options={options.narrators}
              selected={filters.narrators}
              onToggle={(v) => toggle("narrators", v)}
            />
            <FilterGroup
              label="Publishers"
              options={options.publishers}
              selected={filters.publishers}
              onToggle={(v) => toggle("publishers", v)}
            />
            <FilterGroup
              label="Language"
              options={options.languages}
              selected={filters.languages}
              onToggle={(v) => toggle("languages", v)}
              renderLabel={(code) => LANGUAGE_LABELS[code as BookLanguage] ?? code}
            />
          </div>
        </aside>

        {/* results / recommendations */}
        <div>
          <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
            {showResults ? "Results" : "Recommended for you"}
          </h1>

          {showResults && grid.length === 0 ? (
            <p className="mt-10 text-center text-muted-foreground">No books found.</p>
          ) : (
            <div className="mt-5 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 xl:grid-cols-4">
              {grid.map((book) => (
                <BookCard key={book.id} book={book} width="w-full" />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
