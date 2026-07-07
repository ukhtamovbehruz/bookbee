import type { Chapter } from "@/lib/types";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";

export function generateChapters(
  bookId: string,
  totalDurationSec: number,
  count: number,
  audioUrl?: string,
): Chapter[] {
  const safeCount = Math.max(1, count);
  const base = Math.floor(totalDurationSec / safeCount);
  const chapters: Chapter[] = [];

  for (let i = 0; i < safeCount; i++) {
    const isLast = i === safeCount - 1;
    const durationSec = isLast
      ? totalDurationSec - base * (safeCount - 1)
      : base;

    chapters.push({
      id: `${bookId}-ch-${i + 1}`,
      index: i + 1,
      title: i === 0 ? "Introduction" : `Chapter ${i}`,
      durationSec,
      audioUrl: audioUrl ?? SAMPLE_AUDIO_URLS[i % SAMPLE_AUDIO_URLS.length],
    });
  }

  return chapters;
}
