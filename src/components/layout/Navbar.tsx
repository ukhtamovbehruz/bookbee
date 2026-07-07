"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { SearchCommandDialog } from "@/components/layout/SearchCommandDialog";
import { UserMenu } from "@/components/layout/UserMenu";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { PremiumButton } from "@/components/layout/PremiumButton";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useAuth } from "@/context/AuthProvider";

const NAV_LINKS = [
  { href: "/#categories", label: "Categories" },
  { href: "/#collections", label: "Collections" },
  { href: "/#new-releases", label: "New Releases" },
];

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 w-full hairline-b glass">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Logo />

        <nav
          aria-label="Primary"
          className="hidden lg:flex items-center gap-6 pl-4 text-sm text-muted-foreground"
        >
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-1 items-center justify-end gap-2 sm:gap-3">
          <SearchCommandDialog />
          <ThemeToggle />
          <PremiumButton className="hidden sm:inline-flex" />
          <div className="hidden sm:flex items-center gap-2">
            {user ? (
              <UserMenu />
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Log in</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            )}
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="sm:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 glass-strong">
              <SheetHeader>
                <SheetTitle>
                  <Logo />
                </SheetTitle>
              </SheetHeader>
              <div className="flex flex-col gap-4 px-4 pb-6">
                <nav aria-label="Mobile" className="flex flex-col gap-3 text-sm">
                  {NAV_LINKS.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>
                <PremiumButton className="w-full justify-center" />
                {user ? (
                  <UserMenu />
                ) : (
                  <div className="flex flex-col gap-2">
                    <Button variant="ghost" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/login">Log in</Link>
                    </Button>
                    <Button variant="secondary" asChild onClick={() => setMobileOpen(false)}>
                      <Link href="/signup">Sign Up</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
