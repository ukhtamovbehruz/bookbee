export interface Chapter {
  id: string;
  index: number;
  title: string;
  durationSec: number;
  audioUrl: string;
}

export type BookLanguage = "en" | "uz" | "ru";

export interface Book {
  id: string;
  title: string;
  author: string;
  narrator: string;
  publisher: string;
  coverUrl: string;
  description: string;
  categoryIds: string[];
  language: BookLanguage;
  durationSec: number;
  rating: number;
  ratingCount: number;
  listenerCount: number;
  isPremium: boolean;
  isNew: boolean;
  publishedAt: string;
  tags?: string[];
  audioSampleUrl: string;
  chapters: Chapter[];
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  colorHex: string;
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  colorHex: string;
  bookIds: string[];
  coverUrl?: string;
}

export interface ContinueListeningEntry {
  bookId: string;
  chapterId: string;
  progressSec: number;
}
