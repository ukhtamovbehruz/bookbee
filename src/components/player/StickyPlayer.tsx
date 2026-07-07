"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function StickyPlayer() {
  const { currentBook, isExpanded } = useAudioPlayer();

  if (!currentBook) return null;

  return (
    <motion.div
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 30 }}
      className="fixed inset-x-0 bottom-0 z-50 hairline-t glass-strong"
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent"
      />
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
    </motion.div>
  );
}
