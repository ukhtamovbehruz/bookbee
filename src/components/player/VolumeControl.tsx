"use client";

import { Volume2, Volume1, VolumeX } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function VolumeControl() {
  const { volume, isMuted, setVolume, toggleMute } = useAudioPlayer();

  const Icon = isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  return (
    <div className="hidden md:flex items-center gap-2 w-32">
      <Button
        variant="ghost"
        size="icon"
        aria-label={isMuted ? "Unmute" : "Mute"}
        onClick={toggleMute}
      >
        <Icon className="size-4" />
      </Button>
      <Slider
        value={[isMuted ? 0 : volume * 100]}
        min={0}
        max={100}
        step={1}
        onValueChange={([v]) => setVolume(v / 100)}
        aria-label="Volume"
      />
    </div>
  );
}
