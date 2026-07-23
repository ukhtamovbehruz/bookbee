"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  CloudDownload,
  BookText,
  Infinity as InfinityIcon,
  Sparkles,
  LineChart,
  ShieldOff,
  Copy,
  Clock,
  Tag,
  Mail,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/AuthProvider";
import {
  getPremiumStatus,
  requestPremium,
  onPremiumChanged,
  type PremiumStatus,
  type PremiumPlan,
} from "@/lib/premium";
import { getPremiumSettings, isPromoCodeExpired, formatSom } from "@/lib/premium-settings";
import { onCatalogChanged } from "@/lib/mock-data/catalog-events";
import { staggerContainer, slideUp } from "@/animations/variants";
import { cn } from "@/lib/utils";

const BENEFITS = [
  {
    icon: ShieldOff,
    title: "No Ads",
    description: "Uninterrupted listening, from start to finish.",
    className: "bg-blue-500",
  },
  {
    icon: CloudDownload,
    title: "Offline Listening",
    description: "Download audiobooks and listen without a connection.",
    className: "bg-emerald-500",
  },
  {
    icon: BookText,
    title: "Offline Reading",
    description: "Save e-book companions to read anywhere, anytime.",
    className: "bg-amber-500",
  },
  {
    icon: InfinityIcon,
    title: "Unlimited Downloads",
    description: "No caps — fill your library without limits.",
    className: "bg-violet-500",
  },
  {
    icon: Sparkles,
    title: "AI Summary",
    description: "Get instant chapter summaries powered by AI.",
    className: "bg-pink-500",
  },
  {
    icon: LineChart,
    title: "Listening Statistics",
    description: "Track your habits, streaks, and time listened.",
    className: "bg-teal-500",
  },
];

export default function PremiumPage() {
  const { user } = useAuth();
  const [status, setStatus] = useState<PremiumStatus>("none");
  const [settings, setSettings] = useState(getPremiumSettings());
  const [plan, setPlan] = useState<PremiumPlan>("yearly");
  const [promoInput, setPromoInput] = useState("");
  const [appliedPromo, setAppliedPromo] = useState<{ code: string; discountPercent: number } | null>(
    null,
  );

  useEffect(() => {
    const refreshStatus = () => setStatus(getPremiumStatus());
    refreshStatus();
    return onPremiumChanged(refreshStatus);
  }, []);

  useEffect(() => onCatalogChanged(() => setSettings(getPremiumSettings())), []);

  const basePrice = plan === "yearly" ? settings.priceYearlySom : settings.priceMonthlySom;
  const finalPrice = appliedPromo
    ? basePrice * (1 - appliedPromo.discountPercent / 100)
    : basePrice;

  const yearlySavingsPercent = useMemo(() => {
    const fullYearAtMonthly = settings.priceMonthlySom * 12;
    if (fullYearAtMonthly <= 0) return 0;
    return Math.max(
      0,
      Math.round((1 - settings.priceYearlySom / fullYearAtMonthly) * 100),
    );
  }, [settings.priceMonthlySom, settings.priceYearlySom]);

  function applyPromo() {
    const code = promoInput.trim().toUpperCase();
    if (!code) return;
    const match = settings.promoCodes.find((p) => p.code.toUpperCase() === code);
    if (!match) {
      toast.error("Promo kod topilmadi.");
      return;
    }
    if (isPromoCodeExpired(match)) {
      toast.error("Promo kod muddati tugagan.");
      return;
    }
    setAppliedPromo({ code: match.code, discountPercent: match.discountPercent });
    toast.success(`Promo kod qo'llandi: -${match.discountPercent}%`);
  }

  async function handleRequest() {
    if (!user) {
      toast.warning("Avval ro'yxatdan o'ting, keyin Premium so'rovini yuboring.");
      return;
    }
    const ok = await requestPremium(plan, appliedPromo?.code);
    if (ok) {
      toast.success("So'rov yuborildi! 24 soat ichida Premium faollashadi.");
    } else {
      toast.error("So'rovni yuborib bo'lmadi — internetni tekshirib qayta urinib ko'ring.");
    }
  }

  function copyCard() {
    navigator.clipboard
      .writeText(settings.cardNumber)
      .then(() => toast.success("Karta raqami nusxalandi."))
      .catch(() => toast.error("Nusxalab bo'lmadi — qo'lda nusxalang."));
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center text-center"
      >
        <motion.div
          className="relative flex size-20 items-center justify-center"
          animate={{ rotate: 360 }}
          transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
        >
          <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/40 via-secondary/30 to-primary/40 blur-xl" />
        </motion.div>
        <span className="-mt-16 flex size-16 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-[#f9d35c] text-[#17130a] shadow-lg shadow-primary/30">
          <Crown className="size-8" />
        </span>
        <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">
          BookBee Premium
        </h1>
        <p className="mt-2 max-w-md text-muted-foreground">
          Listen without limits. Read without interruption.
        </p>
      </motion.div>

      {/* Benefits */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={staggerContainer}
        className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2"
      >
        {BENEFITS.map((benefit) => {
          const Icon = benefit.icon;
          return (
            <motion.div
              key={benefit.title}
              variants={slideUp}
              className="glass flex items-center gap-4 rounded-2xl p-4"
            >
              <span
                className={cn(
                  "flex size-11 shrink-0 items-center justify-center rounded-xl text-white shadow-md",
                  benefit.className,
                )}
              >
                <Icon className="size-5" />
              </span>
              <div>
                <p className="font-semibold text-foreground">{benefit.title}</p>
                <p className="text-sm text-muted-foreground">{benefit.description}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Status / payment card */}
      <div className="relative mt-10 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#1c1710] via-card to-[#1b1530] p-6 sm:p-8">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-24 right-[-6rem] size-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -bottom-24 left-[-6rem] size-72 rounded-full bg-secondary/25 blur-3xl"
        />

        {status === "active" ? (
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
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
          <div className="relative flex items-center gap-3">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <Clock className="size-5" />
            </span>
            <div>
              <p className="font-semibold">Sizning so&apos;rovingiz ko&apos;rib chiqilmoqda</p>
              <p className="text-sm text-muted-foreground">
                24 soat ichida Premium a&apos;zolik faollashadi.
              </p>
            </div>
          </div>
        ) : (
          <div className="relative space-y-6">
            {status === "rejected" && (
              <p className="text-sm text-destructive">
                Oldingi so&apos;rovingiz tasdiqlanmadi. Iltimos, qayta urinib ko&apos;ring.
              </p>
            )}

            {/* Plan toggle */}
            <div className="relative mx-auto flex w-full max-w-xs rounded-full bg-muted p-1">
              {(["monthly", "yearly"] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPlan(p)}
                  className="relative flex-1 rounded-full px-4 py-2 text-sm font-semibold transition-colors"
                >
                  {plan === p && (
                    <motion.span
                      layoutId="plan-toggle-pill"
                      className="absolute inset-0 rounded-full bg-primary"
                      transition={{ type: "spring", duration: 0.4 }}
                    />
                  )}
                  <span
                    className={cn(
                      "relative z-10",
                      plan === p ? "text-primary-foreground" : "text-muted-foreground",
                    )}
                  >
                    {p === "monthly" ? "Oylik" : "Yillik"}
                  </span>
                </button>
              ))}
            </div>
            {plan === "yearly" && yearlySavingsPercent > 0 && (
              <p className="text-center text-xs font-semibold text-primary">
                Yillikda {yearlySavingsPercent}% tejang
              </p>
            )}

            {/* Price */}
            <div className="text-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={`${plan}-${appliedPromo?.code ?? "none"}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="text-2xl font-bold text-primary"
                >
                  {formatSom(finalPrice)}
                  <span className="text-sm font-normal text-muted-foreground">
                    {" "}
                    / {plan === "monthly" ? "oy" : "yil"}
                  </span>
                </motion.p>
              </AnimatePresence>
              {appliedPromo && (
                <p className="mt-1 text-xs text-muted-foreground line-through">
                  {formatSom(basePrice)}
                </p>
              )}
            </div>

            {/* Promo code */}
            <div className="mx-auto flex max-w-sm items-center gap-2">
              <div className="relative flex-1">
                <Tag className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Promo kod"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Button variant="outline" onClick={applyPromo}>
                Qo&apos;llash
              </Button>
            </div>

            {/* Card + apps */}
            <div className="glass space-y-4 rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-sm text-muted-foreground">Kartaga o&apos;tkazing</p>
                  <p className="font-mono text-lg font-semibold tracking-wider">
                    {settings.cardNumber}
                  </p>
                  {settings.cardHolder && (
                    <p className="text-xs text-muted-foreground">{settings.cardHolder}</p>
                  )}
                </div>
                <Button variant="outline" size="sm" className="gap-1.5" onClick={copyCard}>
                  <Copy className="size-3.5" />
                  Nusxalash
                </Button>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <a
                  href={settings.clickUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center rounded-md bg-[#1BA1E2] px-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Click
                </a>
                <a
                  href={settings.paymeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-8 items-center rounded-md bg-[#00CDD1] px-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                >
                  Payme
                </a>
                <span className="text-xs text-muted-foreground">
                  Shu ilovalar orqali yuqoridagi kartaga to&apos;lang
                </span>
              </div>
            </div>

            <Button
              size="lg"
              className="h-12 w-full rounded-full text-base"
              onClick={handleRequest}
            >
              To&apos;lov qildim
            </Button>
            {!user && (
              <p className="text-center text-xs text-muted-foreground">
                <Link href="/signup" className="underline">
                  Ro&apos;yxatdan o&apos;ting
                </Link>{" "}
                — akkountingizni Premium qilish uchun kerak.
              </p>
            )}
          </div>
        )}
      </div>

      {/* Support */}
      <div className="mt-8 flex flex-col items-center gap-2 text-center text-sm text-muted-foreground">
        <p>Muammo yuzaga kelsa, biz bilan bog&apos;laning:</p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <a
            href={`mailto:${settings.supportEmail}`}
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Mail className="size-4" />
            {settings.supportEmail}
          </a>
          <a
            href={`https://t.me/${settings.supportTelegram}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 hover:text-foreground"
          >
            <Send className="size-4" />@{settings.supportTelegram}
          </a>
        </div>
      </div>
    </div>
  );
}
