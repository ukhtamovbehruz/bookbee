"use client";

import { cn } from "@/lib/utils";

export function Equalizer({
  playing,
  className,
  barClassName,
}: {
  playing: boolean;
  className?: string;
  barClassName?: string;
}) {
  return (
    <span className={cn("flex items-end gap-0.5", className)} aria-hidden="true">
      {[0, 1, 2, 3].map((i) => (
        <span
          key={i}
          className={cn("w-0.5 rounded-full bg-primary", barClassName)}
          style={{
            height: playing ? undefined : "30%",
            animation: playing
              ? `eq 900ms ease-in-out ${i * 120}ms infinite`
              : "none",
          }}
        />
      ))}
    </span>
  );
}
