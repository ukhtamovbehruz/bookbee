"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useAudioPlayer } from "@/components/player/AudioPlayerProvider";
import { useAuth } from "@/context/AuthProvider";
import type { Book } from "@/lib/types";

export function useGuardedPlay() {
  const { user } = useAuth();
  const { playBook } = useAudioPlayer();
  const router = useRouter();

  return (book: Book, chapterId?: string) => {
    if (!user) {
      toast.warning("Sign up free to start listening.");
      router.push("/signup");
      return;
    }
    playBook(book, chapterId);
  };
}
