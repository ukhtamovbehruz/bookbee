"use client";

import { useId } from "react";
import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  const id = useId().replace(/:/g, "");
  const chap = `${id}-chap`;
  const orta = `${id}-orta`;
  const ong = `${id}-ong`;

  return (
    <svg viewBox="0 0 500 500" fill="none" {...props}>
      <defs>
        <linearGradient id={chap} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#228c7f" />
          <stop offset="100%" stopColor="#1b5a64" />
        </linearGradient>
        <linearGradient id={orta} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#4caf50" />
          <stop offset="100%" stopColor="#1b7254" />
        </linearGradient>
        <linearGradient id={ong} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#aacc33" />
          <stop offset="100%" stopColor="#669922" />
        </linearGradient>
      </defs>

      <g transform="translate(45, 25)">
        <path
          d="M 180,45 C 135,45 112,110 112,270 C 112,365 112,390 112,410 C 130,360 155,335 180,315 Z"
          fill={`url(#${chap})`}
        />
        <path
          d="M 198,130 L 303,120 L 303,385 C 260,395 210,405 120,475 C 150,430 180,380 198,300 Z"
          fill={`url(#${orta})`}
        />
        <path
          d="M 320,175 L 348,178 L 348,455 C 310,425 240,430 175,445 C 240,435 295,410 320,365 Z"
          fill={`url(#${ong})`}
        />
      </g>
    </svg>
  );
}
