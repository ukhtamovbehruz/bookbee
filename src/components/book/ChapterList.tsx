"use client";

import { Pause, Play } from "lucide-react";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { formatDuration } from "@/lib/utils";
import type { Book } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ChapterList({ book }: { book: Book }) {
  const { currentBook, currentChapter, isPlaying, playBook, togglePlayPause } =
    useAudioPlayer();

  return (
    <ol className="divide-y divide-white/5 overflow-hidden rounded-2xl border border-white/5">
      {book.chapters.map((chapter) => {
        const isActive = currentBook?.id === book.id && currentChapter?.id === chapter.id;
        const isActivePlaying = isActive && isPlaying;

        return (
          <li key={chapter.id}>
            <button
              type="button"
              onClick={() => {
                if (isActive) {
                  togglePlayPause();
                } else {
                  playBook(book, chapter.id);
                }
              }}
              className={cn(
                "flex w-full items-center gap-4 px-4 py-3 text-left transition-colors hover:bg-white/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset",
                isActive && "bg-white/5",
              )}
            >
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-full border border-white/10 text-xs tabular-nums text-muted-foreground",
                  isActive && "border-primary text-primary",
                )}
              >
                {isActivePlaying ? (
                  <Pause className="size-3.5 fill-current" />
                ) : isActive ? (
                  <Play className="size-3.5 fill-current ml-0.5" />
                ) : (
                  chapter.index
                )}
              </span>
              <span
                className={cn(
                  "flex-1 truncate text-sm",
                  isActive ? "font-medium text-primary" : "text-foreground",
                )}
              >
                {chapter.title}
              </span>
              <span className="shrink-0 text-xs text-muted-foreground">
                {formatDuration(chapter.durationSec)}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
