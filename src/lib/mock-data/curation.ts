import type { Collection } from "@/lib/types";
import { readCatalogStore, writeCatalogStore } from "./catalog-store";
import { collections as seedCollections } from "./collections";
import { onCatalogChanged } from "./catalog-events";

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
  return readCatalogStore<CollectionEditsStore>(COLLECTION_EDITS_KEY, {});
}

export async function saveCollectionEdit(id: string, edit: CollectionEdit): Promise<void> {
  const store = getCollectionEdits();
  store[id] = { ...store[id], ...edit };
  await writeCatalogStore(COLLECTION_EDITS_KEY, store);
}

function getCustomCollections(): Collection[] {
  return readCatalogStore<Collection[]>(CUSTOM_COLLECTIONS_KEY, []);
}

function getDeletedCollectionIds(): string[] {
  return readCatalogStore<string[]>(DELETED_COLLECTIONS_KEY, []);
}

/** Admin: create a brand-new collection. */
export async function createCollection(data: Omit<Collection, "id">): Promise<Collection> {
  const collection: Collection = { id: `custom-collection-${Date.now()}`, ...data };
  await writeCatalogStore(CUSTOM_COLLECTIONS_KEY, [...getCustomCollections(), collection]);
  return collection;
}

/** Admin: remove a collection — hides seed ones, drops custom ones. */
export async function deleteCollection(id: string): Promise<void> {
  const custom = getCustomCollections();
  if (custom.some((c) => c.id === id)) {
    await writeCatalogStore(CUSTOM_COLLECTIONS_KEY, custom.filter((c) => c.id !== id));
  } else {
    const deleted = getDeletedCollectionIds();
    if (!deleted.includes(id)) await writeCatalogStore(DELETED_COLLECTIONS_KEY, [...deleted, id]);
  }
  const edits = getCollectionEdits();
  if (edits[id]) {
    delete edits[id];
    await writeCatalogStore(COLLECTION_EDITS_KEY, edits);
  }
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
