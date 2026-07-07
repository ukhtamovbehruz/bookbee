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
import { DurationInput } from "@/components/admin/DurationInput";
import { CoverField } from "@/components/admin/CoverField";
import { addCustomBook } from "@/lib/mock-data/custom-books";
import { saveBookEdit } from "@/lib/mock-data/catalog";
import type { Book, BookLanguage } from "@/lib/types";

interface FormState {
  title: string;
  author: string;
  narrator: string;
  publisher: string;
  description: string;
  coverUrl: string;
  categoryIds: string[];
  language: BookLanguage;
  durationSec: number;
  isPremium: boolean;
  audioUrl: string;
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
    durationSec: 5 * 3600,
    isPremium: false,
    audioUrl: "",
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
        durationSec: book.durationSec,
        isPremium: book.isPremium,
        audioUrl: book.audioSampleUrl,
      });
    } else {
      setForm(emptyState());
    }
  }, [open, book]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function handleSave() {
    if (!form.title.trim() || !form.author.trim()) {
      toast.error("Title and author are required.");
      return;
    }
    if (form.categoryIds.length === 0) {
      toast.error("Pick at least one category.");
      return;
    }

    if (isEdit && book) {
      saveBookEdit(book.id, {
        title: form.title.trim(),
        author: form.author.trim(),
        narrator: form.narrator.trim() || form.author.trim(),
        publisher: form.publisher.trim() || "BookBee Originals",
        description: form.description.trim(),
        coverUrl: form.coverUrl.trim(),
        categoryIds: form.categoryIds,
        language: form.language,
        durationSec: form.durationSec,
        isPremium: form.isPremium,
        audioUrl: form.audioUrl.trim() || undefined,
      });
      toast.success(`"${form.title}" was updated.`);
    } else {
      addCustomBook({
        title: form.title.trim(),
        author: form.author.trim(),
        narrator: form.narrator.trim(),
        publisher: form.publisher.trim(),
        description: form.description.trim(),
        categoryIds: form.categoryIds,
        language: form.language,
        durationSec: form.durationSec,
        isPremium: form.isPremium,
        coverUrl: form.coverUrl.trim(),
        audioUrl: form.audioUrl.trim(),
      });
      toast.success(`"${form.title}" was added to the library.`);
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

          <div className="space-y-1.5">
            <Label>Duration</Label>
            <DurationInput seconds={form.durationSec} onChange={(v) => set("durationSec", v)} />
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="bf-audio">Audio URL</Label>
            <Input
              id="bf-audio"
              placeholder="https://.../audio.mp3"
              value={form.audioUrl}
              onChange={(e) => set("audioUrl", e.target.value)}
            />
          </div>
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
