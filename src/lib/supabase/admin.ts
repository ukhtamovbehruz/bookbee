import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Server-only Supabase client using the **secret** service-role key. This can
 * read every auth user (via `auth.admin.*`) and must NEVER be imported into
 * client components — the key bypasses Row Level Security.
 *
 * Returns null when the secret key isn't configured so callers can degrade
 * gracefully instead of throwing.
 */
export function createAdminClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;
  if (!url || !secretKey) return null;

  return createClient(url, secretKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
