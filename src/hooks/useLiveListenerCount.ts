"use client";

import { useEffect, useState } from "react";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { getPlayCount } from "@/lib/listeners";
import type { Book } from "@/lib/types";

export function useLiveListenerCount(book: Book): number {
  const { currentBook, isPlaying } = useAudioPlayer();
  const [playCount, setPlayCount] = useState(0);
  const [liveBoost, setLiveBoost] = useState(0);
  const isCurrentlyPlayingThis = currentBook?.id === book.id && isPlaying;

  useEffect(() => {
    setPlayCount(getPlayCount(book.id));
  }, [book.id, isCurrentlyPlayingThis]);

  useEffect(() => {
    if (!isCurrentlyPlayingThis) return;
    const interval = setInterval(() => {
      setLiveBoost((prev) => prev + Math.floor(Math.random() * 3) + 1);
    }, 5000);
    return () => clearInterval(interval);
  }, [isCurrentlyPlayingThis]);

  return book.listenerCount + playCount + liveBoost;
}
