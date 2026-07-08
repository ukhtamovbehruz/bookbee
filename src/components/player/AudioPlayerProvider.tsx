"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { Book, Chapter } from "@/lib/types";
import { SKIP_BACKWARD_SEC, SKIP_FORWARD_SEC } from "@/lib/constants";
import { incrementPlayCount } from "@/lib/listeners";
import { recordListenSeconds } from "@/lib/activity";
import { resolveAudioSrc } from "@/lib/audio-store";

interface AudioPlayerContextValue {
  currentBook: Book | null;
  currentChapter: Chapter | null;
  isPlaying: boolean;
  isLoading: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackRate: number;
  isExpanded: boolean;
  playBook: (book: Book, chapterId?: string) => void;
  togglePlayPause: () => void;
  seekTo: (seconds: number) => void;
  skipForward: (seconds?: number) => void;
  skipBackward: (seconds?: number) => void;
  nextChapter: () => void;
  previousChapter: () => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setPlaybackRate: (rate: number) => void;
  setExpanded: (expanded: boolean) => void;
  closePlayer: () => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextValue | null>(null);

export function useAudioPlayer() {
  const ctx = useContext(AudioPlayerContext);
  if (!ctx) {
    throw new Error("useAudioPlayer must be used within AudioPlayerProvider");
  }
  return ctx;
}

export function AudioPlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [currentBook, setCurrentBook] = useState<Book | null>(null);
  const [currentChapter, setCurrentChapter] = useState<Chapter | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackRate, setPlaybackRateState] = useState(1);
  const [isExpanded, setIsExpanded] = useState(false);

  const playChapter = useCallback((book: Book, chapter: Chapter) => {
    const audio = audioRef.current;
    if (!audio) return;
    setCurrentBook(book);
    setCurrentChapter(chapter);
    setIsLoading(true);
    setCurrentTime(0);
    audio.currentTime = 0;
    // Resolve idb: / blob refs (uploaded mp3s) to a playable URL
    resolveAudioSrc(chapter.audioUrl).then((src) => {
      audio.src = src;
      audio.play().catch(() => setIsPlaying(false));
    });
  }, []);

  const playBook = useCallback(
    (book: Book, chapterId?: string) => {
      const chapter = chapterId
        ? (book.chapters.find((c) => c.id === chapterId) ?? book.chapters[0])
        : book.chapters[0];
      if (!chapter) return;
      incrementPlayCount(book.id);
      playChapter(book, chapter);
    },
    [playChapter],
  );

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !currentBook) return;
    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(() => {});
    }
  }, [isPlaying, currentBook]);

  const seekTo = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    const clamped = Math.max(0, Math.min(seconds, audio.duration || seconds));
    audio.currentTime = clamped;
    setCurrentTime(clamped);
  }, []);

  const skipForward = useCallback(
    (seconds = SKIP_FORWARD_SEC) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo(audio.currentTime + seconds);
    },
    [seekTo],
  );

  const skipBackward = useCallback(
    (seconds = SKIP_BACKWARD_SEC) => {
      const audio = audioRef.current;
      if (!audio) return;
      seekTo(audio.currentTime - seconds);
    },
    [seekTo],
  );

  const nextChapter = useCallback(() => {
    if (!currentBook || !currentChapter) return;
    const idx = currentBook.chapters.findIndex((c) => c.id === currentChapter.id);
    const next = currentBook.chapters[idx + 1];
    if (next) playChapter(currentBook, next);
  }, [currentBook, currentChapter, playChapter]);

  const previousChapter = useCallback(() => {
    if (!currentBook || !currentChapter) return;
    const idx = currentBook.chapters.findIndex((c) => c.id === currentChapter.id);
    const prev = currentBook.chapters[idx - 1];
    if (prev) {
      playChapter(currentBook, prev);
    } else {
      seekTo(0);
    }
  }, [currentBook, currentChapter, playChapter, seekTo]);

  const setVolume = useCallback((v: number) => {
    const audio = audioRef.current;
    setVolumeState(v);
    setIsMuted(v === 0);
    if (audio) audio.volume = v;
  }, []);

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const next = !isMuted;
    setIsMuted(next);
    audio.muted = next;
  }, [isMuted]);

  const setPlaybackRate = useCallback((rate: number) => {
    setPlaybackRateState(rate);
    const audio = audioRef.current;
    if (audio) audio.playbackRate = rate;
  }, []);

  const setExpanded = useCallback((expanded: boolean) => setIsExpanded(expanded), []);

  const closePlayer = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.removeAttribute("src");
    }
    setCurrentBook(null);
    setCurrentChapter(null);
    setIsPlaying(false);
    setIsExpanded(false);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track real listening time toward the daily goal / BookBee Points.
  useEffect(() => {
    if (!isPlaying) return;
    const STEP = 5;
    const interval = setInterval(() => recordListenSeconds(STEP), STEP * 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
    };
    const onEnded = () => nextChapter();
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("ended", onEnded);
    audio.addEventListener("waiting", onWaiting);
    audio.addEventListener("canplay", onCanPlay);
    audio.addEventListener("play", onPlay);
    audio.addEventListener("pause", onPause);

    return () => {
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("ended", onEnded);
      audio.removeEventListener("waiting", onWaiting);
      audio.removeEventListener("canplay", onCanPlay);
      audio.removeEventListener("play", onPlay);
      audio.removeEventListener("pause", onPause);
    };
  }, [nextChapter]);

  const value: AudioPlayerContextValue = {
    currentBook,
    currentChapter,
    isPlaying,
    isLoading,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackRate,
    isExpanded,
    playBook,
    togglePlayPause,
    seekTo,
    skipForward,
    skipBackward,
    nextChapter,
    previousChapter,
    setVolume,
    toggleMute,
    setPlaybackRate,
    setExpanded,
    closePlayer,
  };

  return (
    <AudioPlayerContext.Provider value={value}>
      {children}
      <audio ref={audioRef} preload="metadata" />
    </AudioPlayerContext.Provider>
  );
}
