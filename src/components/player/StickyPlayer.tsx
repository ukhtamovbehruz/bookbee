"use client";

import { AnimatePresence, motion } from "framer-motion";
import { MiniPlayer } from "@/components/player/MiniPlayer";
import { ExpandedPlayer } from "@/components/player/ExpandedPlayer";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";

export function StickyPlayer() {
  const { currentBook, isExpanded } = useAudioPlayer();

  if (!currentBook) return null;

  return (
    <>
      {/* Full-screen "now playing" — mounted only when expanded. */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            key="expanded"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed inset-0 z-[60]"
          >
            <ExpandedPlayer />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Docked mini bar — hidden while the full-screen player is open. */}
      {!isExpanded && (
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
          <MiniPlayer />
        </motion.div>
      )}
    </>
  );
}
