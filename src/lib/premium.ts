import { createClient } from "@/lib/supabase/client";

/**
 * Premium membership status, synced to the global `premium_status` table.
 * There's no payment gateway yet (Click/Payme merchant approval pending),
 * so this models a manual flow: the user transfers money to a published
 * card and requests premium; an admin reviews and approves from the admin
 * panel. Reads stay synchronous against an in-memory cache for the signed-in
 * user; writes upsert in the background. AuthProvider drives
 * `syncPremiumForUser` on every auth change.
 */

export type PremiumStatus = "none" | "pending" | "active" | "rejected";

export interface CurrentPremiumUser {
  id: string;
  email: string;
  name: string;
}

const supabase = createClient();
const PREMIUM_EVENT = "bookbee:premium-changed";

let currentUser: CurrentPremiumUser | null = null;
let cachedStatus: PremiumStatus = "none";

export function getPremiumStatus(): PremiumStatus {
  return cachedStatus;
}

export function getIsPremium(): boolean {
  return cachedStatus === "active";
}

/** Called when the user taps "I've paid" — marks the request as pending review. */
export function requestPremium(): void {
  if (!currentUser) return;
  cachedStatus = "pending";
  notify();
  void supabase.from("premium_status").upsert({
    user_id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    status: "pending",
    requested_at: new Date().toISOString(),
  });
}

/** Called by AuthProvider whenever the signed-in user changes. */
export async function syncPremiumForUser(
  user: CurrentPremiumUser | null,
): Promise<void> {
  currentUser = user;

  if (!user) {
    cachedStatus = "none";
    notify();
    return;
  }

  const { data } = await supabase
    .from("premium_status")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle();

  cachedStatus = (data?.status as PremiumStatus | undefined) ?? "none";
  notify();
}

function notify(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PREMIUM_EVENT));
  }
}

export function onPremiumChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PREMIUM_EVENT, handler);
  return () => window.removeEventListener(PREMIUM_EVENT, handler);
}
