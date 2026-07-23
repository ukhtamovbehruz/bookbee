import { createClient } from "@/lib/supabase/client";

/**
 * Premium membership status, synced to the global `premium_status` table.
 * There's no payment gateway yet (Click/Payme merchant approval pending),
 * so this models a manual flow: the user transfers money to a published
 * card and requests premium; an admin reviews and approves from the admin
 * panel. Memberships expire (30d monthly / 365d yearly, set by the admin
 * approval route) — an "active" row past its `expires_at` reads back as
 * "none" here, no separate cron job needed to demote it.
 *
 * Reads stay synchronous against an in-memory cache for the signed-in
 * user; writes upsert in the background. AuthProvider drives
 * `syncPremiumForUser` on every auth change.
 */

export type PremiumStatus = "none" | "pending" | "active" | "rejected";
export type PremiumPlan = "monthly" | "yearly";

export interface CurrentPremiumUser {
  id: string;
  email: string;
  name: string;
}

const supabase = createClient();
const PREMIUM_EVENT = "bookbee:premium-changed";

let currentUser: CurrentPremiumUser | null = null;
let cachedStatus: PremiumStatus = "none";
let cachedPlan: PremiumPlan | null = null;
let cachedExpiresAt: string | null = null;

/** Raw status, but an expired "active" row reads back as "none". */
export function getPremiumStatus(): PremiumStatus {
  if (cachedStatus === "active" && cachedExpiresAt && new Date(cachedExpiresAt) < new Date()) {
    return "none";
  }
  return cachedStatus;
}

export function getIsPremium(): boolean {
  return getPremiumStatus() === "active";
}

/** Which plan the current (non-expired, active) membership is on, if any. */
export function getPremiumPlan(): PremiumPlan | null {
  return getPremiumStatus() === "active" ? cachedPlan : null;
}

/** When the current membership expires, if it's active and set to expire. */
export function getPremiumExpiresAt(): string | null {
  return getPremiumStatus() === "active" ? cachedExpiresAt : null;
}

/**
 * Called when the user taps "I've paid" — marks the request as pending
 * review. Returns whether it actually saved, so the caller can tell the
 * user if something went wrong instead of optimistically assuming success.
 */
export async function requestPremium(
  plan: PremiumPlan,
  promoCode?: string,
): Promise<boolean> {
  if (!currentUser) return false;
  const { error } = await supabase.from("premium_status").upsert({
    user_id: currentUser.id,
    email: currentUser.email,
    name: currentUser.name,
    status: "pending",
    plan,
    promo_code: promoCode?.trim() || null,
    requested_at: new Date().toISOString(),
  });
  if (error) return false;
  cachedStatus = "pending";
  cachedPlan = plan;
  cachedExpiresAt = null;
  notify();
  return true;
}

/** Called by AuthProvider whenever the signed-in user changes. */
export async function syncPremiumForUser(
  user: CurrentPremiumUser | null,
): Promise<void> {
  currentUser = user;

  if (!user) {
    cachedStatus = "none";
    cachedPlan = null;
    cachedExpiresAt = null;
    notify();
    return;
  }

  const { data } = await supabase
    .from("premium_status")
    .select("status, plan, expires_at")
    .eq("user_id", user.id)
    .maybeSingle();

  cachedStatus = (data?.status as PremiumStatus | undefined) ?? "none";
  cachedPlan = (data?.plan as PremiumPlan | undefined) ?? null;
  cachedExpiresAt = data?.expires_at ?? null;
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
