"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CoverField } from "@/components/admin/CoverField";
import { createCollection, saveCollectionEdit } from "@/lib/mock-data/curation";
import { getAllBooks } from "@/lib/mock-data/catalog";
import type { Collection } from "@/lib/types";
import { cn } from "@/lib/utils";

export function CollectionFormDialog({
  open,
  onOpenChange,
  collection,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collection: Collection | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [colorHex, setColorHex] = useState("#F4B400");
  const [coverUrl, setCoverUrl] = useState("");
  const [bookIds, setBookIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!open) return;
    if (collection) {
      setTitle(collection.title);
      setDescription(collection.description);
      setColorHex(collection.colorHex);
      setCoverUrl(collection.coverUrl ?? "");
      setBookIds(collection.bookIds);
    } else {
      // create mode — start from a blank collection
      setTitle("");
      setDescription("");
      setColorHex("#F4B400");
      setCoverUrl("");
      setBookIds([]);
    }
    setQuery("");
  }, [open, collection]);

  const allBooks = getAllBooks();
  const filtered = allBooks.filter((b) =>
    `${b.title} ${b.author}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  function toggleBook(id: string) {
    setBookIds((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id],
    );
  }

  function handleSave() {
    if (!title.trim()) {
      toast.error("Collection title is required.");
      return;
    }
    const payload = {
      title: title.trim(),
      description: description.trim(),
      colorHex,
      coverUrl: coverUrl.trim(),
      bookIds,
    };
    if (collection) {
      saveCollectionEdit(collection.id, payload);
      toast.success(`"${title}" was updated.`);
    } else {
      createCollection(payload);
      toast.success(`"${title}" was created.`);
    }
    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{collection ? "Edit collection" : "New collection"}</DialogTitle>
          <DialogDescription>
            {collection
              ? "Update the cover, details, and which books belong to this collection."
              : "Create a collection with a cover, details, and the books it features."}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cover</Label>
            <CoverField value={coverUrl} onChange={setCoverUrl} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-title">Title</Label>
            <Input id="cf-title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-desc">Description</Label>
            <Textarea id="cf-desc" rows={2} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="cf-color">Accent color</Label>
            <div className="flex items-center gap-2">
              <input
                id="cf-color"
                type="color"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
                className="size-9 cursor-pointer rounded-md border border-border bg-transparent"
              />
              <Input value={colorHex} onChange={(e) => setColorHex(e.target.value)} className="w-32" />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Books ({bookIds.length})</Label>
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search books to add..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="max-h-52 space-y-0.5 overflow-y-auto rounded-xl border border-border p-1">
              {filtered.slice(0, 40).map((b) => {
                const selected = bookIds.includes(b.id);
                return (
                  <button
                    key={b.id}
                    type="button"
                    onClick={() => toggleBook(b.id)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-2.5 py-2 text-left text-sm transition-colors",
                      selected ? "bg-primary/10" : "hover:bg-muted",
                    )}
                  >
                    <span className="min-w-0 truncate">
                      {b.title}
                      <span className="text-muted-foreground"> · {b.author}</span>
                    </span>
                    {selected && <Check className="size-4 shrink-0 text-primary" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            {collection ? "Save changes" : "Create collection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
