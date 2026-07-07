"use client";

import { useState } from "react";
import Image from "next/image";
import { ImageIcon, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function CoverField({
  value,
  onChange,
}: {
  value: string;
  onChange: (url: string) => void;
}) {
  const [dragging, setDragging] = useState(false);

  function readFile(file: File) {
    const reader = new FileReader();
    reader.onload = () => onChange(String(reader.result));
    reader.readAsDataURL(file);
  }

  return (
    <div className="flex gap-4">
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
          if (file && file.type.startsWith("image/")) {
            readFile(file);
            return;
          }
          const text = e.dataTransfer.getData("text");
          if (text) onChange(text.trim());
        }}
        onPaste={(e) => {
          const file = e.clipboardData.files?.[0];
          if (file && file.type.startsWith("image/")) {
            readFile(file);
          }
        }}
        className={cn(
          "relative flex aspect-2/3 w-24 shrink-0 flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed text-center transition-colors",
          dragging ? "border-primary bg-primary/10" : "border-border",
        )}
        title="Drop an image or paste a cover here"
      >
        {value ? (
          <Image src={value} alt="Cover preview" fill sizes="96px" className="object-cover" />
        ) : (
          <ImageIcon className="size-6 text-muted-foreground" />
        )}
      </div>

      <div className="flex flex-1 flex-col justify-center gap-2">
        <label className="text-xs text-muted-foreground">
          Paste a cover image URL, or drag &amp; drop / paste an image onto the box.
        </label>
        <Input
          placeholder="https://... or paste image"
          value={value.startsWith("data:") ? "" : value}
          onChange={(e) => onChange(e.target.value)}
          onPaste={(e) => {
            const file = e.clipboardData.files?.[0];
            if (file && file.type.startsWith("image/")) {
              e.preventDefault();
              readFile(file);
            }
          }}
        />
        {value.startsWith("data:") && (
          <span className="inline-flex items-center gap-1 text-xs text-primary">
            <Upload className="size-3" />
            Uploaded image attached
          </span>
        )}
      </div>
    </div>
  );
}
