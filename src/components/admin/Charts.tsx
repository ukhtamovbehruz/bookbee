"use client";

export function MiniAreaChart({
  data,
  color = "var(--primary)",
  height = 140,
}: {
  data: number[];
  color?: string;
  height?: number;
}) {
  const width = 600;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const stepX = width / (data.length - 1);

  const points = data.map((d, i) => {
    const x = i * stepX;
    const y = height - ((d - min) / range) * (height - 16) - 8;
    return [x, y] as const;
  });

  const line = points.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x},${y}`).join(" ");
  const area = `${line} L${width},${height} L0,${height} Z`;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="none"
      className="h-full w-full"
    >
      <defs>
        <linearGradient id="area-fill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={color} stopOpacity="0.35" />
          <stop offset="1" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#area-fill)" />
      <path d={line} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutChart({
  segments,
  centerLabel,
  centerSub,
}: {
  segments: { label: string; value: number; color: string }[];
  centerLabel: string;
  centerSub?: string;
}) {
  const total = segments.reduce((sum, s) => sum + s.value, 0) || 1;
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  let offset = 0;

  return (
    <div className="flex items-center gap-5">
      <div className="relative size-32 shrink-0">
        <svg viewBox="0 0 120 120" className="size-full -rotate-90">
          {segments.map((seg) => {
            const fraction = seg.value / total;
            const dash = fraction * circumference;
            const circle = (
              <circle
                key={seg.label}
                cx="60"
                cy="60"
                r={radius}
                fill="none"
                stroke={seg.color}
                strokeWidth="14"
                strokeDasharray={`${dash} ${circumference - dash}`}
                strokeDashoffset={-offset}
              />
            );
            offset += dash;
            return circle;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold">{centerLabel}</span>
          {centerSub && (
            <span className="text-[10px] uppercase tracking-wide text-muted-foreground">
              {centerSub}
            </span>
          )}
        </div>
      </div>
      <ul className="space-y-1.5 text-sm">
        {segments.map((seg) => (
          <li key={seg.label} className="flex items-center gap-2 text-muted-foreground">
            <span className="size-2.5 rounded-full" style={{ backgroundColor: seg.color }} />
            {seg.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
