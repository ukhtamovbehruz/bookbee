import Link from "next/link";
import { LogoIcon } from "@/components/layout/LogoIcon";

export function Logo() {
  return (
    <Link
      href="/"
      className="flex items-center gap-2 shrink-0 group"
      aria-label="BookBee home"
    >
      <LogoIcon className="size-8 transition-transform group-hover:scale-105" />
      <span className="text-lg font-bold tracking-tight text-foreground">
        bookbee
      </span>
    </Link>
  );
}
