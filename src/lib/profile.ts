import { readStorage, writeStorage } from "@/lib/local-storage";

export interface ProfileExtras {
  bio: string;
}

const PROFILE_KEY = "bookbee_profile";

export function getProfile(): ProfileExtras {
  return readStorage<ProfileExtras>(PROFILE_KEY, { bio: "" });
}

export function setProfile(extras: Partial<ProfileExtras>): void {
  writeStorage(PROFILE_KEY, { ...getProfile(), ...extras });
}
