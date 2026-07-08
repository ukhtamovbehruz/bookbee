"use client";

import { useState } from "react";
import { FileAudio, Loader2, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { putAudioBlob, isUploadedAudio } from "@/lib/audio-store";
import { cn } from "@/lib/utils";

export function AudioField({
  value,
  onChange,
}: {
  value: string;
  onChange: (ref: string) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);

  async function handleFile(file: File) {
    if (!file.type.startsWith("audio/") && !file.name.endsWith(".mp3")) return;
    setBusy(true);
    const ref = await putAudioBlob(file);
    setBusy(false);
    onChange(ref);
  }

  const uploaded = isUploadedAudio(value);

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = e.dataTransfer.files?.[0];
        if (file) handleFile(file);
        else {
          const text = e.dataTransfer.getData("text");
          if (text) onChange(text.trim());
        }
      }}
      className={cn(
        "flex items-center gap-2 rounded-xl border border-dashed px-2 py-1.5 transition-colors",
        dragging ? "border-primary bg-primary/10" : "border-border",
      )}
    >
      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground">
        {busy ? (
          <Loader2 className="size-4 animate-spin" />
        ) : uploaded ? (
          <FileAudio className="size-4 text-primary" />
        ) : (
          <Upload className="size-4" />
        )}
      </span>
      <Input
        className="h-8 border-0 bg-transparent px-1 shadow-none focus-visible:ring-0"
        placeholder="Paste mp3 URL, or drop a file"
        value={uploaded ? "" : value}
        onChange={(e) => onChange(e.target.value)}
      />
      {uploaded && (
        <span className="shrink-0 pr-2 text-xs font-medium text-primary">
          mp3 uploaded
        </span>
      )}
      <label className="shrink-0 cursor-pointer rounded-md px-2 py-1 text-xs text-muted-foreground hover:text-foreground">
        Browse
        <input
          type="file"
          accept="audio/*,.mp3"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleFile(file);
            e.target.value = "";
          }}
        />
      </label>
    </div>
  );
}
