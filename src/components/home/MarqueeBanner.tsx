import { Sparkles } from "lucide-react";

const MESSAGE =
  "Your next favorite book, narrated. Stream thousands of audiobooks across business, psychology, technology, and more — pick up exactly where you left off, on any device.";

function MarqueeContent() {
  return (
    <div className="flex shrink-0 items-center gap-4 pr-4" aria-hidden="true">
      <Sparkles className="size-4 shrink-0 text-primary" />
      <span className="text-sm font-medium tracking-wide text-foreground/90 sm:text-base">
        {MESSAGE}
      </span>
    </div>
  );
}

export function MarqueeBanner() {
  return (
    <div className="overflow-hidden border-y border-white/5 bg-card/60 py-3">
      <p className="sr-only">{MESSAGE}</p>
      <div className="flex w-max animate-marquee">
        <MarqueeContent />
        <MarqueeContent />
      </div>
    </div>
  );
}
