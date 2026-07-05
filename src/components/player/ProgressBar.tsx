"use client";

import { Slider } from "@/components/ui/slider";
import { formatClock } from "@/lib/utils";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function ProgressBar({ compact = false }: { compact?: boolean }) {
  const { currentTime, duration, seekTo } = useAudioPlayer();

  return (
    <div className="flex w-full items-center gap-2">
      {!compact && (
        <span className="w-10 shrink-0 text-right text-xs tabular-nums text-muted-foreground">
          {formatClock(currentTime)}
        </span>
      )}
      <Slider
        value={[currentTime]}
        min={0}
        max={Math.max(duration, 1)}
        step={1}
        onValueChange={([v]) => seekTo(v)}
        aria-label="Seek"
        className="flex-1"
      />
      {!compact && (
        <span className="w-10 shrink-0 text-xs tabular-nums text-muted-foreground">
          {formatClock(duration)}
        </span>
      )}
    </div>
  );
}
