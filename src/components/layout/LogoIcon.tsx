import type { SVGProps } from "react";

export function LogoIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 40 40" fill="none" {...props}>
      <defs>
        <linearGradient id="bb-logo-a" x1="4" y1="4" x2="20" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#0F5C4E" />
          <stop offset="1" stopColor="#0B3A32" />
        </linearGradient>
        <linearGradient id="bb-logo-b" x1="12" y1="2" x2="26" y2="36" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#1D9A7C" />
          <stop offset="1" stopColor="#12705A" />
        </linearGradient>
        <linearGradient id="bb-logo-c" x1="18" y1="2" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#3DD68C" />
          <stop offset="1" stopColor="#1CAE72" />
        </linearGradient>
      </defs>
      <path d="M8 4L20 8V36L8 32V4Z" fill="url(#bb-logo-a)" />
      <path d="M20 8L28 3V32L20 36V8Z" fill="url(#bb-logo-b)" />
      <path d="M28 3L34 7V28L28 32V3Z" fill="url(#bb-logo-c)" />
    </svg>
  );
}
