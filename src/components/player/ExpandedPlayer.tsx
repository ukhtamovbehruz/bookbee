"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Popover as PopoverPrimitive } from "radix-ui";
import {
  ChevronDown,
  ListMusic,
  Megaphone,
  Pause,
  Play,
  RotateCcw,
  RotateCw,
  Share,
  Timer,
  Volume1,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Slider } from "@/components/ui/slider";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Equalizer } from "@/components/player/Equalizer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { PLAYBACK_SPEEDS } from "@/lib/constants";
import { cn, formatClock } from "@/lib/utils";

const SLEEP_OPTIONS = [5, 10, 15, 30, 45, 60];
const SKIP_SEC = 10;

export function ExpandedPlayer() {
  const {
    currentBook,
    currentChapter,
    isPlaying,
    isLoading,
    isAdPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    playBook,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setExpanded,
    sleepTimerMinutes,
    setSleepTimer,
  } = useAudioPlayer();

  const [queueOpen, setQueueOpen] = useState(false);

  if (!currentBook) return null;

  const VolumeIcon =
    isMuted || volume === 0 ? VolumeX : volume < 0.5 ? Volume1 : Volume2;

  async function handleShare() {
    if (!currentBook) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/book/${currentBook.id}`
        : "";
    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({
          title: currentBook.title,
          text: `Listen to ${currentBook.title} by ${currentBook.author} on BookBee`,
          url,
        });
      } else if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(url);
        toast.success("Link copied to clipboard");
      }
    } catch {
      // Share sheet dismissed — nothing to do.
    }
  }

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden text-white">
      {/* Blurred cover backdrop — auto-matches the artwork's colours. */}
      <div aria-hidden="true" className="absolute inset-0 -z-10">
        <Image
          src={currentBook.coverUrl}
          alt=""
          fill
          sizes="100vw"
          priority
          className="scale-125 object-cover blur-3xl"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black/85" />
      </div>

      {/* Top bar */}
      <div className="flex items-center justify-between p-4 sm:p-6">
        <button
          type="button"
          onClick={() => setExpanded(false)}
          aria-label="Collapse player"
          className="grid size-10 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white/20"
        >
          <ChevronDown className="size-5" />
        </button>
        <span className="text-[11px] font-medium uppercase tracking-[0.2em] text-white/60">
          Now Playing
        </span>
        <div className="size-10" />
      </div>

      {/* Center: cover + titles + progress */}
      <div className="flex flex-1 flex-col items-center justify-center gap-7 px-6 pb-4">
        <div
          className={cn(
            "relative aspect-2/3 w-40 shrink-0 overflow-hidden rounded-2xl shadow-2xl shadow-black/60 transition-transform duration-500 sm:w-52",
            isPlaying ? "scale-100" : "scale-[0.97]",
          )}
        >
          {isAdPlaying ? (
            <div className="flex size-full items-center justify-center bg-primary/20">
              <Megaphone className="size-12 text-primary" />
            </div>
          ) : (
            <Image
              src={currentBook.coverUrl}
              alt=""
              fill
              sizes="208px"
              priority
              className="object-cover"
            />
          )}
        </div>

        <div className="w-full max-w-xl text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
              {isAdPlaying ? "Advertisement" : (currentChapter?.title ?? currentBook.title)}
            </h2>
            <Equalizer playing={isPlaying} className="h-4 shrink-0" />
          </div>
          {isAdPlaying ? (
            <p className="mt-1.5 text-sm text-white/70 sm:text-base">
              Your book resumes right after this
            </p>
          ) : (
            <Link
              href={`/book/${currentBook.id}`}
              onClick={() => setExpanded(false)}
              className="mt-1.5 inline-block text-sm text-white/70 transition-colors hover:text-white sm:text-base"
            >
              {currentBook.title} • {currentBook.author}
            </Link>
          )}
        </div>

        {/* Progress */}
        <div className="flex w-full max-w-2xl items-center gap-3 text-xs tabular-nums text-white/70">
          <span className="w-12 shrink-0 text-right">
            {formatClock(currentTime)}
          </span>
          <Slider
            value={[currentTime]}
            min={0}
            max={Math.max(duration, 1)}
            step={1}
            onValueChange={([v]) => seekTo(v)}
            aria-label="Seek"
            className="flex-1 [&_[data-slot=slider-range]]:bg-white [&_[data-slot=slider-thumb]]:border-white [&_[data-slot=slider-track]]:bg-white/25"
          />
          <span className="w-12 shrink-0">{formatClock(duration)}</span>
        </div>
      </div>

      {/* Bottom controls */}
      <div className="mx-auto grid w-full max-w-3xl grid-cols-3 items-center gap-2 px-4 pb-10 sm:px-8 sm:pb-14">
        {/* Left: volume */}
        <div className="flex items-center justify-start">
          <PopoverPrimitive.Root>
            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                aria-label="Volume"
                className="grid size-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                <VolumeIcon className="size-6" />
              </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                side="top"
                sideOffset={12}
                className="z-[70] rounded-xl bg-popover p-3 text-popover-foreground shadow-lg ring-1 ring-foreground/10"
              >
                <div className="flex w-44 items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    aria-label={isMuted ? "Unmute" : "Mute"}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <VolumeIcon className="size-4" />
                  </button>
                  <Slider
                    value={[isMuted ? 0 : Math.round(volume * 100)]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={([v]) => setVolume(v / 100)}
                    aria-label="Volume level"
                  />
                </div>
                <PopoverPrimitive.Arrow className="fill-popover" />
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>

        {/* Center: speed · −10 · play · +10 · sleep */}
        <div className="flex items-center justify-center gap-1 sm:gap-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Playback speed"
                className="min-w-12 rounded-full px-2 py-1 text-sm font-semibold tabular-nums text-white/85 transition hover:bg-white/10 hover:text-white"
              >
                {playbackRate}x
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="z-[70] min-w-28">
              {PLAYBACK_SPEEDS.map((speed) => (
                <DropdownMenuItem
                  key={speed}
                  onSelect={() => setPlaybackRate(speed)}
                >
                  {speed}x{speed === 1 ? " (Normal)" : ""}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            type="button"
            onClick={() => skipBackward(SKIP_SEC)}
            aria-label={`Back ${SKIP_SEC} seconds`}
            className="relative grid size-11 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
          >
            <RotateCcw className="size-7" />
            <span className="absolute text-[9px] font-bold">{SKIP_SEC}</span>
          </button>

          <button
            type="button"
            onClick={togglePlayPause}
            disabled={isLoading}
            aria-label={isPlaying ? "Pause" : "Play"}
            className="grid size-16 place-items-center rounded-full bg-white text-black shadow-xl transition hover:scale-105 disabled:opacity-70"
          >
            {isPlaying ? (
              <Pause className="size-7 fill-current" />
            ) : (
              <Play className="size-7 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={() => skipForward(SKIP_SEC)}
            aria-label={`Forward ${SKIP_SEC} seconds`}
            className="relative grid size-11 place-items-center rounded-full text-white/90 transition hover:bg-white/10"
          >
            <RotateCw className="size-7" />
            <span className="absolute text-[9px] font-bold">{SKIP_SEC}</span>
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                aria-label="Sleep timer"
                className={cn(
                  "relative grid size-11 place-items-center rounded-full transition hover:bg-white/10",
                  sleepTimerMinutes ? "text-primary" : "text-white/85 hover:text-white",
                )}
              >
                <Timer className="size-6" />
                {sleepTimerMinutes ? (
                  <span className="absolute -bottom-1 rounded-full bg-primary px-1 text-[9px] font-bold leading-tight text-primary-foreground">
                    {sleepTimerMinutes}
                  </span>
                ) : null}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" className="z-[70] min-w-36">
              <DropdownMenuLabel>Sleep timer</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={() => setSleepTimer(null)}>
                Off
              </DropdownMenuItem>
              {SLEEP_OPTIONS.map((min) => (
                <DropdownMenuItem
                  key={min}
                  onSelect={() => {
                    setSleepTimer(min);
                    toast.success(`Sleep timer set — pausing in ${min} min`);
                  }}
                >
                  {min} minutes
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Right: queue · share */}
        <div className="flex items-center justify-end gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setQueueOpen(true)}
            aria-label="Chapters"
            className="grid size-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <ListMusic className="size-6" />
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="grid size-11 place-items-center rounded-full text-white/85 transition hover:bg-white/10 hover:text-white"
          >
            <Share className="size-5" />
          </button>
        </div>
      </div>

      {/* Chapters / queue panel */}
      <AnimatePresence>
        {queueOpen && (
          <>
            <motion.button
              type="button"
              aria-label="Close chapters"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setQueueOpen(false)}
              className="absolute inset-0 z-20 cursor-default bg-black/40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 320, damping: 34 }}
              className="absolute inset-y-0 right-0 z-30 flex w-full max-w-md flex-col bg-black/80 backdrop-blur-xl"
            >
              <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Chapters</p>
                  <p className="truncate text-xs text-white/60">
                    {currentBook.title}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setQueueOpen(false)}
                  aria-label="Close"
                  className="grid size-9 place-items-center rounded-full text-white/80 transition hover:bg-white/10"
                >
                  <X className="size-5" />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto py-1">
                {currentBook.chapters.map((ch) => {
                  const isActive = currentChapter?.id === ch.id;
                  return (
                    <button
                      key={ch.id}
                      type="button"
                      onClick={() => {
                        playBook(currentBook, ch.id);
                        setQueueOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-white/10",
                        isActive && "bg-white/10",
                      )}
                    >
                      <span className="w-6 shrink-0 text-xs tabular-nums text-white/50">
                        {ch.index}
                      </span>
                      <span
                        className={cn(
                          "flex-1 truncate text-sm",
                          isActive ? "font-semibold text-primary" : "text-white/90",
                        )}
                      >
                        {ch.title}
                      </span>
                      {isActive ? (
                        <Equalizer playing={isPlaying} className="h-3 shrink-0" />
                      ) : (
                        <span className="shrink-0 text-xs tabular-nums text-white/50">
                          {formatClock(ch.durationSec)}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
