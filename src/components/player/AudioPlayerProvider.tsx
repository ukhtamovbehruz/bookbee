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
import { getPlaybackProgress, savePlaybackProgress } from "@/lib/playback-progress";

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
  pause: () => void;
  sleepTimerMinutes: number | null;
  setSleepTimer: (minutes: number | null) => void;
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
  // Position to seek to once the next chapter's metadata has loaded (for resume).
  const pendingSeekRef = useRef(0);

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
  const [sleepTimerMinutes, setSleepTimerMinutesState] = useState<number | null>(
    null,
  );
  const sleepTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Mirror the current book/chapter into refs so timers can persist progress
  // without re-subscribing on every change.
  const currentBookRef = useRef<Book | null>(null);
  const currentChapterRef = useRef<Chapter | null>(null);
  currentBookRef.current = currentBook;
  currentChapterRef.current = currentChapter;

  const persistProgress = useCallback(() => {
    const audio = audioRef.current;
    const book = currentBookRef.current;
    const chapter = currentChapterRef.current;
    if (audio && book && chapter && audio.currentTime > 0) {
      savePlaybackProgress(book.id, chapter.id, audio.currentTime);
    }
  }, []);

  const playChapter = useCallback(
    (book: Book, chapter: Chapter, startAt = 0) => {
      const audio = audioRef.current;
      if (!audio) return;
      setCurrentBook(book);
      setCurrentChapter(chapter);
      setIsLoading(true);
      setCurrentTime(startAt);
      pendingSeekRef.current = startAt;
      audio.currentTime = 0;
      // Resolve idb: / blob refs (uploaded mp3s) to a playable URL
      resolveAudioSrc(chapter.audioUrl).then((src) => {
        audio.src = src;
        audio.play().catch(() => setIsPlaying(false));
      });
    },
    [],
  );

  const playBook = useCallback(
    (book: Book, chapterId?: string) => {
      // An explicit chapter starts fresh; otherwise resume where the listener
      // stopped, if we have a saved position for this book.
      if (chapterId) {
        const chapter = book.chapters.find((c) => c.id === chapterId) ?? book.chapters[0];
        if (!chapter) return;
        incrementPlayCount(book.id);
        playChapter(book, chapter);
        return;
      }

      const saved = getPlaybackProgress(book.id);
      const resumeChapter = saved
        ? book.chapters.find((c) => c.id === saved.chapterId)
        : undefined;
      const chapter = resumeChapter ?? book.chapters[0];
      if (!chapter) return;
      incrementPlayCount(book.id);
      playChapter(book, chapter, resumeChapter ? saved!.positionSec : 0);
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

  const pause = useCallback(() => {
    const audio = audioRef.current;
    if (audio) audio.pause();
  }, []);

  // Auto-pause after N minutes. Lives in the provider (not the expanded player)
  // so the countdown keeps running when the player is collapsed to the mini bar.
  const setSleepTimer = useCallback((minutes: number | null) => {
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    setSleepTimerMinutesState(minutes);
    if (minutes && minutes > 0) {
      sleepTimeoutRef.current = setTimeout(() => {
        const audio = audioRef.current;
        if (audio) audio.pause();
        sleepTimeoutRef.current = null;
        setSleepTimerMinutesState(null);
      }, minutes * 60_000);
    }
  }, []);

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
    persistProgress();
    if (sleepTimeoutRef.current) {
      clearTimeout(sleepTimeoutRef.current);
      sleepTimeoutRef.current = null;
    }
    setSleepTimerMinutesState(null);
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
  }, [persistProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.playbackRate = playbackRate;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Track real listening time toward the daily goal / BookBee Points, and
  // remember the position so the listener can resume where they stopped.
  useEffect(() => {
    if (!isPlaying) return;
    const STEP = 5;
    const interval = setInterval(() => {
      recordListenSeconds(STEP);
      persistProgress();
    }, STEP * 1000);
    return () => clearInterval(interval);
  }, [isPlaying, persistProgress]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => setCurrentTime(audio.currentTime);
    const onLoadedMetadata = () => {
      setDuration(audio.duration || 0);
      setIsLoading(false);
      // Resume: seek to the saved position once the media is ready.
      if (pendingSeekRef.current > 0) {
        audio.currentTime = Math.min(pendingSeekRef.current, audio.duration || pendingSeekRef.current);
        pendingSeekRef.current = 0;
      }
    };
    const onEnded = () => nextChapter();
    const onWaiting = () => setIsLoading(true);
    const onCanPlay = () => setIsLoading(false);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => {
      setIsPlaying(false);
      persistProgress();
    };

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
  }, [nextChapter, persistProgress]);

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
    pause,
    sleepTimerMinutes,
    setSleepTimer,
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
