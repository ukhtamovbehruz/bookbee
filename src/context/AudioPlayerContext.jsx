/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';

export const AudioPlayerContext = createContext(null);

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) {
    throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  }
  return context;
}

export function AudioPlayerProvider({ children }) {
  const [track, setTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const soundRef = useRef(null);
  const durationRef = useRef(0);
  const rafRef = useRef(null);
  const playbackRateRef = useRef(1);

  const stopProgress = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
  }, []);

  const updateProgress = useCallback(function tick() {
    if (soundRef.current?.playing()) {
      const seek = Number(soundRef.current.seek() || 0);
      setCurrentTime(seek);
      setProgress((seek / durationRef.current) * 100 || 0);
      rafRef.current = requestAnimationFrame(tick);
    }
  }, []);

  useEffect(() => {
    playbackRateRef.current = playbackRate;
  }, [playbackRate]);

  useEffect(() => {
    return () => {
      stopProgress();
      soundRef.current?.unload();
    };
  }, [stopProgress]);

  useEffect(() => {
    if (!track?.audioUrl) {
      return undefined;
    }

    stopProgress();
    soundRef.current?.unload();

    setProgress(0);
    setCurrentTime(0);
    setDuration(0);
    durationRef.current = 0;
    setIsPlaying(false);

    const sound = new Howl({
      src: [track.audioUrl],
      html5: true,
      rate: playbackRateRef.current,
      onload: () => {
        const nextDuration = sound.duration();
        durationRef.current = nextDuration;
        setDuration(nextDuration);
      },
      onplay: () => {
        setIsPlaying(true);
        stopProgress();
        rafRef.current = requestAnimationFrame(updateProgress);
      },
      onpause: () => {
        setIsPlaying(false);
        stopProgress();
      },
      onend: () => {
        setIsPlaying(false);
        setProgress(0);
        setCurrentTime(0);
        stopProgress();
      },
      onloaderror: () => {
        setIsPlaying(false);
      },
    });

    soundRef.current = sound;
    sound.play();

    return () => {
      stopProgress();
      sound.unload();
      if (soundRef.current === sound) {
        soundRef.current = null;
      }
    };
  }, [track?.audioUrl, track?.bookId, stopProgress, updateProgress]);

  useEffect(() => {
    if (soundRef.current) {
      soundRef.current.rate(playbackRate);
    }
  }, [playbackRate]);

  const playBook = useCallback((book, chapter) => {
    const targetChapter =
      chapter ||
      book.chapters?.find((item) => item.isFree && item.audioUrl) ||
      book.chapters?.find((item) => item.audioUrl);

    if (!targetChapter?.audioUrl) {
      return false;
    }

    const chapterIndex = book.chapters?.findIndex((item) => item.id === targetChapter.id) ?? 0;

    setTrack({
      bookId: book.id,
      title: book.title,
      author: book.author,
      cover: book.cover,
      audioUrl: targetChapter.audioUrl,
      chapterTitle: targetChapter.title,
      chapterIndex: chapterIndex + 1,
      totalChapters: book.chapters?.length ?? 1,
    });

    return true;
  }, []);

  const togglePlay = useCallback(() => {
    if (!soundRef.current) {
      return;
    }

    if (soundRef.current.playing()) {
      soundRef.current.pause();
    } else {
      soundRef.current.play();
    }
  }, []);

  const seek = useCallback((percent) => {
    if (!soundRef.current || !durationRef.current) {
      return;
    }

    const nextTime = durationRef.current * percent;
    soundRef.current.seek(nextTime);
    setProgress(percent * 100);
    setCurrentTime(nextTime);
  }, []);

  const skip = useCallback((seconds) => {
    if (!soundRef.current || !durationRef.current) {
      return;
    }

    const current = Number(soundRef.current.seek() || 0);
    const nextTime = Math.max(0, Math.min(durationRef.current, current + seconds));
    soundRef.current.seek(nextTime);
    setCurrentTime(nextTime);
    setProgress((nextTime / durationRef.current) * 100 || 0);
  }, []);

  const cyclePlaybackRate = useCallback(() => {
    setPlaybackRate((rate) => {
      if (rate === 1) return 1.25;
      if (rate === 1.25) return 1.5;
      return 1;
    });
  }, []);

  const value = {
    track,
    isPlaying,
    progress,
    currentTime,
    duration,
    playbackRate,
    playBook,
    togglePlay,
    seek,
    skip,
    cyclePlaybackRate,
    hasTrack: Boolean(track),
  };

  return <AudioPlayerContext.Provider value={value}>{children}</AudioPlayerContext.Provider>;
}
