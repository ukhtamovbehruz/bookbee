import Link from "next/link";
import { Globe, Mail, Phone } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import {
  InstagramIcon,
  XIcon,
  TelegramIcon,
  LinkedInIcon,
} from "@/components/layout/SocialIcons";

const FOOTER_LINKS = [
  {
    heading: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Contact", href: "/contact" },
      { label: "Help Center", href: "/help" },
      { label: "FAQ", href: "/faq" },
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
  { label: "Telegram", href: "http://t.me/bookbee_hub", icon: TelegramIcon },
  { label: "Instagram", href: "http://instagram.com/bookbee_hub", icon: InstagramIcon },
  { label: "LinkedIn", href: "http://linkedin.com/company/bookbee-hub", icon: LinkedInIcon },
  { label: "X (Twitter)", href: "http://x.com/bookbee_hub", icon: XIcon },
  { label: "Website", href: "http://book-bee.netlify.app/", icon: Globe },
];

export function Footer() {
  return (
    <footer className="hairline-t bg-card/40 pb-28">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-4 max-w-xs text-sm text-muted-foreground">
              Discover, listen, and grow with the world&apos;s best audiobooks —
              anytime, anywhere.
            </p>
            <div className="mt-4 space-y-1.5 text-sm text-muted-foreground">
              <a
                href="mailto:uktamovbekhruz08@gmail.com"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Mail className="size-3.5 shrink-0" />
                uktamovbekhruz08@gmail.com
              </a>
              <a
                href="tel:+998940865600"
                className="flex items-center gap-2 transition-colors hover:text-foreground"
              >
                <Phone className="size-3.5 shrink-0" />
                +998 (94) 086-5-600
              </a>
            </div>
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
            <div className="mt-4 flex flex-wrap gap-3">
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

        <div className="mt-10 flex flex-col items-center gap-2 hairline-t pt-6 text-center text-xs text-muted-foreground sm:flex-row sm:justify-between">
          <span>© {new Date().getFullYear()} BookBee. All rights reserved.</span>
          <span>Tashkent, Uzbekistan</span>
        </div>
      </div>
    </footer>
  );
}
