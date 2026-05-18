import { useState } from 'react';
import { Play, Pause, Share2, CheckCircle2, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAudioPlayer } from '../context/AudioPlayerContext.jsx';

function formatTime(secs) {
  const minutes = Math.floor(secs / 60) || 0;
  const seconds = Math.floor(secs - minutes * 60) || 0;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

function SkipButton({ label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative flex h-11 w-11 items-center justify-center rounded-full text-midnight/70 transition-colors hover:bg-black/5 hover:text-lavender dark:text-parchment/70 dark:hover:bg-white/10 dark:hover:text-lavender"
      aria-label={`Skip ${label} seconds`}
    >
      <svg viewBox="0 0 24 24" className="h-9 w-9" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 5a7 7 0 1 1 0 14" strokeLinecap="round" />
        <path d="M8 5V2l-3 3 3 3V5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold">{label}</span>
    </button>
  );
}

const BookInlinePlayer = ({ book, onHeard, onError }) => {
  const {
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
  } = useAudioPlayer();

  const [heard, setHeard] = useState(false);
  const isActiveBook = track?.bookId === book.id;

  const sampleChapter = book.chapters.find((item) => item.isFree) || book.chapters[0];
  const chapterIndex = isActiveBook ? track.chapterIndex : 1;
  const totalChapters = isActiveBook ? track.totalChapters : book.chapters.length || 1;
  const chapterTitle = isActiveBook ? track.chapterTitle : sampleChapter?.title;
  const inactiveDuration = sampleChapter?.durationSeconds || 0;

  function handlePlayPause() {
    if (!isActiveBook) {
      const started = playBook(book);
      if (!started) {
        onError?.('No audio sample available for this book.');
      }
      return;
    }

    togglePlay();
  }

  async function handleShare() {
    const shareData = {
      title: book.title,
      text: `Listen to ${book.title} by ${book.author}`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
      }
    } catch {
      // User cancelled share
    }
  }

  function handleHeard() {
    setHeard(true);
    onHeard?.();
  }

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.15 }}
      className="flex-1 w-full rounded-3xl bg-white/95 dark:bg-midnight/90 border border-black/10 dark:border-white/10 shadow-2xl shadow-black/20 p-5 md:p-6 backdrop-blur-md"
    >
      <div className="mb-5">
        <h1 className="text-2xl md:text-3xl font-bold text-midnight dark:text-white leading-tight line-clamp-2">{book.title}</h1>
        <p className="mt-1 text-base text-midnight/60 dark:text-parchment/60">{book.author}</p>
        {chapterTitle && (
          <p className="mt-1 text-sm text-midnight/45 dark:text-parchment/45">
            Episode {chapterIndex} of {totalChapters}
            {isActiveBook ? '' : ' · Tap play to start'}
          </p>
        )}
      </div>

      <div className="mb-2 flex items-center justify-between text-xs font-mono text-midnight/50 dark:text-parchment/50">
        <span>{formatTime(isActiveBook ? currentTime : 0)}</span>
        <span>{formatTime(isActiveBook && duration ? duration : inactiveDuration)}</span>
      </div>

      <div
        className="group mb-6 h-1.5 cursor-pointer rounded-full bg-black/10 dark:bg-white/10"
        onClick={(e) => {
          if (!isActiveBook || !duration) return;
          const rect = e.currentTarget.getBoundingClientRect();
          const percent = (e.clientX - rect.left) / rect.width;
          seek(percent);
        }}
      >
        <div
          className="relative h-full rounded-full bg-lavender transition-all"
          style={{ width: `${isActiveBook ? progress : 0}%` }}
        >
          <div className="absolute right-0 top-1/2 h-3.5 w-3.5 -translate-y-1/2 translate-x-1/2 rounded-full bg-lavender shadow-md ring-2 ring-white dark:ring-midnight" />
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <button
          type="button"
          onClick={cyclePlaybackRate}
          className="min-w-[2.5rem] rounded-full px-2 py-1 text-sm font-semibold text-midnight/70 transition-colors hover:bg-black/5 hover:text-lavender dark:text-parchment/70 dark:hover:bg-white/10"
        >
          {playbackRate}x
        </button>

        <SkipButton label="10" onClick={() => (isActiveBook ? skip(-10) : handlePlayPause())} />

        <motion.button
          type="button"
          whileTap={{ scale: 0.92 }}
          onClick={handlePlayPause}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-lavender text-white shadow-lg shadow-lavender/30 transition-colors hover:bg-lavender/90"
        >
          {isPlaying && isActiveBook ? (
            <Pause className="h-7 w-7" />
          ) : (
            <Play className="h-7 w-7 ml-1" />
          )}
        </motion.button>

        <SkipButton label="30" onClick={() => (isActiveBook ? skip(30) : handlePlayPause())} />

        <button
          type="button"
          className="flex h-11 w-11 items-center justify-center rounded-full text-midnight/70 transition-colors hover:bg-black/5 hover:text-lavender dark:text-parchment/70 dark:hover:bg-white/10"
          aria-label="Sleep timer"
        >
          <Moon className="h-5 w-5" />
        </button>
      </div>

      <div className="flex items-center justify-around rounded-2xl bg-black/[0.04] px-4 py-4 dark:bg-white/[0.06]">
        <button
          type="button"
          onClick={handleHeard}
          className={`flex flex-col items-center gap-1.5 text-xs font-medium transition-colors ${
            heard ? 'text-forest' : 'text-midnight/60 hover:text-midnight dark:text-parchment/60 dark:hover:text-parchment'
          }`}
        >
          <CheckCircle2 className={`h-6 w-6 ${heard ? 'fill-forest/20' : ''}`} />
          I heard
        </button>
        <button
          type="button"
          onClick={handleShare}
          className="flex flex-col items-center gap-1.5 text-xs font-medium text-midnight/60 transition-colors hover:text-midnight dark:text-parchment/60 dark:hover:text-parchment"
        >
          <Share2 className="h-6 w-6" />
          Share
        </button>
      </div>
    </motion.div>
  );
};

export default BookInlinePlayer;
