"use client";

import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AudioField } from "@/components/admin/AudioField";
import { SAMPLE_AUDIO_URLS } from "@/lib/constants";
import type { Chapter } from "@/lib/types";
import { formatDuration } from "@/lib/utils";

function blankChapter(index: number): Chapter {
  return {
    id: `new-ch-${index}`,
    index,
    title: index === 1 ? "Introduction" : `Chapter ${index - 1}`,
    durationSec: 20 * 60,
    audioUrl: SAMPLE_AUDIO_URLS[0],
  };
}

export function ChaptersEditor({
  chapters,
  onChange,
}: {
  chapters: Chapter[];
  onChange: (chapters: Chapter[]) => void;
}) {
  function update(i: number, patch: Partial<Chapter>) {
    onChange(chapters.map((c, idx) => (idx === i ? { ...c, ...patch } : c)));
  }

  function setDuration(i: number, mins: number, secs: number) {
    update(i, { durationSec: Math.max(0, mins) * 60 + Math.max(0, secs) });
  }

  const total = chapters.reduce((sum, c) => sum + c.durationSec, 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label>Chapters &amp; audio</Label>
        <span className="text-xs text-muted-foreground">
          {chapters.length} chapters · {formatDuration(total)} total
        </span>
      </div>

      <div className="space-y-3">
        {chapters.map((chapter, i) => {
          const mins = Math.floor(chapter.durationSec / 60);
          const secs = chapter.durationSec % 60;
          return (
            <div key={chapter.id} className="rounded-2xl border border-border p-3">
              <div className="flex items-center gap-2">
                <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground">
                  {i + 1}
                </span>
                <Input
                  className="h-8"
                  placeholder="Chapter title"
                  value={chapter.title}
                  onChange={(e) => update(i, { title: e.target.value })}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove chapter ${i + 1}`}
                  onClick={() => onChange(chapters.filter((_, idx) => idx !== i))}
                  disabled={chapters.length === 1}
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>

              <div className="mt-2">
                <AudioField
                  value={chapter.audioUrl}
                  onChange={(ref) => update(i, { audioUrl: ref })}
                />
              </div>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Duration</span>
                <Input
                  type="number"
                  min={0}
                  className="h-8 w-16"
                  value={mins}
                  onChange={(e) => setDuration(i, Number(e.target.value), secs)}
                  aria-label={`Chapter ${i + 1} minutes`}
                />
                <span className="text-xs text-muted-foreground">min</span>
                <Input
                  type="number"
                  min={0}
                  max={59}
                  className="h-8 w-16"
                  value={secs}
                  onChange={(e) => setDuration(i, mins, Number(e.target.value))}
                  aria-label={`Chapter ${i + 1} seconds`}
                />
                <span className="text-xs text-muted-foreground">sec</span>
              </div>
            </div>
          );
        })}
      </div>

      <Button
        variant="outline"
        size="sm"
        className="w-full gap-2"
        onClick={() => onChange([...chapters, blankChapter(chapters.length + 1)])}
      >
        <Plus className="size-4" />
        Add chapter
      </Button>
    </div>
  );
}
