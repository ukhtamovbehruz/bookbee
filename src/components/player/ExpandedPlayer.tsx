"use client";

import Image from "next/image";
import Link from "next/link";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PlayerControls } from "@/components/player/PlayerControls";
import { ProgressBar } from "@/components/player/ProgressBar";
import { VolumeControl } from "@/components/player/VolumeControl";
import { SpeedControl } from "@/components/player/SpeedControl";
import { Equalizer } from "@/components/player/Equalizer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { cn } from "@/lib/utils";

export function ExpandedPlayer() {
  const { currentBook, currentChapter, isPlaying, setExpanded, closePlayer } =
    useAudioPlayer();

  if (!currentBook) return null;

  return (
    <div className="flex flex-col gap-6 px-4 py-6 sm:px-8 sm:py-8">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          aria-label="Collapse player"
          onClick={() => setExpanded(false)}
        >
          <ChevronDown className="size-5" />
        </Button>
        <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Now Playing
        </span>
        <Button
          variant="ghost"
          size="icon"
          aria-label="Close player"
          onClick={closePlayer}
        >
          <X className="size-5" />
        </Button>
      </div>

      <div className="mx-auto flex w-full max-w-md flex-col items-center gap-6 text-center">
        <div
          className={cn(
            "relative aspect-2/3 w-48 sm:w-56 shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 transition-transform",
            isPlaying ? "now-playing-glow scale-100" : "scale-[0.98]",
          )}
        >
          <Image
            src={currentBook.coverUrl}
            alt=""
            fill
            sizes="224px"
            className="object-cover"
            priority
          />
        </div>
        <div>
          <div className="flex items-center justify-center gap-2">
            <Link
              href={`/book/${currentBook.id}`}
              onClick={() => setExpanded(false)}
              className="text-lg font-semibold hover:underline"
            >
              {currentBook.title}
            </Link>
            <Equalizer playing={isPlaying} className="h-3.5" />
          </div>
          <p className="text-sm text-muted-foreground">{currentBook.author}</p>
          {currentChapter && (
            <p className="mt-1 text-xs text-muted-foreground">
              {currentChapter.title}
            </p>
          )}
        </div>

        <div className="w-full space-y-4">
          <ProgressBar />
          <PlayerControls size="lg" />
          <div className="flex items-center justify-center gap-4">
            <VolumeControl />
            <SpeedControl />
          </div>
        </div>
      </div>
    </div>
  );
}
