# Bookbee + Supabase

This app now uses Supabase as its backend for:

- Auth via Google OAuth
- Postgres tables for books, chapters, profiles, votes, progress, rooms, and library shelves
- Storage for avatar uploads
- Row Level Security policies so users can only mutate their own data

## Local setup

1. Create a Supabase project.
2. In Supabase, open the SQL editor and run [`supabase/schema.sql`](/C:/Users/REPUBILC%20OF%20GAMERS/Documents/new1/supabase/schema.sql).
3. Optionally seed demo content by running [`supabase/seed.sql`](/C:/Users/REPUBILC%20OF%20GAMERS/Documents/new1/supabase/seed.sql).
4. Copy [`.env.example`](/C:/Users/REPUBILC%20OF%20GAMERS/Documents/new1/.env.example) to `.env` and paste your project values:

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

5. In Supabase Auth settings:
   Enable `Google`
   Add your site URL and redirect URLs for local and Vercel
6. Run:

```bash
npm install
npm run dev
```

## Google Auth checklist

Add these redirect URLs in both Google Cloud and Supabase:

- `http://localhost:5173`
- `http://localhost:5173/`
- `https://your-vercel-domain.vercel.app`
- `https://your-vercel-domain.vercel.app/`

## Admin access

After you sign in once, open the `profiles` table in Supabase and change your row's `role` to `admin`.

That enables the admin dashboard in the app and unlocks the `books` write policy.

## Vercel deployment

1. Import the repo into Vercel.
2. Add the same environment variables from `.env`:
   `VITE_SUPABASE_URL`
   `VITE_SUPABASE_ANON_KEY`
3. Deploy.

The app is configured as a client-rendered Vite SPA, and [`vercel.json`](/C:/Users/REPUBILC%20OF%20GAMERS/Documents/new1/vercel.json) now preserves filesystem routes before falling back to `index.html`.

## Notes

- The old `server/` folder is no longer required for the deployed path. Supabase is the backend.
- Avatar uploads use a public `avatars` storage bucket created by the schema.
- Votes automatically refresh each book's Bee Score with a database trigger.
