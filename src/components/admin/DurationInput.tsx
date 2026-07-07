"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function DurationInput({
  seconds,
  onChange,
}: {
  seconds: number;
  onChange: (seconds: number) => void;
}) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);

  function update(next: { h?: number; m?: number; s?: number }) {
    const nh = next.h ?? h;
    const nm = next.m ?? m;
    const ns = next.s ?? s;
    onChange(Math.max(0, nh) * 3600 + Math.max(0, nm) * 60 + Math.max(0, ns));
  }

  return (
    <div className="grid grid-cols-3 gap-2">
      <div className="space-y-1">
        <Label htmlFor="dur-h" className="text-xs text-muted-foreground">
          Hours
        </Label>
        <Input
          id="dur-h"
          type="number"
          min={0}
          value={h}
          onChange={(e) => update({ h: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="dur-m" className="text-xs text-muted-foreground">
          Minutes
        </Label>
        <Input
          id="dur-m"
          type="number"
          min={0}
          max={59}
          value={m}
          onChange={(e) => update({ m: Number(e.target.value) })}
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="dur-s" className="text-xs text-muted-foreground">
          Seconds
        </Label>
        <Input
          id="dur-s"
          type="number"
          min={0}
          max={59}
          value={s}
          onChange={(e) => update({ s: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}
