"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CategoryMultiSelect } from "@/components/admin/CategoryMultiSelect";
import { CoverField } from "@/components/admin/CoverField";
import { GenresField } from "@/components/admin/GenresField";
import { ChaptersEditor } from "@/components/admin/ChaptersEditor";
import { addCustomBook } from "@/lib/mock-data/custom-books";
import { saveBookEdit } from "@/lib/mock-data/catalog";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";
import type { Book, BookLanguage, Chapter } from "@/lib/types";

interface FormState {
  title: string;
  author: string;
  narrator: string;
  publisher: string;
  description: string;
  coverUrl: string;
  categoryIds: string[];
  language: BookLanguage;
  isPremium: boolean;
  tags: string[];
  chapters: Chapter[];
}

function defaultChapters(): Chapter[] {
  return [
    { id: "new-ch-1", index: 1, title: "Introduction", durationSec: 20 * 60, audioUrl: SAMPLE_AUDIO_URLS[0] },
  ];
}

function emptyState(): FormState {
  return {
    title: "",
    author: "",
    narrator: "",
    publisher: "",
    description: "",
    coverUrl: "",
    categoryIds: [],
    language: "en",
    isPremium: false,
    tags: [],
    chapters: defaultChapters(),
  };
}

export function BookFormDialog({
  open,
  onOpenChange,
  book,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  book?: Book;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyState);
  const isEdit = Boolean(book);

  useEffect(() => {
    if (!open) return;
    if (book) {
      setForm({
        title: book.title,
        author: book.author,
        narrator: book.narrator,
        publisher: book.publisher,
        description: book.description,
        coverUrl: book.coverUrl,
        categoryIds: book.categoryIds,
        language: book.language,
        isPremium: book.isPremium,
        tags: book.tags ?? [],
        chapters: book.chapters.length > 0 ? book.chapters : defaultChapters(),
      });
    } else {
      setForm(emptyState());
    }
  }, [open, book]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave() {
    if (!form.title.trim() || !form.author.trim()) {
      toast.error("Title and author are required.");
      return;
    }
    if (form.categoryIds.length === 0) {
      toast.error("Pick at least one category.");
      return;
    }
    if (form.chapters.length === 0 || form.chapters.some((c) => !c.audioUrl)) {
      toast.error("Every chapter needs an audio URL or uploaded file.");
      return;
    }

    // Re-key chapters so ids/indexes are consistent for the saved book.
    const chapters = form.chapters.map((c, i) => ({
      ...c,
      index: i + 1,
      title: c.title.trim() || `Chapter ${i + 1}`,
    }));
    const durationSec = chapters.reduce((sum, c) => sum + c.durationSec, 0);

    try {
      if (isEdit && book) {
        await saveBookEdit(book.id, {
          title: form.title.trim(),
          author: form.author.trim(),
          narrator: form.narrator.trim() || form.author.trim(),
          publisher: form.publisher.trim() || "BookBee Originals",
          description: form.description.trim(),
          coverUrl: form.coverUrl.trim(),
          categoryIds: form.categoryIds,
          language: form.language,
          durationSec,
          isPremium: form.isPremium,
          tags: form.tags,
          chapters: chapters.map((c, i) => ({ ...c, id: `${book.id}-ch-${i + 1}` })),
        });
        toast.success(`"${form.title}" was updated.`);
      } else {
        await addCustomBook({
          title: form.title.trim(),
          author: form.author.trim(),
          narrator: form.narrator.trim(),
          publisher: form.publisher.trim(),
          description: form.description.trim(),
          categoryIds: form.categoryIds,
          language: form.language,
          durationSec,
          isPremium: form.isPremium,
          coverUrl: form.coverUrl.trim(),
          tags: form.tags,
          chapters,
        });
        toast.success(`"${form.title}" was added to the library.`);
      }
    } catch {
      toast.error("Couldn't save — check your connection and try again.");
      return;
    }

    onSaved();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit book" : "Add a new book"}</DialogTitle>
          <DialogDescription>
            Changes are saved instantly and reflected across the whole site.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Cover</Label>
            <CoverField value={form.coverUrl} onChange={(v) => set("coverUrl", v)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="bf-title">Title</Label>
              <Input id="bf-title" value={form.title} onChange={(e) => set("title", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-author">Author</Label>
              <Input id="bf-author" value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-narrator">Narrator</Label>
              <Input id="bf-narrator" value={form.narrator} onChange={(e) => set("narrator", e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="bf-publisher">Publisher</Label>
              <Input id="bf-publisher" value={form.publisher} onChange={(e) => set("publisher", e.target.value)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bf-desc">Description</Label>
            <Textarea id="bf-desc" rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
          </div>

          <div className="space-y-1.5">
            <Label>Categories</Label>
            <CategoryMultiSelect value={form.categoryIds} onChange={(v) => set("categoryIds", v)} />
          </div>

          <div className="space-y-1.5">
            <Label>Genres</Label>
            <GenresField value={form.tags} onChange={(v) => set("tags", v)} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Language</Label>
              <Select value={form.language} onValueChange={(v) => set("language", v as BookLanguage)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uz">Uzbek</SelectItem>
                  <SelectItem value="ru">Russian</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end gap-2 pb-2">
              <Checkbox
                id="bf-premium"
                checked={form.isPremium}
                onCheckedChange={(c) => set("isPremium", c === true)}
              />
              <Label htmlFor="bf-premium" className="font-normal">
                Premium-only title
              </Label>
            </div>
          </div>

          <ChaptersEditor chapters={form.chapters} onChange={(v) => set("chapters", v)} />
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>{isEdit ? "Save changes" : "Add book"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
