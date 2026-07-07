const CATALOG_EVENT = "bookbee:catalog-changed";

export function notifyCatalogChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(CATALOG_EVENT));
  }
}

export function onCatalogChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CATALOG_EVENT, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CATALOG_EVENT, handler);
    window.removeEventListener("storage", handler);
  };
}
