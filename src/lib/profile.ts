import { readStorage, writeStorage } from "@/lib/local-storage";

export interface ProfileExtras {
  bio: string;
  avatar: string;
}

const PROFILE_KEY = "bookbee_profile";
const PROFILE_EVENT = "bookbee:profile-changed";

// Profiles are keyed by account email so each member keeps their own bio and
// avatar (and so the admin panel can show the right picture per user).
type ProfileStore = Record<string, ProfileExtras>;

const EMPTY: ProfileExtras = { bio: "", avatar: "" };

function normalize(email: string): string {
  return email.trim().toLowerCase();
}

function readStore(): ProfileStore {
  return readStorage<ProfileStore>(PROFILE_KEY, {});
}

export function getProfile(email: string): ProfileExtras {
  if (!email) return EMPTY;
  return readStore()[normalize(email)] ?? EMPTY;
}

export function setProfile(email: string, extras: Partial<ProfileExtras>): void {
  if (!email) return;
  const key = normalize(email);
  const store = readStore();
  store[key] = { ...EMPTY, ...store[key], ...extras };
  writeStorage(PROFILE_KEY, store);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_EVENT));
  }
}

export function onProfileChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILE_EVENT, handler);
  return () => window.removeEventListener(PROFILE_EVENT, handler);
}
