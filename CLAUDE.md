# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## What this is

BookBee is a **frontend-only** audiobook platform MVP (Next.js 15 App Router, React 19, TypeScript, Tailwind v4). There is **no backend, database, or real API**. Everything that looks like server state — accounts, admin, the book catalog's edits, library, ratings, points, discussions — is persisted in the browser via `localStorage` (and IndexedDB for uploaded audio). Treat "persistence" as per-browser and client-only.

## Commands

```bash
npm run dev      # dev server on http://localhost:3000
npm run build    # production build (also type-checks + lints every route)
npm run lint     # ESLint (flat config)
npx tsc --noEmit # type-check only
```

There is no test suite. `npm run build` is the closest thing to a full gate: it type-checks and lints every route while compiling. The preview dev server is defined in `.claude/launch.json` (name `bookbee-dev`, port 3000).

**Build/dev gotcha:** `next build` overwrites the shared `.next/` directory that a running `next dev` process uses. After a build, the live dev server serves mismatched chunks and hydration silently breaks (e.g. a signed-in user appears logged out). Fix by restarting dev cleanly: `rm -rf .next` then start the dev server again.

## Environment

Windows. The shell is PowerShell or Git Bash. Path alias `@/*` → `./src/*`.

## Architecture

### Route groups and the provider tree
- `src/app/layout.tsx` (root) mounts the global providers once, in order: `ThemeProvider` → `TooltipProvider` → `AuthProvider` → `AudioPlayerProvider` → `{children}` + `<Toaster/>`. The single `<audio>` element lives in `AudioPlayerProvider`, so playback persists across navigation.
- `src/app/(site)/` — all normal pages. `(site)/layout.tsx` adds the `Navbar`, `Footer`, and `StickyPlayer` chrome.
- `src/app/login`, `/signup`, `/admin`, `/admin/login` live **outside** `(site)` so they render full-bleed with no navbar/footer/player. Admin is reachable by URL only; it is intentionally not linked from the user menu.

### The catalog (most important concept)
The list of books shown anywhere is a **merge**, not the static seed array:

1. `src/lib/mock-data/books.ts` — static seed books + SSR-only getters (`getBookById`, `getTrendingBooks`, …). Used for the initial server render.
2. `src/lib/mock-data/catalog.ts` — the real source of truth at runtime. `getAllBooks`, `getCatalogBookById`, `getAdminBooks`, plus mutators `saveBookEdit` (stores a partial override in `bookbee_book_edits`), `deleteBook` (hides seed books / removes custom ones), and admin-added books from `custom-books.ts`. `applyEdit` layers overrides (including explicit `chapters`) onto seed/custom books.
3. `src/lib/mock-data/curation.ts` — same override pattern for collections.

Mutations broadcast a window event via `src/lib/mock-data/catalog-events.ts` (`notifyCatalogChanged` / `onCatalogChanged`). This lives in its own module to avoid a circular import between `catalog.ts` and `custom-books.ts`.

**SSR → client hydration pattern:** server pages read seed data for first paint and hand it to a client view that re-reads the merged catalog on mount and subscribes to catalog changes. Examples: `book/[id]/page.tsx` → `CatalogBookView`; `category/[id]` → `CategoryBooksGrid`; `collection/[id]` → `CollectionView`. Homepage rails use the `useCatalog` hook. **When adding anything that browses books, read from the catalog (client) so admin edits and custom books show up — do not read the seed array directly.**

### localStorage stores
All keys are prefixed `bookbee_` and accessed through `src/lib/local-storage.ts` (`readStorage`/`writeStorage`, which are SSR-safe and return the fallback on the server). Each concern owns a small module: `library.ts`, `ratings.ts`, `listeners.ts` (play counts), `activity.ts` (daily minutes → streak + points), `points.ts`, `discussions.ts`, `profile.ts` (bio + avatar data URL), `quiz.ts` (admin questions), and `catalog.ts`/`curation.ts` overrides. Auth session/accounts live in `context/AuthProvider.tsx`; admin session in `hooks/useAdminSession.ts` (credentials in `src/lib/admin.ts`).

### Audio & gamification
- Playback is gated behind sign-up via `hooks/useGuardedPlay.ts` — call sites use it instead of `playBook` directly so anonymous users are redirected to `/signup`.
- A chapter's `audioUrl` may be a normal URL **or** an `idb:<id>` reference to an uploaded mp3 blob in IndexedDB (`src/lib/audio-store.ts`). `resolveAudioSrc` turns `idb:` refs into object URLs before the `<audio>` src is set — always route new src assignment through it.
- While playing, `activity.ts` accrues listening seconds; reaching the 7-minute daily goal completes the day and awards BookBee Points once. This drives the profile activity ring, streak, points pill, and leaderboard.

### Theming
Dark is the default. In `globals.css`, `:root` is the **light** palette and `.dark` is the **dark** palette (managed by `next-themes` with `attribute="class"`). Tailwind v4 is CSS-first: theme tokens are CSS variables in `globals.css` — there is no `tailwind.config.js`. Use the theme-aware utilities `glass` / `glass-strong` / `hairline-t` / `hairline-b` (backed by `--glass-*` / `--hairline` vars) for surfaces and dividers; avoid raw `bg-white/x` or `border-white/x`, which only look right in dark mode.

### UI conventions
- shadcn/ui components (Radix under the hood) live in `src/components/ui/` — add more via `npx shadcn@latest add <name>`.
- Icons: `lucide-react`. This version dropped brand/social logos, so those are hand-rolled SVGs in `components/layout/SocialIcons.tsx`. The brand mark is `components/layout/LogoIcon.tsx` (uses `useId` for unique gradient IDs since it renders in several places at once).
- Toasts: `sonner` with `richColors` (success=green, error=red, warning=amber, info=blue).
- Animations: `framer-motion`. Shared variants in `src/animations/variants.ts`; `CountUp` and `FadeInSection` are the reusable primitives.
- `next/image` is used for all covers; `next.config.ts` allows any HTTPS host because admins paste arbitrary cover URLs.
