# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

BookBee is a mostly **frontend-only** audiobook platform MVP (Next.js 15 App Router, React 19, TypeScript, Tailwind v4). The book catalog's edits, admin content, library, ratings, points, discussions, playback position, and per-user profiles are persisted in the browser via `localStorage` (and IndexedDB for uploaded audio) — treat that "persistence" as per-browser and client-only. **The one real backend is Supabase Auth**: user accounts (email/password + Google OAuth) live in Supabase, so sign-ups are global/cross-device and the admin Users list reflects everyone (see the auth section below). The UI is **English only**.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build (also type-checks + lints every route)
npm run lint     # ESLint (flat config)
npx tsc --noEmit # type-check only
```

There is no test suite. `npm run build` is the closest thing to a full gate; for a faster loop, `npx tsc --noEmit` + `npx eslint .` together catch nearly everything without touching `.next/`. The preview dev server is defined in `.claude/launch.json` (name `bookbee-dev`, port 3000, `autoPort: true` so it falls back to a free port when 3000 is taken).

**Build/dev gotcha:** `next build` overwrites the shared `.next/` directory that a running `next dev` process uses. After a build — or after deleting/renaming a source file mid-session — the live dev server can serve mismatched chunks and hydration silently breaks (e.g. a signed-in user appears logged out, or a page hangs on its loading skeleton). Fix by restarting dev cleanly: `rm -rf .next` then start the dev server again.

## Environment

Windows. Shells: PowerShell (primary) and Git Bash — each takes its own syntax. Path alias `@/*` → `./src/*`.

- **No `gh` CLI installed.** GitHub PRs can't be created from the CLI here; `git push` works (Windows Credential Manager supplies auth), but opening a PR is a manual step in the browser unless the user installs/authenticates `gh` or provides a token.
- **Preview server** is managed through `.claude/launch.json`; with `autoPort: true` it picks a free port if 3000 is busy (e.g. another chat's server). Verify UI changes there rather than asking the user to check manually.

## Architecture

### Route groups and the provider tree
- `src/app/layout.tsx` (root) mounts the global providers once, in order: `ThemeProvider` → `TooltipProvider` → `AuthProvider` → `AudioPlayerProvider` → `{children}` + `<Toaster/>`. The single `<audio>` element lives in `AudioPlayerProvider`, so playback persists across navigation.
- `src/app/(site)/` — all normal pages. `(site)/layout.tsx` adds the `Navbar`, `Footer`, and `StickyPlayer` chrome.
- `src/app/login`, `/signup`, `/admin`, `/admin/login` live **outside** `(site)` so they render full-bleed with no navbar/footer/player. Admin is reachable by URL only; it is intentionally not linked from the user menu.

### The catalog (most important concept)
The list of books shown anywhere is a **merge**, not the static seed array:

1. `src/lib/mock-data/books.ts` — static seed books + SSR-only getters (`getBookById`, `getTrendingBooks`, …). Used for the initial server render.
2. `src/lib/mock-data/catalog.ts` — the real source of truth at runtime. `getAllBooks`, `getCatalogBookById`, `getAdminBooks`, plus mutators `saveBookEdit` (stores a partial override in `bookbee_book_edits`), `deleteBook` (hides seed books / removes custom ones), and admin-added books from `custom-books.ts`. `applyEdit` layers overrides (including explicit `chapters`) onto seed/custom books.
3. `src/lib/mock-data/curation.ts` — collections, with the same override pattern **plus full CRUD** (see below).

Mutations broadcast a window event via `src/lib/mock-data/catalog-events.ts` (`notifyCatalogChanged` / `onCatalogChanged`). This lives in its own module to avoid a circular import between `catalog.ts` and `custom-books.ts`.

**SSR → client hydration pattern:** server pages read seed data for first paint and hand it to a client view that re-reads the merged catalog on mount and subscribes to catalog changes. Examples: `book/[id]/page.tsx` → `CatalogBookView`; `category/[id]` → `CategoryBooksGrid`; `collection/[id]` → `CollectionView`. Homepage rails use the `useCatalog` hook. **When adding anything that browses books, read from the catalog (client) so admin edits and custom books show up — do not read the seed array directly.**

### Collections & curation
`curation.ts` supports the full admin lifecycle for the homepage "Featured Collections":
- `getAllCollections` / `getCatalogCollectionById` merge seed collections + admin-created ones, apply per-collection edits, and exclude deleted ones.
- `saveCollectionEdit(id, edit)` layers an override (`bookbee_collection_edits`).
- `createCollection(data)` adds a custom collection (`bookbee_custom_collections`).
- `deleteCollection(id)` hides a seed collection (`bookbee_deleted_collections`) or removes a custom one.

The admin **Curation** tab drives all of this through `CollectionFormDialog` (create + edit modes) and a per-card delete button. In this codebase "collections" and "curations" are the same concept.

### localStorage stores
All keys are prefixed `bookbee_` and accessed through `src/lib/local-storage.ts` (`readStorage`/`writeStorage`, which are SSR-safe and return the fallback on the server). Each concern owns a small module:

| Module | Key(s) | What it holds |
| --- | --- | --- |
| `context/AuthProvider.tsx` | — (Supabase Auth) | current session + accounts live in **Supabase**, not localStorage (see auth section) |
| `hooks/useAdminSession.ts` | `bookbee_admin_session` | admin login flag (creds in `lib/admin.ts`) |
| `lib/profile.ts` | `bookbee_profile` | **per-account** bio + avatar, keyed by email |
| `lib/library.ts` | `bookbee_library` | saved books, finished/quiz/certificate state |
| `lib/ratings.ts` | `bookbee_ratings` | user ratings |
| `lib/listeners.ts` | `bookbee_listeners` | play counts |
| `lib/activity.ts` | `bookbee_activity` | daily listening seconds → streak + goal |
| `lib/points.ts` | `bookbee_points` | BookBee Points |
| `lib/playback-progress.ts` | `bookbee_playback` | resume position per book |
| `lib/discussions.ts` | `bookbee_discussions` | per-book comments |
| `lib/quiz.ts` | `bookbee_quiz` | admin quiz questions |
| `lib/mock-data/catalog.ts` | `bookbee_book_edits`, custom/deleted books | catalog overrides |
| `lib/mock-data/curation.ts` | `bookbee_collection_edits`, `bookbee_custom_collections`, `bookbee_deleted_collections` | collection overrides + CRUD |

**Profiles are keyed by email** (`getProfile(email)` / `setProfile(email, extras)`), so each account keeps its own avatar/bio and the admin panel can show the right picture per user. Call sites pass `user.email`.

### Authentication (Supabase — the only real backend)
Accounts are **not** localStorage. `context/AuthProvider.tsx` wraps Supabase Auth and still exposes the same `{ user: { name, email }, isReady, signUp, signIn, signOut, requestPasswordReset, updateName }` shape, so the rest of the app is unchanged — but the methods are now **async** (`signUp`/`signIn` return `Promise<boolean>`; callers `await`). `name` comes from `user_metadata.name` (our sign-up form) or `full_name` (Google OAuth). Browser client: `lib/supabase/client.ts` (`createBrowserClient`, uses `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY`). Google OAuth buttons on both `/login` and `/signup` call `signInWithOAuth` and return via `src/app/auth/callback/route.ts`.

The **admin Users list is server-side**: `src/app/api/admin/users/route.ts` uses `lib/supabase/admin.ts` (service-role client, `SUPABASE_SECRET_KEY`, **server-only, never `NEXT_PUBLIC_`**) to `auth.admin.listUsers()`, guarded by the `x-admin-secret` header (= `ADMIN_PASSWORD`). `admin/page.tsx` fetches it into state; if `SUPABASE_SECRET_KEY` is unset the section degrades to an error card. Env vars required in Vercel **and** `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SECRET_KEY`. **Still per-browser localStorage (not yet migrated):** library, ratings, points, plays, certificates, discussions, profiles — so those admin metrics reflect only the admin's own browser.

### Audio, resume & gamification
- Playback is gated behind sign-up via `hooks/useGuardedPlay.ts` — call sites use it instead of `playBook` directly so anonymous users are redirected to `/signup`.
- A chapter's `audioUrl` may be a normal URL **or** an `idb:<id>` reference to an uploaded mp3 blob in IndexedDB (`src/lib/audio-store.ts`). `resolveAudioSrc` turns `idb:` refs into object URLs before the `<audio>` src is set — always route new src assignment through it.
- **Resume playback** (`lib/playback-progress.ts`): while playing, `AudioPlayerProvider` periodically saves `{bookId, chapterId, positionSec}` (and on pause/close). `playBook(book)` **without** a chapter id resumes from the saved position (seeking once metadata loads via `pendingSeekRef`); `playBook(book, chapterId)` starts that chapter fresh. `BookHero` reads `getPlaybackProgress` to show **Resume** vs **Play**. The homepage "Continue Listening" card reads `getAllPlaybackProgress()` (most-recent first).
- While playing, `activity.ts` accrues listening seconds; reaching the daily goal (`DAILY_GOAL_SECONDS`) completes the day and awards `DAILY_POINTS` once. This drives the profile activity ring, streak, points pill, homepage streak card, and leaderboard. Analytics helpers: `getActivityStreak`, `getBestStreak`, `getTotalListenSeconds`, `getWeekListenSeconds`, `getActiveDaysCount`.

### Profile & gamification UI
`src/app/(site)/profile/page.tsx` has an **Overview** tab (default) plus Account/Security/Billing/Notifications, and shows a loading skeleton while auth hydrates (never a blank flash on refresh). Overview components live in `src/components/profile/`:
- `LevelBadge` + `lib/level.ts` — XP = points; escalating level curve and rank titles.
- `AchievementsPanel` + `lib/achievements.ts` — data-derived badges (earned/locked, progress).
- `ListeningInsights` — total/weekly listening, best streak, active days, books finished, top category.
- `CertificatesGallery` — earned certificates linking to each certificate page.

### Certificates & PDF
Book completion (finish + pass the quiz) earns a certificate. `src/app/(site)/book/[id]/certificate/page.tsx` renders `components/certificate/CertificateCard.tsx` — a navy/gold "Certificate of Achievement" that always renders light (print-friendly) regardless of theme. Users can **download/share a PDF** (via `jspdf` + `html2canvas-pro`, the deps added for this) or print. The card intentionally omits the brand logo (crown + "BookBee" wordmark only).

### Leaderboard
`lib/leaderboard.ts` reflects **real listeners only** — no fictional seed users. Signed out → empty "be the first" state; signed in → the current user with their real points (and a solo note when they're alone).

### Search
Full-screen `src/app/(site)/search/page.tsx` (reached via `components/layout/SearchTrigger.tsx` and Ctrl/⌘-K). A filter sidebar (categories, authors, narrators, publishers, language) plus a text query over the merged catalog; shows "Recommended for you" until a query or filter is set. Filter logic lives in `lib/search.ts`.

### Discussion & AI (separate)
`components/book/BookDiscussion.tsx` renders two **independent** sections: a community **Discussion** thread (`lib/discussions.ts`) and an **Ask AI** assistant. The assistant (`lib/ai-assistant.ts`) is a lightweight, rule-based responder grounded in the book's real metadata (intent patterns → templated answers), with suggested "common questions." No network/LLM call.

### Homepage composition
`src/app/(site)/page.tsx` stacks: `HeroCarousel` (6 auto-rotating promo slides) → `ContinueActivityRow` → `TrendingBooksRail` → `CategoriesGrid` → `FeaturedCollections` → `PromoBannerStrip` (mid-page auto-rotating banners with arrows/dots) → `NewReleasesGrid` → `MostPopularCarousel` → `PremiumBanner`. `ContinueActivityRow` places the **Continue Listening** card and the **`HomeStreakCard`** (today's goal ring, week strip, current streak, next milestone) side by side in one responsive row, both signed-in only; the row collapses gracefully when only one is available.

### Admin panel
`src/app/admin/page.tsx` (URL-only, `useAdminSession`) has Insights / Library / Users / Curation / Settings sections. Insights reads real numbers from `lib/metrics.ts`. **Users** shows each member's real profile picture (`getProfile(email).avatar`, initials fallback). **Library** edits any book field/cover/audio/quiz or hides/removes titles. **Curation** creates, edits, and deletes collections (see above).

### Theming
Dark is the default. In `globals.css`, `:root` is the **light** palette and `.dark` is the **dark** palette (managed by `next-themes` with `attribute="class"`). Tailwind v4 is CSS-first: theme tokens are CSS variables in `globals.css` — there is no `tailwind.config.js`. Use the theme-aware utilities `glass` / `glass-strong` / `hairline-t` / `hairline-b` (backed by `--glass-*` / `--hairline` vars) for surfaces and dividers; avoid raw `bg-white/x` or `border-white/x`, which only look right in dark mode. Any client component that reads theme/`localStorage` on mount must render deterministically until mounted (see `ThemeToggle` — gate theme-derived attributes on a `mounted` flag) to avoid hydration mismatches that leave a subtree un-hydrated.

### UI conventions
- shadcn/ui components (Radix under the hood) live in `src/components/ui/` — add more via `npx shadcn@latest add <name>`.
- Icons: `lucide-react`. This version dropped brand/social logos, so those are hand-rolled SVGs in `components/layout/SocialIcons.tsx`. The brand mark is `components/layout/LogoIcon.tsx` (uses `useId` for unique gradient IDs since it renders in several places at once); the full raster lockup is `public/bookbee-logo-full.svg`.
- Toasts: `sonner` with `richColors` (success=green, error=red, warning=amber, info=blue).
- Animations: `framer-motion`. Shared variants in `src/animations/variants.ts`; `CountUp` and `FadeInSection` are the reusable primitives.
- `next/image` is used for all covers; `next.config.ts` allows any HTTPS host because admins paste arbitrary cover URLs. Data-URL images (uploaded avatars/covers) render through Radix `AvatarImage` / plain `<img>`.
