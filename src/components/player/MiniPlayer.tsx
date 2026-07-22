"use client";

import Image from "next/image";
import { ChevronUp, Megaphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { Equalizer } from "@/components/player/Equalizer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function MiniPlayer() {
  const { currentBook, currentChapter, isPlaying, isAdPlaying, setExpanded, closePlayer } =
    useAudioPlayer();

  if (!currentBook) return null;

  return (
    <div className="flex h-20 items-center gap-3 px-3 sm:px-4">
      <button
        type="button"
        onClick={() => setExpanded(true)}
        aria-label={
          isAdPlaying
            ? "Advertisement — expand player"
            : `${currentBook.title} by ${currentBook.author} — expand player`
        }
        className="flex min-w-0 flex-1 items-center gap-3 text-left"
      >
        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg">
          {isAdPlaying ? (
            <div className="flex size-full items-center justify-center bg-primary/15 text-primary">
              <Megaphone className="size-5" />
            </div>
          ) : (
            <Image
              src={currentBook.coverUrl}
              alt=""
              fill
              sizes="48px"
              className="object-cover"
            />
          )}
          <div className="absolute inset-0 flex items-end justify-center bg-gradient-to-t from-black/60 to-transparent pb-1">
            <Equalizer playing={isPlaying} className="h-3" />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          {isAdPlaying ? (
            <>
              <p className="truncate text-sm font-medium">Advertisement</p>
              <p className="truncate text-xs text-muted-foreground">
                Your book resumes right after this
              </p>
            </>
          ) : (
            <>
              <p className="truncate text-sm font-medium">{currentBook.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {currentBook.author}
                {currentChapter ? ` · ${currentChapter.title}` : ""}
              </p>
            </>
          )}
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
