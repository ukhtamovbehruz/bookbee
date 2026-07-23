"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Award,
  BookOpen,
  Check,
  Crown,
  GraduationCap,
  Headphones,
  LayoutGrid,
  Library as LibraryIcon,
  LogOut,
  Pencil,
  PlayCircle,
  Plus,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogoIcon } from "@/components/layout/LogoIcon";
import { DonutChart } from "@/components/admin/Charts";
import { BookFormDialog } from "@/components/admin/BookFormDialog";
import { CollectionFormDialog } from "@/components/admin/CollectionFormDialog";
import { QuizEditorDialog } from "@/components/admin/QuizEditorDialog";
import { CountUp } from "@/components/shared/CountUp";
import { useAdminSession } from "@/hooks/useAdminSession";
import { ADMIN_PASSWORD } from "@/lib/admin";
import { categories } from "@/lib/mock-data/categories";
import { getAdminBooks, deleteBook, saveBookEdit, onCatalogChanged } from "@/lib/mock-data/catalog";
import { getAllCollections, deleteCollection } from "@/lib/mock-data/curation";
import { getPlatformMetrics, timeAgo } from "@/lib/metrics";
import {
  getPremiumSettings,
  savePremiumSettings,
  isPromoCodeExpired,
  type PremiumSettings,
  type PromoCode,
} from "@/lib/premium-settings";
import { cn, formatDuration } from "@/lib/utils";
import type { Book, Collection } from "@/lib/types";

type Section = "insights" | "library" | "users" | "premium" | "curation" | "settings";

const NAV: { id: Section; label: string; icon: typeof LayoutGrid }[] = [
  { id: "insights", label: "Insights", icon: LayoutGrid },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "premium", label: "Premium", icon: Crown },
  { id: "curation", label: "Curation", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

interface PremiumRequest {
  user_id: string;
  email: string;
  name: string;
  status: "none" | "pending" | "active" | "rejected";
  plan: "monthly" | "yearly";
  promo_code: string | null;
  expires_at: string | null;
  requested_at: string | null;
  updated_at: string;
}

const ACTIVITY_ICON = {
  title: BookOpen,
  library: LibraryIcon,
  certificate: Award,
  rating: Star,
} as const;

export default function AdminDashboardPage() {
  const { isAdmin, isReady, logout } = useAdminSession();
  const router = useRouter();
  const [section, setSection] = useState<Section>("insights");
  const [tick, setTick] = useState(0);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [collectionDialogOpen, setCollectionDialogOpen] = useState(false);
  const [editingCollection, setEditingCollection] = useState<Collection | null>(null);
  const [quizBook, setQuizBook] = useState<Book | null>(null);
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState<{ name: string; email: string; avatar: string }[]>([]);
  const [usersError, setUsersError] = useState<string | null>(null);
  const [premiumRequests, setPremiumRequests] = useState<PremiumRequest[]>([]);
  const [premiumError, setPremiumError] = useState<string | null>(null);
  const [premiumForm, setPremiumForm] = useState<PremiumSettings>(getPremiumSettings());
  const [savingPremiumForm, setSavingPremiumForm] = useState(false);

  function updatePromoCode(index: number, patch: Partial<PromoCode>) {
    setPremiumForm((prev) => ({
      ...prev,
      promoCodes: prev.promoCodes.map((p, i) => (i === index ? { ...p, ...patch } : p)),
    }));
  }

  function addPromoCode() {
    setPremiumForm((prev) => ({
      ...prev,
      promoCodes: [...prev.promoCodes, { code: "", discountPercent: 10, expiresAt: null }],
    }));
  }

  function removePromoCode(index: number) {
    setPremiumForm((prev) => ({
      ...prev,
      promoCodes: prev.promoCodes.filter((_, i) => i !== index),
    }));
  }

  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/admin/login");
  }, [isReady, isAdmin, router]);

  // Registered members live in Supabase Auth, not this browser. Fetch them
  // through the server route (guarded by the admin secret) so the panel shows
  // everyone who signed up on any device.
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetch("/api/admin/users", { headers: { "x-admin-secret": ADMIN_PASSWORD } })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setUsersError(json.error ?? "Failed to load users.");
          setUsers([]);
          return;
        }
        setUsersError(null);
        setUsers(json.users ?? []);
      })
      .catch((err) => {
        if (active) setUsersError(String(err));
      });
    return () => {
      active = false;
    };
  }, [isAdmin, tick]);

  // Premium membership requests — there's no payment gateway yet, so these
  // are manual card-transfer requests waiting on admin approve/reject.
  useEffect(() => {
    if (!isAdmin) return;
    let active = true;
    fetch("/api/admin/premium", { headers: { "x-admin-secret": ADMIN_PASSWORD } })
      .then(async (res) => {
        const json = await res.json().catch(() => ({}));
        if (!active) return;
        if (!res.ok) {
          setPremiumError(json.error ?? "Failed to load premium requests.");
          setPremiumRequests([]);
          return;
        }
        setPremiumError(null);
        setPremiumRequests(json.requests ?? []);
      })
      .catch((err) => {
        if (active) setPremiumError(String(err));
      });
    return () => {
      active = false;
    };
  }, [isAdmin, tick]);

  const refresh = () => setTick((t) => t + 1);

  async function reviewPremiumRequest(
    userId: string,
    action: "approve" | "reject",
    plan: "monthly" | "yearly",
  ) {
    const res = await fetch("/api/admin/premium", {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_PASSWORD },
      body: JSON.stringify({ userId, action, plan }),
    });
    if (!res.ok) {
      toast.error("Couldn't update this request — please try again.");
      return;
    }
    toast.success(action === "approve" ? "Member upgraded to Premium." : "Request rejected.");
    refresh();
  }

  async function handleSavePremiumForm() {
    setSavingPremiumForm(true);
    try {
      await savePremiumSettings(premiumForm);
      toast.success("Premium payment details updated.");
    } catch {
      toast.error("Couldn't save — please try again.");
    } finally {
      setSavingPremiumForm(false);
    }
  }

  // The catalog cache hydrates from Supabase asynchronously after this page
  // mounts, so re-render once that hydration (or any other admin's edit)
  // lands — otherwise a fresh session briefly shows stale/empty data.
  useEffect(() => onCatalogChanged(refresh), []);
  useEffect(() => onCatalogChanged(() => setPremiumForm(getPremiumSettings())), []);

  const adminBooks = useMemo(
    () => (isAdmin ? getAdminBooks() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, tick],
  );
  const collections = useMemo(
    () => (isAdmin ? getAllCollections() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, tick],
  );

  if (!isReady || !isAdmin) return null;

  const metrics = getPlatformMetrics();
  const topGenre = metrics.genreDistribution[0];
  const totalGenreTitles = metrics.genreDistribution.reduce((s, g) => s + g.value, 0);
  const topShare =
    topGenre && totalGenreTitles > 0
      ? Math.round((topGenre.value / totalGenreTitles) * 100)
      : 0;

  const filteredBooks = adminBooks.filter((b) =>
    `${b.title} ${b.author}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const STATS = [
    { label: "Total Plays", value: metrics.totalPlays, decimals: 0, icon: PlayCircle },
    { label: "Registered Users", value: users.length, decimals: 0, icon: UsersIcon },
    { label: "Total Titles", value: metrics.totalTitles, decimals: 0, icon: BookOpen },
    { label: "Certificates Issued", value: metrics.certificatesIssued, decimals: 0, icon: Award },
  ];

  return (
    <div className="flex min-h-dvh bg-background">
      {/* sidebar */}
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col justify-between border-r border-border p-4 lg:flex">
        <div>
          <div className="flex items-center gap-2 px-2 py-2">
            <LogoIcon className="size-7" />
            <span className="font-bold">bookbee</span>
            <Badge variant="secondary" className="ml-1 text-[10px]">
              Admin
            </Badge>
          </div>

          <nav className="mt-6 space-y-1">
            {NAV.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSection(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors",
                    section === item.id
                      ? "bg-primary/15 font-medium text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  <Icon className="size-4" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <Button
            className="mt-6 w-full gap-2 rounded-full"
            onClick={() => {
              setEditingBook(undefined);
              setBookDialogOpen(true);
            }}
          >
            <Plus className="size-4" />
            Add New Title
          </Button>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 rounded-xl px-2 py-2">
            <span className="flex size-8 items-center justify-center rounded-full bg-primary/20 text-xs font-semibold text-primary">
              SA
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium">Admin user</p>
              <p className="truncate text-xs text-muted-foreground">Super Admin</p>
            </div>
          </div>
          <div className="flex gap-1">
            <Button variant="ghost" size="sm" className="flex-1" asChild>
              <Link href="/">Site</Link>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="flex-1 gap-1.5"
              onClick={() => {
                logout();
                router.push("/admin/login");
              }}
            >
              <LogOut className="size-4" />
              Exit
            </Button>
          </div>
        </div>
      </aside>

      {/* main */}
      <main className="flex-1 overflow-x-hidden px-4 py-8 sm:px-8">
        {/* mobile section switcher */}
        <div className="mb-6 flex gap-2 overflow-x-auto lg:hidden">
          {NAV.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSection(item.id)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-sm",
                section === item.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        {section === "insights" && (
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
            className="max-w-5xl space-y-6"
          >
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Platform Insights</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Live metrics from real activity on BookBee. Numbers grow as members
                sign up, listen, and rate.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATS.map((stat) => {
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
                    <p className="mt-3 text-3xl font-bold tabular-nums">
                      <CountUp value={stat.value} decimals={stat.decimals} />
                    </p>
                  </motion.div>
                );
              })}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="glass rounded-2xl p-5 lg:col-span-2"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Most Played Titles</h2>
                    <p className="text-xs text-muted-foreground">Ranked by real play count</p>
                  </div>
                  <Headphones className="size-4 text-muted-foreground" />
                </div>
                {metrics.mostPlayed.length === 0 ? (
                  <div className="mt-6 flex flex-col items-center justify-center gap-2 py-10 text-center">
                    <PlayCircle className="size-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      No listening activity yet.
                    </p>
                    <p className="text-xs text-muted-foreground/70">
                      Play counts appear here once members start listening.
                    </p>
                  </div>
                ) : (
                  <ol className="mt-4 space-y-2">
                    {metrics.mostPlayed.map((row, i) => {
                      const max = metrics.mostPlayed[0].plays || 1;
                      return (
                        <li key={row.book.id} className="flex items-center gap-3">
                          <span className="w-4 text-sm font-semibold text-muted-foreground">
                            {i + 1}
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-medium">{row.book.title}</p>
                            <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
                              <div
                                className="h-full rounded-full bg-primary"
                                style={{ width: `${(row.plays / max) * 100}%` }}
                              />
                            </div>
                          </div>
                          <span className="text-sm tabular-nums text-muted-foreground">
                            {row.plays}
                          </span>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </motion.div>

              <motion.div
                variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
                className="glass rounded-2xl p-5"
              >
                <h2 className="font-semibold">Catalog by Genre</h2>
                <p className="text-xs text-muted-foreground">Titles per category</p>
                <div className="mt-4">
                  <DonutChart
                    segments={metrics.genreDistribution}
                    centerLabel={`${topShare}%`}
                    centerSub={topGenre?.label}
                  />
                </div>
              </motion.div>
            </div>

            <motion.div
              variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0 } }}
              className="glass rounded-2xl p-5"
            >
              <h2 className="font-semibold">Recent Activity</h2>
              {metrics.recentActivity.length === 0 ? (
                <p className="mt-4 py-6 text-center text-sm text-muted-foreground">
                  No activity yet — new titles, saves, and certificates will show up here.
                </p>
              ) : (
                <div className="mt-3 divide-y divide-border text-sm">
                  {metrics.recentActivity.map((row) => {
                    const Icon = ACTIVITY_ICON[row.kind];
                    return (
                      <div key={row.id} className="flex items-center gap-3 py-3">
                        <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1">{row.text}</span>
                        <span className="text-xs text-muted-foreground">
                          {timeAgo(row.ts)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}

        {section === "library" && (
          <div className="max-w-5xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Library</h1>
                <p className="text-sm text-muted-foreground">
                  {adminBooks.length} titles — edit any field, cover, audio, or duration.
                </p>
              </div>
              <Button
                className="gap-2 rounded-full"
                onClick={() => {
                  setEditingBook(undefined);
                  setBookDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                Add title
              </Button>
            </div>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search titles or authors..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-9"
              />
            </div>

            <div className="space-y-2">
              {filteredBooks.map((book) => {
                const hidden = (book as Book & { hidden?: boolean }).hidden;
                return (
                  <div
                    key={book.id}
                    className={cn(
                      "glass flex items-center gap-4 rounded-2xl p-3",
                      hidden && "opacity-50",
                    )}
                  >
                    <div className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-muted">
                      <Image src={book.coverUrl} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <p className="truncate font-medium">{book.title}</p>
                        {book.isPremium && (
                          <Badge className="bg-primary text-primary-foreground text-[10px]">Premium</Badge>
                        )}
                        {hidden && <Badge variant="secondary" className="text-[10px]">Hidden</Badge>}
                      </div>
                      <p className="truncate text-xs text-muted-foreground">
                        {book.author} · {formatDuration(book.durationSec)} ·{" "}
                        {book.categoryIds
                          .map((id) => categories.find((c) => c.id === id)?.name)
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit questions for ${book.title}`}
                        onClick={() => setQuizBook(book)}
                      >
                        <GraduationCap className="size-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Edit ${book.title}`}
                        onClick={() => {
                          setEditingBook(book);
                          setBookDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-4" />
                      </Button>
                      {hidden ? (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Restore ${book.title}`}
                          onClick={async () => {
                            await saveBookEdit(book.id, { hidden: false });
                            refresh();
                            toast.success(`Restored "${book.title}".`);
                          }}
                        >
                          <RotateCcw className="size-4 text-primary" />
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={`Remove ${book.title}`}
                          onClick={async () => {
                            await deleteBook(book.id);
                            refresh();
                            toast.info(`Removed "${book.title}".`);
                          }}
                        >
                          <Trash2 className="size-4 text-destructive" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {section === "curation" && (
          <div className="max-w-5xl space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight">Curation</h1>
                <p className="text-sm text-muted-foreground">
                  Create, edit, or remove collections — covers, details, and their books.
                </p>
              </div>
              <Button
                className="gap-2 rounded-full"
                onClick={() => {
                  setEditingCollection(null);
                  setCollectionDialogOpen(true);
                }}
              >
                <Plus className="size-4" />
                New collection
              </Button>
            </div>
            {collections.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <Sparkles className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">No collections yet.</p>
                <p className="text-xs text-muted-foreground/70">
                  Create one to feature it on the homepage.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {collections.map((collection) => (
                  <div key={collection.id} className="glass flex items-center gap-4 rounded-2xl p-4">
                    <div
                      className="relative size-16 shrink-0 overflow-hidden rounded-xl"
                      style={{ background: `${collection.colorHex}33` }}
                    >
                      {collection.coverUrl ? (
                        <Image src={collection.coverUrl} alt="" fill sizes="64px" className="object-cover" />
                      ) : (
                        <Sparkles
                          className="absolute inset-0 m-auto size-6"
                          style={{ color: collection.colorHex }}
                        />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{collection.title}</p>
                      <p className="text-xs text-muted-foreground">{collection.bookIds.length} books</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="gap-1.5"
                        onClick={() => {
                          setEditingCollection(collection);
                          setCollectionDialogOpen(true);
                        }}
                      >
                        <Pencil className="size-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Delete ${collection.title}`}
                        onClick={async () => {
                          await deleteCollection(collection.id);
                          refresh();
                          toast.info(`Removed "${collection.title}".`);
                        }}
                      >
                        <Trash2 className="size-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {section === "users" && (
          <div className="max-w-4xl space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
              <p className="text-sm text-muted-foreground">
                {users.length} {users.length === 1 ? "member" : "members"}
              </p>
            </div>
            {usersError ? (
              <div className="glass rounded-2xl p-10 text-center">
                <UsersIcon className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  Couldn&apos;t load members from Supabase.
                </p>
                <p className="text-xs text-muted-foreground/70">{usersError}</p>
              </div>
            ) : users.length === 0 ? (
              <div className="glass rounded-2xl p-10 text-center">
                <UsersIcon className="mx-auto size-8 text-muted-foreground/50" />
                <p className="mt-3 text-sm text-muted-foreground">
                  No registered members yet.
                </p>
                <p className="text-xs text-muted-foreground/70">
                  Accounts appear here as people sign up.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {users.map((u, i) => {
                  const avatar = u.avatar;
                  const initials = u.name
                    .split(" ")
                    .map((p) => p[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase();
                  return (
                    <div key={`${u.email}-${i}`} className="glass flex items-center gap-3 rounded-2xl p-4">
                      <Avatar className="size-11">
                        {avatar ? (
                          <AvatarImage src={avatar} alt={u.name} />
                        ) : (
                          <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                            {initials}
                          </AvatarFallback>
                        )}
                      </Avatar>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{u.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                      </div>
                      <Badge variant="secondary" className="text-[10px]">Listener</Badge>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {section === "premium" && (
          <div className="max-w-3xl space-y-8">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Premium</h1>
              <p className="text-sm text-muted-foreground">
                No payment gateway yet — members transfer to the card below and
                request Premium; approve or reject them here.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">Requests</h2>
              {premiumError ? (
                <div className="glass rounded-2xl p-10 text-center">
                  <Crown className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">
                    Couldn&apos;t load requests from Supabase.
                  </p>
                  <p className="text-xs text-muted-foreground/70">{premiumError}</p>
                </div>
              ) : premiumRequests.length === 0 ? (
                <div className="glass rounded-2xl p-10 text-center">
                  <Crown className="mx-auto size-8 text-muted-foreground/50" />
                  <p className="mt-3 text-sm text-muted-foreground">No requests yet.</p>
                </div>
              ) : (
                <div className="glass divide-y divide-border rounded-2xl">
                  {premiumRequests.map((r) => {
                    const isExpired =
                      r.status === "active" &&
                      r.expires_at !== null &&
                      new Date(r.expires_at) < new Date();
                    const displayStatus = isExpired ? "expired" : r.status;
                    return (
                    <div key={r.user_id} className="flex items-center gap-3 p-4">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {r.email} · {r.plan}
                          {r.promo_code ? ` · ${r.promo_code}` : ""}
                          {r.status === "active" && r.expires_at
                            ? ` · ${isExpired ? "expired" : "expires"} ${new Date(r.expires_at).toLocaleDateString()}`
                            : ""}
                        </p>
                      </div>
                      <Badge
                        variant={
                          displayStatus === "active"
                            ? "default"
                            : displayStatus === "pending"
                              ? "secondary"
                              : "outline"
                        }
                        className="text-[10px] capitalize"
                      >
                        {displayStatus}
                      </Badge>
                      {r.status === "pending" && (
                        <div className="flex items-center gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Approve ${r.name}`}
                            onClick={() => reviewPremiumRequest(r.user_id, "approve", r.plan)}
                          >
                            <Check className="size-4 text-primary" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            aria-label={`Reject ${r.name}`}
                            onClick={() => reviewPremiumRequest(r.user_id, "reject", r.plan)}
                          >
                            <X className="size-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-muted-foreground">
                Payment details shown to members
              </h2>
              <div className="glass space-y-4 rounded-2xl p-6">
                <div className="space-y-1.5">
                  <Label htmlFor="pf-card">Card number</Label>
                  <Input
                    id="pf-card"
                    value={premiumForm.cardNumber}
                    onChange={(e) =>
                      setPremiumForm((prev) => ({ ...prev, cardNumber: e.target.value }))
                    }
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="pf-holder">Cardholder name</Label>
                  <Input
                    id="pf-holder"
                    value={premiumForm.cardHolder}
                    onChange={(e) =>
                      setPremiumForm((prev) => ({ ...prev, cardHolder: e.target.value }))
                    }
                  />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-monthly">Monthly price (so&apos;m)</Label>
                    <Input
                      id="pf-monthly"
                      type="number"
                      value={premiumForm.priceMonthlySom}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({
                          ...prev,
                          priceMonthlySom: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-yearly">Yearly price (so&apos;m)</Label>
                    <Input
                      id="pf-yearly"
                      type="number"
                      value={premiumForm.priceYearlySom}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({
                          ...prev,
                          priceYearlySom: Number(e.target.value) || 0,
                        }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-click">Click URL</Label>
                    <Input
                      id="pf-click"
                      value={premiumForm.clickUrl}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({ ...prev, clickUrl: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-payme">Payme URL</Label>
                    <Input
                      id="pf-payme"
                      value={premiumForm.paymeUrl}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({ ...prev, paymeUrl: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-email">Support email</Label>
                    <Input
                      id="pf-email"
                      value={premiumForm.supportEmail}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({ ...prev, supportEmail: e.target.value }))
                      }
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="pf-telegram">Support Telegram (without @)</Label>
                    <Input
                      id="pf-telegram"
                      value={premiumForm.supportTelegram}
                      onChange={(e) =>
                        setPremiumForm((prev) => ({ ...prev, supportTelegram: e.target.value }))
                      }
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>Promo codes</Label>
                  <div className="overflow-x-auto rounded-xl border border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border text-left text-xs text-muted-foreground">
                          <th className="p-2 font-medium">Promocode</th>
                          <th className="p-2 font-medium">Discount</th>
                          <th className="p-2 font-medium">Amal qilish muddati</th>
                          <th className="w-10 p-2" />
                        </tr>
                      </thead>
                      <tbody>
                        {premiumForm.promoCodes.map((p, i) => (
                          <tr key={i} className="border-b border-border last:border-0">
                            <td className="p-2">
                              <Input
                                value={p.code}
                                onChange={(e) =>
                                  updatePromoCode(i, { code: e.target.value.toUpperCase() })
                                }
                                placeholder="SUMMER10"
                                className="w-32"
                              />
                            </td>
                            <td className="p-2">
                              <div className="flex items-center gap-1">
                                <Input
                                  type="number"
                                  value={p.discountPercent}
                                  onChange={(e) =>
                                    updatePromoCode(i, {
                                      discountPercent: Number(e.target.value) || 0,
                                    })
                                  }
                                  className="w-20"
                                />
                                <span className="text-muted-foreground">%</span>
                              </div>
                            </td>
                            <td className="p-2">
                              <Input
                                type="date"
                                value={p.expiresAt ?? ""}
                                onChange={(e) =>
                                  updatePromoCode(i, { expiresAt: e.target.value || null })
                                }
                                className="w-40"
                              />
                              {isPromoCodeExpired(p) && (
                                <p className="mt-1 text-xs text-destructive">Expired</p>
                              )}
                            </td>
                            <td className="p-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                aria-label={`Remove ${p.code || "promo code"}`}
                                onClick={() => removePromoCode(i)}
                              >
                                <Trash2 className="size-4 text-destructive" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                        {premiumForm.promoCodes.length === 0 && (
                          <tr>
                            <td colSpan={4} className="p-4 text-center text-muted-foreground">
                              No promo codes yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1.5" onClick={addPromoCode}>
                    <Plus className="size-4" />
                    Add promo code
                  </Button>
                </div>
                <Button onClick={handleSavePremiumForm} disabled={savingPremiumForm}>
                  {savingPremiumForm ? "Saving..." : "Save"}
                </Button>
              </div>
            </div>
          </div>
        )}

        {section === "settings" && (
          <div className="max-w-2xl space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
              <p className="text-sm text-muted-foreground">Admin preferences and controls.</p>
            </div>
            <div className="glass space-y-4 rounded-2xl p-6 text-sm">
              <div className="flex items-center justify-between">
                <span>Platform name</span>
                <span className="text-muted-foreground">BookBee</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Admin access</span>
                <span className="text-muted-foreground">/admin (URL only)</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Data storage</span>
                <span className="text-muted-foreground">Supabase Auth + local</span>
              </div>
              <Button
                variant="outline"
                className="gap-2"
                onClick={() => {
                  logout();
                  router.push("/admin/login");
                }}
              >
                <LogOut className="size-4" />
                Sign out of admin
              </Button>
            </div>
          </div>
        )}
      </main>

      <BookFormDialog
        open={bookDialogOpen}
        onOpenChange={setBookDialogOpen}
        book={editingBook}
        onSaved={refresh}
      />
      <CollectionFormDialog
        open={collectionDialogOpen}
        onOpenChange={setCollectionDialogOpen}
        collection={editingCollection}
        onSaved={refresh}
      />
      <QuizEditorDialog
        open={quizBook !== null}
        onOpenChange={(o) => !o && setQuizBook(null)}
        book={quizBook}
        onSaved={refresh}
      />
    </div>
  );
}
