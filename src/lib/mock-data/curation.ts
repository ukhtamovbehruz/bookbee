import type { Collection } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/local-storage";
import { collections as seedCollections } from "./collections";
import { notifyCatalogChanged, onCatalogChanged } from "./catalog-events";

const COLLECTION_EDITS_KEY = "bookbee_collection_edits";

export interface CollectionEdit {
  title?: string;
  description?: string;
  colorHex?: string;
  coverUrl?: string;
  bookIds?: string[];
}

type CollectionEditsStore = Record<string, CollectionEdit>;

export function getCollectionEdits(): CollectionEditsStore {
  return readStorage<CollectionEditsStore>(COLLECTION_EDITS_KEY, {});
}

export function saveCollectionEdit(id: string, edit: CollectionEdit): void {
  const store = getCollectionEdits();
  store[id] = { ...store[id], ...edit };
  writeStorage(COLLECTION_EDITS_KEY, store);
  notifyCatalogChanged();
}

function applyEdit(collection: Collection, edit: CollectionEdit | undefined): Collection {
  if (!edit) return collection;
  return {
    ...collection,
    ...(edit.title !== undefined && { title: edit.title }),
    ...(edit.description !== undefined && { description: edit.description }),
    ...(edit.colorHex !== undefined && { colorHex: edit.colorHex }),
    ...(edit.coverUrl !== undefined && { coverUrl: edit.coverUrl }),
    ...(edit.bookIds !== undefined && { bookIds: edit.bookIds }),
  };
}

export function getAllCollections(): Collection[] {
  const edits = getCollectionEdits();
  return seedCollections.map((c) => applyEdit(c, edits[c.id]));
}

export function getCatalogCollectionById(id: string): Collection | undefined {
  const edits = getCollectionEdits();
  const base = seedCollections.find((c) => c.id === id);
  return base ? applyEdit(base, edits[id]) : undefined;
}

export { onCatalogChanged };
