import { readStorage, writeStorage } from "@/lib/local-storage";

export interface ProfileExtras {
  bio: string;
  avatar: string;
}

const PROFILE_KEY = "bookbee_profile";
const PROFILE_EVENT = "bookbee:profile-changed";

export function getProfile(): ProfileExtras {
  return readStorage<ProfileExtras>(PROFILE_KEY, { bio: "", avatar: "" });
}

export function setProfile(extras: Partial<ProfileExtras>): void {
  writeStorage(PROFILE_KEY, { ...getProfile(), ...extras });
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(PROFILE_EVENT));
  }
}

export function onProfileChanged(handler: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(PROFILE_EVENT, handler);
  return () => window.removeEventListener(PROFILE_EVENT, handler);
}
