import { readCatalogStore, writeCatalogStore } from "@/lib/mock-data/catalog-store";

/**
 * Admin-editable payment instructions shown on the Premium upsell (card
 * number + price) while there's no payment gateway merchant account yet.
 * Stored in the same global `catalog_store` KV table as catalog/collection
 * overrides — public read, admin-only write via /api/admin/catalog.
 */
export interface PremiumSettings {
  cardNumber: string;
  cardHolder: string;
  priceLabel: string;
}

const PREMIUM_SETTINGS_KEY = "bookbee_premium_settings";

const DEFAULT_SETTINGS: PremiumSettings = {
  cardNumber: "4916 9903 6949 9220",
  cardHolder: "",
  priceLabel: "29 990 so'm / oy",
};

export function getPremiumSettings(): PremiumSettings {
  return readCatalogStore<PremiumSettings>(PREMIUM_SETTINGS_KEY, DEFAULT_SETTINGS);
}

export async function savePremiumSettings(settings: PremiumSettings): Promise<void> {
  await writeCatalogStore(PREMIUM_SETTINGS_KEY, settings);
}
