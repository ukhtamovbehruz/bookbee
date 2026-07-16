import { createClient } from "@/lib/supabase/client";
import { ADMIN_PASSWORD } from "@/lib/admin";
import { notifyCatalogChanged } from "./catalog-events";

/**
 * Client-side cache for admin-authored catalog data (book edits, custom
 * books, collection edits/custom/deleted) backed by the `catalog_store`
 * Supabase table instead of localStorage, so edits are global rather than
 * stuck to whichever browser made them. Reads are synchronous against this
 * in-memory cache (mirroring the old localStorage API); writes go through
 * the service-role-backed `/api/admin/catalog` route since RLS on the table
 * only allows public reads.
 */

const supabase = createClient();

const cache = new Map<string, unknown>();
let hydratePromise: Promise<void> | null = null;

async function doHydrate(): Promise<void> {
  const { data, error } = await supabase.from("catalog_store").select("key, value");
  if (error || !data) return;
  for (const row of data as { key: string; value: unknown }[]) {
    cache.set(row.key, row.value);
  }
  notifyCatalogChanged();
}

function hydrate(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (!hydratePromise) hydratePromise = doHydrate();
  return hydratePromise;
}

// Kick off hydration as soon as this module loads in the browser.
hydrate();

export function readCatalogStore<T>(key: string, fallback: T): T {
  return cache.has(key) ? (cache.get(key) as T) : fallback;
}

export async function writeCatalogStore<T>(key: string, value: T): Promise<void> {
  cache.set(key, value);
  notifyCatalogChanged();

  const res = await fetch("/api/admin/catalog", {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-admin-secret": ADMIN_PASSWORD },
    body: JSON.stringify({ key, value }),
  });
  if (!res.ok) {
    throw new Error("Failed to save — please try again.");
  }
}
