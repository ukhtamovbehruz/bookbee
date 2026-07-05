import type { Chapter } from "@/lib/types";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";

export function generateChapters(
  bookId: string,
  totalDurationSec: number,
  count: number,
): Chapter[] {
  const base = Math.floor(totalDurationSec / count);
  const chapters: Chapter[] = [];

  for (let i = 0; i < count; i++) {
    const isLast = i === count - 1;
    const durationSec = isLast
      ? totalDurationSec - base * (count - 1)
      : base;

    chapters.push({
      id: `${bookId}-ch-${i + 1}`,
      index: i + 1,
      title: i === 0 ? "Introduction" : `Chapter ${i}`,
      durationSec,
      audioUrl: SAMPLE_AUDIO_URLS[i % SAMPLE_AUDIO_URLS.length],
    });
  }

  return chapters;
}
