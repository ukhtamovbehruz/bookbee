"use client";

import { useState } from "react";
import { Check, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories } from "@/lib/mock-data/categories";
import { cn } from "@/lib/utils";

export function CategoryMultiSelect({
  value,
  onChange,
}: {
  value: string[];
  onChange: (next: string[]) => void;
}) {
  const [query, setQuery] = useState("");

  const filtered = categories.filter((c) =>
    c.name.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggle(id: string) {
    onChange(value.includes(id) ? value.filter((v) => v !== id) : [...value, id]);
  }

  return (
    <div className="space-y-2">
      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {value.map((id) => {
            const cat = categories.find((c) => c.id === id);
            if (!cat) return null;
            return (
              <span
                key={id}
                className="inline-flex items-center gap-1 rounded-full bg-primary/15 px-2.5 py-1 text-xs font-medium text-primary"
              >
                {cat.name}
                <button
                  type="button"
                  aria-label={`Remove ${cat.name}`}
                  onClick={() => toggle(id)}
                  className="hover:text-foreground"
                >
                  <X className="size-3" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search categories..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="max-h-40 space-y-0.5 overflow-y-auto rounded-xl border border-border p-1">
        {filtered.length === 0 && (
          <p className="px-2 py-3 text-center text-xs text-muted-foreground">
            No categories found.
          </p>
        )}
        {filtered.map((cat) => {
          const selected = value.includes(cat.id);
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggle(cat.id)}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                selected ? "bg-primary/10 text-foreground" : "hover:bg-muted",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className="size-2.5 rounded-full"
                  style={{ backgroundColor: cat.colorHex }}
                />
                {cat.name}
              </span>
              {selected && <Check className="size-4 text-primary" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}
