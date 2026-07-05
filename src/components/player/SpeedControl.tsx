"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { PLAYBACK_SPEEDS } from "@/lib/constants";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function SpeedControl() {
  const { playbackRate, setPlaybackRate } = useAudioPlayer();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" aria-label="Playback speed" className="w-14 tabular-nums">
          {playbackRate}x
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {PLAYBACK_SPEEDS.map((speed) => (
          <DropdownMenuItem key={speed} onSelect={() => setPlaybackRate(speed)}>
            {speed}x{speed === 1 ? " (Normal)" : ""}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
