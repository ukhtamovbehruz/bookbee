import type { SVGProps } from "react";

export function BeeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <ellipse cx="24" cy="27" rx="10" ry="12" fill="#17130A" />
      <path d="M14 21h20M14 27h20M14 33h20" stroke="#F4B400" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="24" cy="14" r="6" fill="#17130A" />
      <ellipse cx="12" cy="16" rx="8" ry="5" fill="#F4B400" fillOpacity="0.35" transform="rotate(-20 12 16)" />
      <ellipse cx="36" cy="16" rx="8" ry="5" fill="#F4B400" fillOpacity="0.35" transform="rotate(20 36 16)" />
      <circle cx="21" cy="13" r="1.4" fill="#F4B400" />
      <circle cx="27" cy="13" r="1.4" fill="#F4B400" />
    </svg>
  );
}
