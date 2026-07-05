import Link from "next/link";
import { Logo } from "@/components/layout/Logo";
import {
  InstagramIcon,
  XIcon,
  YoutubeIcon,
  FacebookIcon,
} from "@/components/layout/SocialIcons";

const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
    ],
  },
  {
    heading: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Use", href: "/terms" },
    ],
  },
];

const SOCIAL_LINKS = [
  { label: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { label: "X", href: "https://x.com", icon: XIcon },
  { label: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
  { label: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
];

export function Footer() {
  return (
    <footer className="border-t border-white/5 bg-card/40 pb-28">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Discover, listen, and grow with the world&apos;s best audiobooks —
              anytime, anywhere.
            </p>
          </div>

          {FOOTER_LINKS.map((group) => (
            <div key={group.heading}>
              <h3 className="text-sm font-semibold text-foreground">
                {group.heading}
              </h3>
              <ul className="mt-4 space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h3 className="text-sm font-semibold text-foreground">Follow us</h3>
            <div className="mt-4 flex gap-3">
              {SOCIAL_LINKS.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={social.label}
                    className="flex size-9 items-center justify-center rounded-full bg-white/5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground"
                  >
                    <Icon className="size-4" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} BookBee. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
