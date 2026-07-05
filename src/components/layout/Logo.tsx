import Link from "next/link";
import { Bird } from "lucide-react";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 group"
      aria-label="BookBee home"
    >
      <span className="flex size-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#F4B400] to-[#6C4CF1] text-black shadow-lg shadow-black/40 transition-transform group-hover:scale-105">
        <Bird className="size-5" strokeWidth={2.5} />
      </span>
      <span className="text-lg font-bold tracking-tight text-foreground">
        Book<span className="text-primary">Bee</span>
      </span>
    </Link>
  );
}
