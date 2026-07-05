"use client";

import { useState } from "react";
import { Bookmark, Heart, Library, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function BookActions({ book }: { book: Book }) {
  const [inLibrary, setInLibrary] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (navigator.share) {
      try {
        await navigator.share({ title: book.title, text: book.author, url });
      } catch {
        // user cancelled the native share sheet
      }
      return;
    }
    if (navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success("Link copied to clipboard");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button
        variant={inLibrary ? "secondary" : "outline"}
        className="gap-2"
        onClick={() => {
          setInLibrary((v) => !v);
          toast.success(
            inLibrary ? `Removed "${book.title}" from your library` : `Added "${book.title}" to your library`,
          );
        }}
      >
        <Library className="size-4" />
        {inLibrary ? "In Library" : "Add to Library"}
      </Button>

      <Button
        variant="outline"
        size="icon"
        aria-label={bookmarked ? "Remove bookmark" : "Bookmark"}
        aria-pressed={bookmarked}
        onClick={() => setBookmarked((v) => !v)}
      >
        <Bookmark className={cn("size-4", bookmarked && "fill-primary text-primary")} />
      </Button>

      <Button
        variant="outline"
        size="icon"
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        aria-pressed={favorited}
        onClick={() => setFavorited((v) => !v)}
      >
        <Heart className={cn("size-4", favorited && "fill-destructive text-destructive")} />
      </Button>

      <Button variant="outline" size="icon" aria-label="Share" onClick={handleShare}>
        <Share2 className="size-4" />
      </Button>
    </div>
  );
}
