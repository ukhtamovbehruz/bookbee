"use client";

import Image from "next/image";
import { ChevronUp, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function MiniPlayer() {
  const { currentBook, currentChapter, setExpanded, closePlayer } = useAudioPlayer();

  if (!currentBook) return null;

  return (
    <div className="flex h-20 items-center gap-3 px-3 sm:px-4">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={`${currentBook.title} by ${currentBook.author} — expand player`}
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
          <Image
            src={currentBook.coverUrl}
            alt=""
            fill
            sizes="48px"
            className="object-cover"
          />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium">{currentBook.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            {currentBook.author}
            {currentChapter ? ` · ${currentChapter.title}` : ""}
          </p>
        </div>
      </button>

      <div className="hidden md:block flex-1 max-w-md">
        <ProgressBar />
      </div>

      <PlayerControls />

      <Button
        variant="ghost"
        size="icon"
        aria-label="Expand player"
        onClick={() => setExpanded(true)}
        className="hidden sm:inline-flex"
      >
        <ChevronUp className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Close player"
        onClick={closePlayer}
      >
        <X className="size-4" />
      </Button>
    </div>
  );
}
