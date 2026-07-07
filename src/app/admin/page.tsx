"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { LogOut, Plus, Shield, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
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
import { useAdminSession } from "@/hooks/useAdminSession";
import { categories } from "@/lib/mock-data/categories";
import {
  addCustomBook,
  getCustomBooks,
  removeCustomBook,
} from "@/lib/mock-data/custom-books";
import type { Book, BookLanguage } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

export default function AdminDashboardPage() {
  const { isAdmin, isReady, logout } = useAdminSession();
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [language, setLanguage] = useState<BookLanguage>("en");

  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/admin/login");
  }, [isReady, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) setBooks(getCustomBooks());
  }, [isAdmin]);

  if (!isReady || !isAdmin) return null;

  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-white/5 px-4 py-4 sm:px-6">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="size-5 text-primary" />
            <span className="font-semibold">BookBee Admin</span>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/">Back to site</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="gap-1.5"
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
            >
              <LogOut className="size-4" />
              Log out
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <h1 className="text-2xl font-bold tracking-tight">Add a new book</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          New books appear immediately in New Releases and are viewable across
          the site.
        </p>

        <form
          className="glass mt-6 grid grid-cols-1 gap-4 rounded-2xl p-6 sm:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const form = new FormData(e.currentTarget);
            const title = String(form.get("title") ?? "").trim();
            const author = String(form.get("author") ?? "").trim();

            if (!title || !author) {
              toast.error("Title and author are required.");
              return;
            }
            if (selectedCategories.length === 0) {
              toast.error("Pick at least one category.");
              return;
            }

            const book = addCustomBook({
              title,
              author,
              narrator: String(form.get("narrator") ?? "").trim(),
              publisher: String(form.get("publisher") ?? "").trim(),
              description: String(form.get("description") ?? "").trim(),
              categoryIds: selectedCategories,
              language,
              hours: Number(form.get("hours") ?? 5),
              isPremium: form.get("isPremium") === "on",
              coverUrl: String(form.get("coverUrl") ?? "").trim(),
            });

            setBooks(getCustomBooks());
            toast.success(`"${book.title}" was added to the library.`);
            e.currentTarget.reset();
            setSelectedCategories([]);
            setLanguage("en");
          }}
        >
          <div className="space-y-1.5">
            <Label htmlFor="title">Title</Label>
            <Input id="title" name="title" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="author">Author</Label>
            <Input id="author" name="author" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="narrator">Narrator</Label>
            <Input id="narrator" name="narrator" placeholder="Same as author if blank" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="publisher">Publisher</Label>
            <Input id="publisher" name="publisher" placeholder="BookBee Originals" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="hours">Length (hours)</Label>
            <Input id="hours" name="hours" type="number" min={0.5} step={0.1} defaultValue={5} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="coverUrl">Cover image URL (optional)</Label>
            <Input id="coverUrl" name="coverUrl" placeholder="https://..." />
          </div>
          <div className="space-y-1.5">
            <Label>Language</Label>
            <Select value={language} onValueChange={(v) => setLanguage(v as BookLanguage)}>
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
          <div className="flex items-end gap-2 pb-1">
            <Checkbox
              id="isPremium"
              name="isPremium"
              onCheckedChange={() => {}}
            />
            <Label htmlFor="isPremium" className="font-normal">
              Premium-only title
            </Label>
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" rows={3} required />
          </div>

          <div className="space-y-2 sm:col-span-2">
            <Label>Categories</Label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2 text-sm text-muted-foreground"
                >
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={selectedCategories.includes(category.id)}
                    onCheckedChange={(checked) => {
                      setSelectedCategories((prev) =>
                        checked
                          ? [...prev, category.id]
                          : prev.filter((id) => id !== category.id),
                      );
                    }}
                  />
                  {category.name}
                </label>
              ))}
            </div>
          </div>

          <div className="sm:col-span-2">
            <Button type="submit" className="h-11 gap-2 rounded-full">
              <Plus className="size-4" />
              Add book
            </Button>
          </div>
        </form>

        <h2 className="mt-12 text-xl font-bold tracking-tight">
          Admin-added books ({books.length})
        </h2>
        <div className="mt-4 space-y-2">
          {books.length === 0 && (
            <p className="text-sm text-muted-foreground">
              No books added yet — use the form above.
            </p>
          )}
          {books.map((book) => (
            <div
              key={book.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-white/5 px-4 py-3"
            >
              <div className="min-w-0">
                <Link href={`/book/${book.id}`} className="font-medium hover:underline">
                  {book.title}
                </Link>
                <p className="truncate text-xs text-muted-foreground">
                  {book.author} · {formatDuration(book.durationSec)}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label={`Remove ${book.title}`}
                onClick={() => {
                  removeCustomBook(book.id);
                  setBooks(getCustomBooks());
                  toast.info(`Removed "${book.title}".`);
                }}
              >
                <Trash2 className="size-4 text-destructive" />
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
