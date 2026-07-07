"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import {
  Activity,
  BookOpen,
  LayoutGrid,
  Library as LibraryIcon,
  LogOut,
  Pencil,
  Plus,
  RotateCcw,
  Search,
  Settings as SettingsIcon,
  Sparkles,
  Star,
  Trash2,
  Users as UsersIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { LogoIcon } from "@/components/layout/LogoIcon";
import { MiniAreaChart, DonutChart } from "@/components/admin/Charts";
import { BookFormDialog } from "@/components/admin/BookFormDialog";
import { CollectionFormDialog } from "@/components/admin/CollectionFormDialog";
import { useAdminSession } from "@/hooks/useAdminSession";
import { categories } from "@/lib/mock-data/categories";
import { getAdminBooks, getAllBooks, deleteBook, saveBookEdit } from "@/lib/mock-data/catalog";
import { getAllCollections } from "@/lib/mock-data/curation";
import { readStorage } from "@/lib/local-storage";
import { cn, formatCount, formatDuration } from "@/lib/utils";
import type { Book, Collection } from "@/lib/types";

type Section = "insights" | "library" | "users" | "curation" | "settings";

const NAV: { id: Section; label: string; icon: typeof LayoutGrid }[] = [
  { id: "insights", label: "Insights", icon: LayoutGrid },
  { id: "library", label: "Library", icon: LibraryIcon },
  { id: "users", label: "Users", icon: UsersIcon },
  { id: "curation", label: "Curation", icon: Sparkles },
  { id: "settings", label: "Settings", icon: SettingsIcon },
];

const TREND = [22, 28, 26, 34, 40, 38, 52, 60, 55, 68, 64, 72, 70, 78, 74, 82];

export default function AdminDashboardPage() {
  const { isAdmin, isReady, logout } = useAdminSession();
  const router = useRouter();
  const [section, setSection] = useState<Section>("insights");
  const [tick, setTick] = useState(0);
  const [bookDialogOpen, setBookDialogOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | undefined>(undefined);
  const [collectionDialog, setCollectionDialog] = useState<Collection | null>(null);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (isReady && !isAdmin) router.replace("/admin/login");
  }, [isReady, isAdmin, router]);

  const refresh = () => setTick((t) => t + 1);

  const adminBooks = useMemo(
    () => (isAdmin ? getAdminBooks() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, tick],
  );
  const catalog = useMemo(
    () => (isAdmin ? getAllBooks() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, tick],
  );
  const collections = useMemo(
    () => (isAdmin ? getAllCollections() : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [isAdmin, tick],
  );

  if (!isReady || !isAdmin) return null;

  const totalListeners = catalog.reduce((s, b) => s + b.listenerCount, 0);
  const newThisWeek = catalog.filter((b) => b.isNew).length;
  const avgRating =
    catalog.length > 0
      ? (catalog.reduce((s, b) => s + b.rating, 0) / catalog.length).toFixed(2)
      : "0";

  const genreSegments = categories
    .map((c) => ({
      label: c.name,
      value: catalog.filter((b) => b.categoryIds.includes(c.id)).length,
      color: c.colorHex,
    }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 4);
  const topGenre = genreSegments[0];
  const topShare =
    genreSegments.length > 0
      ? Math.round(
          (topGenre.value / genreSegments.reduce((s, g) => s + g.value, 0)) * 100,
        )
      : 0;

  const accounts = readStorage<{ name: string; email: string }[]>("bookbee_accounts", []);
  const users = [
    ...accounts,
    { name: "Alexander Thorne", email: "alexander.t@bookbee.co" },
    { name: "Sarah Chen", email: "sarah.chen@bookbee.co" },
  ];

  const filteredBooks = adminBooks.filter((b) =>
    `${b.title} ${b.author}`.toLowerCase().includes(query.trim().toLowerCase()),
  );

  const STATS = [
    { label: "Active Listeners", value: formatCount(totalListeners), delta: "+12%", data: TREND },
    { label: "Total Titles", value: `${catalog.length}`, delta: `+${newThisWeek}`, data: TREND.map((d) => d * 0.8) },
    { label: "Avg Rating", value: avgRating, delta: "Optimal", data: TREND.map((d) => 60 + (d % 12)) },
    { label: "New This Week", value: `${newThisWeek}`, delta: "New", data: TREND.map((d) => d * 0.6) },
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
          <div className="max-w-5xl space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Platform Insights</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                Real-time overview of BookBee&apos;s ecosystem health and growth.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {STATS.map((stat) => (
                <div key={stat.label} className="glass rounded-2xl p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">{stat.label}</span>
                    <Badge variant="secondary" className="text-[10px]">
                      {stat.delta}
                    </Badge>
                  </div>
                  <p className="mt-2 text-2xl font-bold">{stat.value}</p>
                  <div className="mt-2 h-8">
                    <MiniAreaChart data={stat.data} height={32} />
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              <div className="glass rounded-2xl p-5 lg:col-span-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-semibold">Listening Trends</h2>
                    <p className="text-xs text-muted-foreground">Hourly listener engagement</p>
                  </div>
                  <Badge variant="secondary">Last 24 hours</Badge>
                </div>
                <div className="mt-4 h-40">
                  <MiniAreaChart data={TREND} />
                </div>
              </div>

              <div className="glass rounded-2xl p-5">
                <h2 className="font-semibold">Genre Popularity</h2>
                <p className="text-xs text-muted-foreground">Titles by category</p>
                <div className="mt-4">
                  <DonutChart
                    segments={genreSegments}
                    centerLabel={`${topShare}%`}
                    centerSub={topGenre?.label}
                  />
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-5">
              <h2 className="font-semibold">Recent Activity</h2>
              <div className="mt-3 divide-y divide-border text-sm">
                {[
                  { icon: BookOpen, text: "New title indexed in the catalog", time: "12 mins ago", status: "Live" },
                  { icon: Star, text: "A listener left a 5-star rating", time: "1 hour ago", status: "New" },
                  { icon: Activity, text: "Listening trends refreshed", time: "3 hours ago", status: "Auto" },
                ].map((row) => {
                  const Icon = row.icon;
                  return (
                    <div key={row.text} className="flex items-center gap-3 py-3">
                      <span className="flex size-8 items-center justify-center rounded-lg bg-primary/15 text-primary">
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1">{row.text}</span>
                      <span className="text-xs text-muted-foreground">{row.time}</span>
                      <Badge variant="secondary" className="text-[10px]">
                        {row.status}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
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
                          onClick={() => {
                            saveBookEdit(book.id, { hidden: false });
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
                          onClick={() => {
                            deleteBook(book.id);
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
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Curation</h1>
              <p className="text-sm text-muted-foreground">
                Edit collection covers, details, and which books they feature.
              </p>
            </div>
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
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5"
                    onClick={() => setCollectionDialog(collection)}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {section === "users" && (
          <div className="max-w-3xl space-y-5">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Users</h1>
              <p className="text-sm text-muted-foreground">{users.length} members</p>
            </div>
            <div className="glass divide-y divide-border rounded-2xl">
              {users.map((u, i) => (
                <div key={`${u.email}-${i}`} className="flex items-center gap-3 p-4">
                  <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                    {u.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase()}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">{u.email}</p>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">Listener</Badge>
                </div>
              ))}
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
                <span className="text-muted-foreground">Local (demo)</span>
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
        open={collectionDialog !== null}
        onOpenChange={(o) => !o && setCollectionDialog(null)}
        collection={collectionDialog}
        onSaved={refresh}
      />
    </div>
  );
}
