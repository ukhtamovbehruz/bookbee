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
  return { ...DEFAULT_SETTINGS, ...stored };
}

export async function savePremiumSettings(settings: PremiumSettings): Promise<void> {
  await writeCatalogStore(PREMIUM_SETTINGS_KEY, settings);
}

/** Serializes promo codes to the "CODE:PERCENT" per-line format the admin form edits. */
export function promoCodesToText(codes: PromoCode[]): string {
  return codes.map((c) => `${c.code}:${c.discountPercent}`).join("\n");
}

/** Parses the admin form's "CODE:PERCENT" per-line text back into promo codes. */
export function parsePromoCodesText(text: string): PromoCode[] {
  return text
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [code, percent] = line.split(":");
      return {
        code: (code ?? "").trim().toUpperCase(),
        discountPercent: Math.max(0, Math.min(100, Number(percent) || 0)),
      };
    })
    .filter((c) => c.code.length > 0);
}
