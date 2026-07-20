import { createClient } from "@/lib/supabase/client";

/**
 * Per-account avatar + bio, synced to the global `profiles` table so every
 * browser (and the admin panel) shows the same picture for a given user,
 * instead of only whichever browser uploaded it. Reads stay synchronous
 * against an in-memory cache for the signed-in user (same shape as the old
 * localStorage-backed API); writes upsert in the background. AuthProvider
 * drives `syncProfileForUser` on every auth change.
 *
 * `profiles` pre-dates this feature (auto-populated by an existing trigger
 * on auth.users with columns `id`/`email`/`full_name`/`avatar_url`) — we
 * reuse it rather than creating a rival table, so reads/writes here use
 * `id` and `avatar_url` to match its real schema.
 */

export interface ProfileExtras {
  bio: string;
  avatar: string;
}

const EMPTY: ProfileExtras = { bio: "", avatar: "" };

const supabase = createClient();

let currentUserId: string | null = null;
let cachedProfile: ProfileExtras = EMPTY;

export function getProfile(): ProfileExtras {
  return cachedProfile;
}

export function setProfile(email: string, extras: Partial<ProfileExtras>): void {
  if (!currentUserId) return;
  cachedProfile = { ...EMPTY, ...cachedProfile, ...extras };
  notify();
  void supabase
    .from("profiles")
    .upsert({
      id: currentUserId,
      email: email.trim().toLowerCase(),
      avatar_url: cachedProfile.avatar,
      bio: cachedProfile.bio,
    });
}

/** Called by AuthProvider whenever the signed-in user changes. */
export async function syncProfileForUser(
  user: { id: string; email: string } | null,
): Promise<void> {
  currentUserId = user?.id ?? null;

  if (!user) {
    cachedProfile = EMPTY;
    notify();
    return;
  }

  const { data } = await supabase
    .from("profiles")
    .select("avatar_url, bio")
    .eq("id", user.id)
    .maybeSingle();

  cachedProfile = { avatar: data?.avatar_url ?? "", bio: data?.bio ?? "" };
  notify();
}

const PROFILE_EVENT = "bookbee:profile-changed";

function notify(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_EVENT));
  }
}

export function onProfileChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILE_EVENT, handler);
  return () => window.removeEventListener(PROFILE_EVENT, handler);
}
