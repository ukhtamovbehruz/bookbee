"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import {
  CloudDownload,
  BookText,
  Infinity as InfinityIcon,
  Sparkles,
  LineChart,
  ShieldOff,
  Crown,
  Copy,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthProvider";
import {
  getPremiumStatus,
  requestPremium,
  onPremiumChanged,
  type PremiumStatus,
} from "@/lib/premium";
import { getPremiumSettings } from "@/lib/premium-settings";
import { onCatalogChanged } from "@/lib/mock-data/catalog-events";

const BENEFITS = [
  {
    icon: CloudDownload,
    title: "Offline Listening",
    description: "Download audiobooks and listen without a connection.",
  },
  {
    icon: BookText,
    title: "Offline Reading",
    description: "Save e-book companions to read anywhere, anytime.",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited Downloads",
    description: "No caps — fill your library without limits.",
  },
  {
    icon: Sparkles,
    title: "AI Summary",
    description: "Get instant chapter summaries powered by AI.",
  },
  {
    icon: LineChart,
    title: "Listening Statistics",
    description: "Track your habits, streaks, and time listened.",
  },
  {
    icon: ShieldOff,
    title: "No Ads",
    description: "Uninterrupted listening, from start to finish.",
  },
];

function PaymentBrandPill({ label, className }: { label: string; className: string }) {
  return (
    <span
      className={`inline-flex h-7 items-center rounded-md px-2.5 text-xs font-bold text-white ${className}`}
    >
      {label}
    </span>
  );
}

export function PremiumBanner() {
  const { user } = useAuth();
  const [status, setStatus] = useState<PremiumStatus>("none");
  const [settings, setSettings] = useState(getPremiumSettings());

  useEffect(() => {
    const refreshStatus = () => setStatus(getPremiumStatus());
    refreshStatus();
    return onPremiumChanged(refreshStatus);
  }, []);

  useEffect(() => onCatalogChanged(() => setSettings(getPremiumSettings())), []);

  function handleRequest() {
    if (!user) {
      toast.warning("Sign up free first, then request Premium.");
      return;
    }
    requestPremium();
    toast.success("Request sent! We'll activate Premium within 24 hours.");
  }

  function copyCard() {
    navigator.clipboard
      .writeText(settings.cardNumber)
      .then(() => toast.success("Card number copied."))
      .catch(() => toast.error("Couldn't copy — please copy it manually."));
  }

  return (
    <section
      id="premium"
      className="mx-auto max-w-7xl scroll-mt-20 px-4 sm:px-6 lg:px-8"
    >
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1710] via-card to-[#1b1530] p-6 sm:p-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-[-6rem] size-72 rounded-full bg-secondary/25 blur-3xl"
        />

        <div className="relative flex flex-col items-start gap-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-primary/15 px-3 py-1 text-sm font-semibold text-primary">
            <Crown className="size-4" />
            BookBee Premium
          </span>
          <h2 className="max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">
            Listen without limits. Read without interruption.
          </h2>

          <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {BENEFITS.map((benefit) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={benefit.title}
                  className="glass flex items-start gap-3 rounded-2xl p-4"
                >
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
                    <Icon className="size-4.5" />
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {benefit.title}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {status === "active" ? (
            <div className="glass flex w-full items-center gap-3 rounded-2xl p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Crown className="size-5" />
              </span>
              <div>
                <p className="font-semibold">You&apos;re a Premium member</p>
                <p className="text-sm text-muted-foreground">
                  Thanks for supporting BookBee — enjoy every title, ad-free.
                </p>
              </div>
            </div>
          ) : status === "pending" ? (
            <div className="glass flex w-full items-center gap-3 rounded-2xl p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Clock className="size-5" />
              </span>
              <div>
                <p className="font-semibold">Your request is under review</p>
                <p className="text-sm text-muted-foreground">
                  We&apos;ll activate your Premium membership within 24 hours.
                </p>
              </div>
            </div>
          ) : (
            <div className="glass w-full space-y-4 rounded-2xl p-5">
              {status === "rejected" && (
                <p className="text-sm text-destructive">
                  Your last request couldn&apos;t be confirmed. Please try again.
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Transfer to card</p>
                  <p className="font-mono text-lg font-semibold tracking-wider">
                    {settings.cardNumber}
                  </p>
                  {settings.cardHolder && (
                    <p className="text-xs text-muted-foreground">{settings.cardHolder}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={copyCard}>
                  <Copy className="size-3.5" />
                  Copy
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <PaymentBrandPill label="Click" className="bg-[#1BA1E2]" />
                <PaymentBrandPill label="Payme" className="bg-[#00CDD1]" />
                <span className="text-xs text-muted-foreground">
                  Pay via either app to the card above
                </span>
              </div>
              <p className="text-sm font-semibold text-primary">{settings.priceLabel}</p>
              <Button size="lg" className="h-12 rounded-full px-8 text-base" onClick={handleRequest}>
                I&apos;ve paid
              </Button>
              {!user && (
                <p className="text-xs text-muted-foreground">
                  <Link href="/signup" className="underline">
                    Sign up
                  </Link>{" "}
                  first so we know whose account to upgrade.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
