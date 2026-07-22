const ACTIVITY_EVENT = "bookbee:activity-changed";

export function notifyActivityChanged(): void {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(ACTIVITY_EVENT));
  }
}

export function onActivityChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(ACTIVITY_EVENT, handler);
  return () => window.removeEventListener(ACTIVITY_EVENT, handler);
}
