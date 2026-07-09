import type { Collection } from "@/lib/types";
import { readStorage, writeStorage } from "@/lib/local-storage";
import { collections as seedCollections } from "./collections";
import { notifyCatalogChanged, onCatalogChanged } from "./catalog-events";

const COLLECTION_EDITS_KEY = "bookbee_collection_edits";
const CUSTOM_COLLECTIONS_KEY = "bookbee_custom_collections";
const DELETED_COLLECTIONS_KEY = "bookbee_deleted_collections";

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

function getCustomCollections(): Collection[] {
  return readStorage<Collection[]>(CUSTOM_COLLECTIONS_KEY, []);
}

function getDeletedCollectionIds(): string[] {
  return readStorage<string[]>(DELETED_COLLECTIONS_KEY, []);
}

/** Admin: create a brand-new collection. */
export function createCollection(data: Omit<Collection, "id">): Collection {
  const collection: Collection = { id: `custom-collection-${Date.now()}`, ...data };
  writeStorage(CUSTOM_COLLECTIONS_KEY, [...getCustomCollections(), collection]);
  notifyCatalogChanged();
  return collection;
}

/** Admin: remove a collection — hides seed ones, drops custom ones. */
export function deleteCollection(id: string): void {
  const custom = getCustomCollections();
  if (custom.some((c) => c.id === id)) {
    writeStorage(CUSTOM_COLLECTIONS_KEY, custom.filter((c) => c.id !== id));
  } else {
    const deleted = getDeletedCollectionIds();
    if (!deleted.includes(id)) writeStorage(DELETED_COLLECTIONS_KEY, [...deleted, id]);
  }
  const edits = getCollectionEdits();
  if (edits[id]) {
    delete edits[id];
    writeStorage(COLLECTION_EDITS_KEY, edits);
  }
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
  const deleted = new Set(getDeletedCollectionIds());
  return [...seedCollections, ...getCustomCollections()]
    .filter((c) => !deleted.has(c.id))
    .map((c) => applyEdit(c, edits[c.id]));
}

export function getCatalogCollectionById(id: string): Collection | undefined {
  if (getDeletedCollectionIds().includes(id)) return undefined;
  const base = [...seedCollections, ...getCustomCollections()].find((c) => c.id === id);
  return base ? applyEdit(base, getCollectionEdits()[id]) : undefined;
}

export { onCatalogChanged };
