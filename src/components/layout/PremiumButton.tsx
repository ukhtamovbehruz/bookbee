import Link from "next/link";
import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

export function PremiumButton({ className }: { className?: string }) {
  return (
    <Link
      href="/#premium"
      className={cn(
        "inline-flex h-8 items-center gap-1.5 rounded-full bg-gradient-to-r from-[#F4B400] to-[#f9d35c] px-3.5 text-sm font-semibold text-[#17130a] shadow-lg shadow-[#F4B400]/20 transition-transform hover:scale-105 active:scale-95",
        className,
      )}
    >
      <Crown className="size-4" />
      Premium
    </Link>
  );
}
