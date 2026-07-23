import { readCatalogStore, writeCatalogStore } from "@/lib/mock-data/catalog-store";

/**
 * Admin-editable Premium page content (payment instructions, prices, app
 * links, support contact, promo codes) while there's no payment gateway
 * merchant account yet. Stored in the same global `catalog_store` KV table
 * as catalog/collection overrides — public read, admin-only write via
 * /api/admin/catalog.
 */
export interface PromoCode {
  code: string;
  discountPercent: number;
  /** ISO date (yyyy-mm-dd) the code stops working, or null for no expiry. */
  expiresAt: string | null;
}

export interface PremiumSettings {
  cardNumber: string;
  cardHolder: string;
  priceMonthlySom: number;
  priceYearlySom: number;
  clickUrl: string;
  paymeUrl: string;
  supportEmail: string;
  supportTelegram: string;
  promoCodes: PromoCode[];
}

const PREMIUM_SETTINGS_KEY = "bookbee_premium_settings";

const DEFAULT_SETTINGS: PremiumSettings = {
  cardNumber: "4916 9903 6949 9220",
  cardHolder: "",
  priceMonthlySom: 29990,
  priceYearlySom: 149990,
  clickUrl: "https://click.uz",
  paymeUrl: "https://payme.uz",
  supportEmail: "uktamovbekhruz08@gmail.com",
  supportTelegram: "only_uktamov",
  promoCodes: [],
};

export function getPremiumSettings(): PremiumSettings {
  const stored = readCatalogStore<Partial<PremiumSettings>>(PREMIUM_SETTINGS_KEY, {});
  const merged = { ...DEFAULT_SETTINGS, ...stored };
  // Older saved codes may predate the expiresAt field.
  merged.promoCodes = (merged.promoCodes ?? []).map((p) => ({
    code: p.code,
    discountPercent: p.discountPercent,
    expiresAt: p.expiresAt ?? null,
  }));
  return merged;
}

export async function savePremiumSettings(settings: PremiumSettings): Promise<void> {
  await writeCatalogStore(PREMIUM_SETTINGS_KEY, settings);
}

export function isPromoCodeExpired(code: PromoCode): boolean {
  return code.expiresAt !== null && new Date(code.expiresAt) < new Date();
}

export function formatSom(amount: number): string {
  return `${Math.round(amount).toLocaleString("ru-RU")} so'm`;
}
