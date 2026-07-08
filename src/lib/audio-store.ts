// Persists uploaded audio blobs (dropped mp3 files) in IndexedDB and resolves
// them to playable object URLs at play time. Chapter audioUrl values may be a
// normal https URL or an "idb:<id>" reference produced by putAudioBlob.

const DB_NAME = "bookbee-audio";
const STORE = "blobs";
const IDB_PREFIX = "idb:";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE);
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export function isUploadedAudio(ref: string): boolean {
  return ref.startsWith(IDB_PREFIX);
}

export async function putAudioBlob(file: Blob): Promise<string> {
  const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  const db = await openDb();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put(file, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  db.close();
  return `${IDB_PREFIX}${id}`;
}

const urlCache = new Map<string, string>();

export async function resolveAudioSrc(ref: string): Promise<string> {
  if (!ref || !ref.startsWith(IDB_PREFIX)) return ref;
  if (urlCache.has(ref)) return urlCache.get(ref)!;

  const id = ref.slice(IDB_PREFIX.length);
  try {
    const db = await openDb();
    const blob = await new Promise<Blob | undefined>((resolve, reject) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(id);
      req.onsuccess = () => resolve(req.result as Blob | undefined);
      req.onerror = () => reject(req.error);
    });
    db.close();
    if (!blob) return ref;
    const url = URL.createObjectURL(blob);
    urlCache.set(ref, url);
    return url;
  } catch {
    return ref;
  }
}
