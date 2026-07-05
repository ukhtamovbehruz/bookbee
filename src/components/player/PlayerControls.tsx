"use client";

import { Pause, Play, RotateCcw, RotateCw, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { SKIP_BACKWARD_SEC, SKIP_FORWARD_SEC } from "@/lib/constants";
import { cn } from "@/lib/utils";

export function PlayerControls({ size = "default" }: { size?: "default" | "lg" }) {
  const {
    isPlaying,
    isLoading,
    togglePlayPause,
    previousChapter,
    nextChapter,
    skipBackward,
    skipForward,
  } = useAudioPlayer();

  const playSize = size === "lg" ? "size-14" : "size-9";
  const playIconSize = size === "lg" ? "size-6" : "size-4";

  return (
    <div className="flex items-center gap-1 sm:gap-2">
      <Button
        variant="ghost"
        size="icon"
        aria-label="Previous chapter"
        onClick={previousChapter}
        className="hidden sm:inline-flex"
      >
        <SkipBack className="size-4 fill-current" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Back ${SKIP_BACKWARD_SEC} seconds`}
        onClick={() => skipBackward()}
      >
        <RotateCcw className="size-4" />
      </Button>
      <Button
        variant="default"
        size="icon"
        aria-label={isPlaying ? "Pause" : "Play"}
        onClick={togglePlayPause}
        disabled={isLoading}
        className={cn(
          "rounded-full shadow-lg shadow-primary/30",
          playSize,
        )}
      >
        {isPlaying ? (
          <Pause className={cn(playIconSize, "fill-current")} />
        ) : (
          <Play className={cn(playIconSize, "fill-current ml-0.5")} />
        )}
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label={`Forward ${SKIP_FORWARD_SEC} seconds`}
        onClick={() => skipForward()}
      >
        <RotateCw className="size-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        aria-label="Next chapter"
        onClick={nextChapter}
        className="hidden sm:inline-flex"
      >
        <SkipForward className="size-4 fill-current" />
      </Button>
    </div>
  );
}
