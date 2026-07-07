"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { getUserRating, setUserRating } from "@/lib/ratings";
import { cn } from "@/lib/utils";
import type { Book } from "@/lib/types";

export function RatingWidget({
  book,
  onRated,
}: {
  book: Book;
  onRated?: () => void;
}) {
  const [userRating, setUserRatingState] = useState<number | undefined>(undefined);
  const [hovered, setHovered] = useState<number | null>(null);

  useEffect(() => {
    setUserRatingState(getUserRating(book.id));
  }, [book.id]);

  function handleRate(value: number) {
    setUserRating(book.id, value);
    setUserRatingState(value);
    onRated?.();

    if (value >= 4) {
      toast.success("Thanks for the great review!");
    } else if (value <= 2) {
      toast.warning("Thanks for your honest feedback.");
    } else {
      toast.info("Thanks for rating this book.");
    }
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = (hovered ?? userRating ?? 0) >= star;
          return (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHovered(star)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => handleRate(star)}
              aria-label={`Rate ${star} star${star > 1 ? "s" : ""}`}
              className="p-0.5"
            >
              <Star
                className={cn(
                  "size-5 transition-colors",
                  filled ? "fill-primary text-primary" : "text-muted-foreground",
                )}
              />
            </button>
          );
        })}
      </div>
      <span className="text-xs text-muted-foreground">
        {userRating
          ? `You rated this ${userRating} star${userRating > 1 ? "s" : ""}`
          : "Rate this book"}
      </span>
    </div>
  );
}
