"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function StickyPlayer() {
  const { currentBook, isExpanded } = useAudioPlayer();

  if (!currentBook) return null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 border-t border-white/10 glass-strong">
      <AnimatePresence mode="wait" initial={false}>
        {isExpanded ? (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 24 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            <ExpandedPlayer />
          </motion.div>
        ) : (
          <motion.div
            key="mini"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <MiniPlayer />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
