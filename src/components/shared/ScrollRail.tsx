import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function ScrollRail({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-4 overflow-x-auto scroll-smooth scrollbar-none snap-x snap-proximity pb-2",
        className,
      )}
    >
      {children}
    </div>
  );
}
