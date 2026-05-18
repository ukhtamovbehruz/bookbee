import { useState } from 'react';
import { Play, Pause, SkipForward, SkipBack, Moon, Settings, ChevronUp, ChevronDown, ListMusic } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAudioPlayer } from '../context/AudioPlayerContext.jsx';

const AudioPlayer = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { track, isPlaying, progress, currentTime, duration, togglePlay, seek, hasTrack } = useAudioPlayer();

  if (!hasTrack) {
    return null;
  }

  const toggleExpand = () => setIsExpanded(!isExpanded);

  const formatTime = (secs) => {
    const minutes = Math.floor(secs / 60) || 0;
    const seconds = Math.floor(secs - minutes * 60) || 0;
    return minutes + ':' + (seconds < 10 ? '0' : '') + seconds;
  };

  const remainingTime = duration - currentTime;

  return (
    <AnimatePresence>
      <motion.div
        layout
        className={`fixed z-50 transition-all duration-300 ${isExpanded ? 'inset-0 bg-parchment/95 dark:bg-midnight/95 backdrop-blur-xl flex flex-col' : 'bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-3xl glass-pill bg-white/80 dark:bg-white/5 border border-black/10 dark:border-white/10 px-4 py-3 flex items-center justify-between shadow-2xl shadow-black/20 dark:shadow-black/50'}`}
      >
        {isExpanded && (
          <div className="flex justify-between items-center p-6 w-full">
            <button onClick={toggleExpand} className="p-2 glass-pill text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-white bg-black/5 dark:bg-white/5">
              <ChevronDown className="w-6 h-6" />
            </button>
            <div className="flex gap-4">
              <button className="p-2 glass-pill text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-white bg-black/5 dark:bg-white/5"><Moon className="w-5 h-5" /></button>
              <button className="p-2 glass-pill text-midnight/70 dark:text-parchment/70 hover:text-midnight dark:hover:text-white bg-black/5 dark:bg-white/5"><Settings className="w-5 h-5" /></button>
            </div>
          </div>
        )}

        <div className={`flex ${isExpanded ? 'flex-col flex-1 items-center justify-center p-8 w-full max-w-lg mx-auto' : 'items-center gap-4 w-1/3'}`}>
          <img
            src={track.cover}
            alt={track.title}
            className={`${isExpanded ? 'w-72 h-72 rounded-3xl shadow-2xl mb-8 border border-black/10 dark:border-white/10' : 'w-12 h-12 rounded-lg'} object-cover`}
          />
          <div className={`${isExpanded ? 'text-center mb-8' : ''}`}>
            <h4 className={`font-bold text-midnight dark:text-parchment line-clamp-1 ${isExpanded ? 'text-2xl mb-2' : 'text-sm'}`}>{track.title}</h4>
            <p className={`text-midnight/60 dark:text-parchment/60 line-clamp-1 ${isExpanded ? 'text-lg' : 'text-xs'}`}>{track.author}</p>
            {isExpanded && track.chapterTitle && (
              <p className="text-sm text-midnight/50 dark:text-parchment/50 mt-2">{track.chapterTitle}</p>
            )}
          </div>
        </div>

        <div className={`flex flex-col items-center gap-2 ${isExpanded ? 'w-full max-w-lg mx-auto mb-12' : 'flex-1 px-8'}`}>
          <div className="flex items-center gap-6">
            <button className="text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment transition-colors"><SkipBack className="w-5 h-5" /></button>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={togglePlay}
              className={`flex items-center justify-center bg-forest text-white rounded-full hover:bg-forest/90 transition-colors ${isExpanded ? 'w-16 h-16 shadow-lg shadow-forest/20' : 'w-10 h-10'}`}
            >
              {isPlaying ? <Pause className={isExpanded ? 'w-8 h-8' : 'w-5 h-5'} /> : <Play className={isExpanded ? 'w-8 h-8 ml-1' : 'w-5 h-5 ml-0.5'} />}
            </motion.button>
            <button className="text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment transition-colors"><SkipForward className="w-5 h-5" /></button>
          </div>

          <div className="flex items-center gap-3 w-full">
            <span className="text-[10px] text-midnight/50 dark:text-parchment/50 font-mono">{formatTime(currentTime)}</span>
            <div
              className="h-1.5 flex-1 bg-black/10 dark:bg-white/10 rounded-full overflow-hidden cursor-pointer group"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const clickX = e.clientX - rect.left;
                const percent = clickX / rect.width;
                seek(percent);
              }}
            >
              <div
                className="h-full bg-teal group-hover:bg-teal/80 transition-colors relative"
                style={{ width: `${progress}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-midnight dark:bg-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            </div>
            <span className="text-[10px] text-midnight/50 dark:text-parchment/50 font-mono">-{formatTime(remainingTime)}</span>
          </div>
        </div>

        <div className={`flex items-center justify-end gap-3 ${isExpanded ? 'hidden' : 'w-1/3'}`}>
          <button className="text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment transition-colors text-xs font-semibold px-2">1x</button>
          <button className="text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment transition-colors"><ListMusic className="w-4 h-4" /></button>
          <button onClick={toggleExpand} className="text-midnight/60 dark:text-parchment/60 hover:text-midnight dark:hover:text-parchment transition-colors"><ChevronUp className="w-5 h-5" /></button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AudioPlayer;
