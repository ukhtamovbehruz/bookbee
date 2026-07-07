import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 48 48" fill="none" {...props}>
      <defs>
        <linearGradient id="bb-leaf" x1="8" y1="9" x2="24" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1FB68F" />
          <stop offset="1" stopColor="#0B6B54" />
        </linearGradient>
        <linearGradient id="bb-page" x1="24" y1="7" x2="40" y2="37" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#63D983" />
          <stop offset="1" stopColor="#2AA457" />
        </linearGradient>
      </defs>
      {/* right page — bright green upright panel */}
      <path
        d="M24.5 11.5 L38 7.6 Q40 7 40 9.2 L40 32.4 Q40 34.4 38 35 L24.5 38.5 Z"
        fill="url(#bb-page)"
      />
      {/* left page — teal leaf with an inner curl */}
      <path
        d="M24.5 11.5 C16 10 8 15 8 23 C8 30.5 11.5 35.5 16.5 36.5 C13.5 32.5 14.5 28 19.5 28 C22.5 28 24 31 24.5 38.5 Z"
        fill="url(#bb-leaf)"
      />
    </svg>
  );
}
