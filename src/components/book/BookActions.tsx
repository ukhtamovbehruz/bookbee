"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Award, Bookmark, GraduationCap, Heart, Library, Share2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import {
  addToLibrary,
  getLibraryEntry,
  removeFromLibrary,
} from "@/lib/library";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function BookActions({ book }: { book: Book }) {
  const { user } = useAuth();
  const router = useRouter();
  const [inLibrary, setInLibrary] = useState(false);
  const [finished, setFinished] = useState(false);
  const [bookmarked, setBookmarked] = useState(false);
  const [favorited, setFavorited] = useState(false);

  useEffect(() => {
    const entry = getLibraryEntry(book.id);
    setInLibrary(Boolean(entry));
    setFinished(Boolean(entry?.certificateEarned));
  }, [book.id]);

  function handleToggleLibrary() {
    if (!user) {
      toast.warning("Sign up free to build your library.");
      router.push("/signup");
      return;
    }
    if (inLibrary) {
      removeFromLibrary(book.id);
      setInLibrary(false);
      toast.info(`Removed "${book.title}" from your library.`);
    } else {
      addToLibrary(book.id);
      setInLibrary(true);
      toast.success(`Added "${book.title}" to your library.`);
    }
  }

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
        onClick={handleToggleLibrary}
      >
        <Library className="size-4" />
        {inLibrary ? "In Library" : "Add to Library"}
      </Button>

      {inLibrary &&
        (finished ? (
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/book/${book.id}/certificate`}>
              <Award className="size-4 text-primary" />
              View Certificate
            </Link>
          </Button>
        ) : (
          <Button variant="outline" className="gap-2" asChild>
            <Link href={`/book/${book.id}/quiz`}>
              <GraduationCap className="size-4" />
              Mark as Finished
            </Link>
          </Button>
        ))}

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
