"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  BellRing,
  CreditCard,
  Crown,
  Flame,
  Headphones,
  Library,
  Pencil,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CountUp } from "@/components/shared/CountUp";
import { ActivityCard } from "@/components/activity/ActivityCard";
import { useAuth } from "@/context/AuthProvider";
import { getActivityStreak } from "@/lib/activity";
import { getLibraryEntries } from "@/lib/library";
import { getCatalogBookById } from "@/lib/mock-data/catalog";
import { getProfile, setProfile } from "@/lib/profile";
import { cn } from "@/lib/utils";

type Tab = "account" | "security" | "billing" | "notifications";

const TABS: { id: Tab; label: string; icon: typeof UserRound }[] = [
  { id: "account", label: "Account", icon: UserRound },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "billing", label: "Billing", icon: CreditCard },
  { id: "notifications", label: "Notifications", icon: BellRing },
];

export default function ProfilePage() {
  const { user, isReady, signOut, updateName } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("account");
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [avatar, setAvatar] = useState("");
  const [stats, setStats] = useState({ streak: 0, finished: 0, hours: 0 });
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isReady && !user) router.replace("/login");
  }, [isReady, user, router]);

  useEffect(() => {
    if (!user) return;
    setName(user.name);
    const profile = getProfile();
    setBio(profile.bio);
    setAvatar(profile.avatar);

    const entries = getLibraryEntries();
    const finished = entries.filter((e) => e.certificateEarned);
    const listenedSec = finished.reduce((total, e) => {
      const book = getCatalogBookById(e.bookId);
      return total + (book?.durationSec ?? 0);
    }, 0);
    setStats({
      streak: getActivityStreak(),
      finished: finished.length,
      hours: Math.round(listenedSec / 3600),
    });
  }, [user]);

  function handleAvatarFile(file: File) {
    if (!file.type.startsWith("image/")) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = String(reader.result);
      setAvatar(dataUrl);
      setProfile({ avatar: dataUrl });
      toast.success("Profile picture updated.");
    };
    reader.readAsDataURL(file);
  }

  const initials = useMemo(
    () =>
      (user?.name ?? "")
        .split(" ")
        .map((p) => p[0])
        .slice(0, 2)
        .join("")
        .toUpperCase(),
    [user?.name],
  );

  if (!isReady || !user) return null;

  const STAT_CARDS = [
    { label: "Reading Streak", value: stats.streak, unit: "days", icon: Flame },
    { label: "Books Finished", value: stats.finished, unit: "volumes", icon: Library },
    { label: "Total Listening", value: stats.hours, unit: "hours", icon: Headphones },
  ];

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        {/* left column */}
        <aside className="flex flex-col gap-6">
          <div className="glass flex flex-col items-center rounded-2xl p-6 text-center">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group relative rounded-full"
              aria-label="Change profile picture"
            >
              <Avatar size="lg" className="size-20">
                {avatar ? (
                  <AvatarImage src={avatar} alt={user.name} />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-xl text-primary">
                    {initials}
                  </AvatarFallback>
                )}
              </Avatar>
              <span className="absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform group-hover:scale-110">
                <Pencil className="size-3.5" />
              </span>
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleAvatarFile(file);
                e.target.value = "";
              }}
            />
            <p className="mt-4 font-semibold">{user.name}</p>
            <Badge variant="secondary" className="mt-2 gap-1">
              <Crown className="size-3" />
              Premium Member
            </Badge>
          </div>

          <nav className="glass flex flex-col gap-1 rounded-2xl p-2">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    tab === t.id
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-white/5 hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {t.label}
                </button>
              );
            })}
            <button
              type="button"
              onClick={() => {
                signOut();
                router.push("/");
              }}
              className="mt-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-destructive transition-colors hover:bg-destructive/10"
            >
              <UserRound className="size-4" />
              Sign Out
            </button>
          </nav>
        </aside>

        {/* right column */}
        <div className="flex flex-col gap-6">
          <ActivityCard />

          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 gap-4 sm:grid-cols-3"
          >
            {STAT_CARDS.map((stat) => {
              const Icon = stat.icon;
              return (
                <motion.div
                  key={stat.label}
                  variants={{
                    hidden: { opacity: 0, y: 16 },
                    visible: { opacity: 1, y: 0 },
                  }}
                  className="glass rounded-2xl p-5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <Icon className="size-4 text-primary" />
                  </div>
                  <p className="mt-2 text-3xl font-bold tabular-nums">
                    <CountUp value={stat.value} />
                    <span className="ml-1 text-sm font-normal text-muted-foreground">
                      {stat.unit}
                    </span>
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {tab === "account" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Personal Information</h2>
              <form
                className="mt-5 space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  updateName(name);
                  setProfile({ bio });
                  toast.success("Profile updated.");
                }}
              >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-name">Full Name</Label>
                    <Input
                      id="profile-name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="profile-email">Email Address</Label>
                    <Input id="profile-email" value={user.email} disabled />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="profile-bio">Bio</Label>
                  <Textarea
                    id="profile-bio"
                    rows={3}
                    placeholder="Tell us what you love to listen to..."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="ghost" onClick={() => setName(user.name)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </div>
          )}

          {tab === "security" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Security</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Keep your account secure. Password changes are handled by your
                identity provider in this demo.
              </p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => toast.info("Password reset link sent to your email.")}
              >
                Change password
              </Button>
            </div>
          )}

          {tab === "billing" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Billing</h2>
              <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/10 p-5 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <Crown className="size-5" />
                  </span>
                  <div>
                    <p className="font-semibold">Pro Plan</p>
                    <p className="text-sm text-muted-foreground">$12.00 / month</p>
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    Next billing:{" "}
                    <span className="text-foreground">Aug 6, 2026</span>
                  </p>
                  <p>
                    Payment method:{" "}
                    <span className="text-foreground">•••• 4242</span>
                  </p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Button onClick={() => toast.info("Plan management coming soon.")}>
                  Manage Plan
                </Button>
                <Button variant="ghost" onClick={() => toast.info("No transactions yet.")}>
                  View Transaction History
                </Button>
              </div>
            </div>
          )}

          {tab === "notifications" && (
            <div className="glass rounded-2xl p-6">
              <h2 className="text-lg font-semibold">Notifications</h2>
              <div className="mt-4 space-y-3">
                {["New releases in your categories", "Streak reminders", "Weekly listening recap"].map(
                  (label) => (
                    <label
                      key={label}
                      className="flex items-center justify-between rounded-xl border border-white/10 px-4 py-3 text-sm"
                    >
                      {label}
                      <input type="checkbox" defaultChecked className="size-4 accent-[var(--primary)]" />
                    </label>
                  ),
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
