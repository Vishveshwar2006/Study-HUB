import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  writeBatch,
} from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "../firebase";

/**
 * Utility to convert undefined values to null or remove them for Firestore compatibility.
 */
export function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) return null;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  const cleanObj: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    const val = obj[key];
    if (val !== undefined) {
      cleanObj[key] = sanitizeForFirestore(val);
    }
  }
  return cleanObj;
}

/**
 * Persistent Tombstone / Deleted IDs Tracker
 * Ensures that once data is deleted, it can never be resurrected or restored
 * from initial mock data, stale cache, or delayed Firestore snapshots.
 */
export function getDeletedIds(collectionName: string): Set<string> {
  try {
    const raw = localStorage.getItem(`co_deleted_ids_${collectionName}`);
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) {
        return new Set(arr.map(String));
      }
    }
  } catch (e) {
    // ignore
  }
  return new Set<string>();
}

export function markIdAsDeleted(collectionName: string, id: string): void {
  if (!id) return;
  try {
    const idStr = String(id);
    const existing = getDeletedIds(collectionName);
    existing.add(idStr);
    localStorage.setItem(
      `co_deleted_ids_${collectionName}`,
      JSON.stringify(Array.from(existing))
    );
  } catch (e) {
    // ignore
  }
}

export function isIdDeleted(collectionName: string, id: string): boolean {
  if (!id) return false;
  return getDeletedIds(collectionName).has(String(id));
}

export function clearDeletedId(collectionName: string, id: string): void {
  if (!id) return;
  try {
    const idStr = String(id);
    const existing = getDeletedIds(collectionName);
    if (existing.has(idStr)) {
      existing.delete(idStr);
      localStorage.setItem(
        `co_deleted_ids_${collectionName}`,
        JSON.stringify(Array.from(existing))
      );
    }
  } catch (e) {
    // ignore
  }
}

/**
 * Normalizes an object so keys are sorted and undefined/null are consistent.
 * Prevents false positive dirty checks between local and remote state.
 */
export function canonicalizeItem(item: any): any {
  if (item === null || item === undefined) return null;
  if (typeof item !== "object") return item;
  if (Array.isArray(item)) {
    return item.map(canonicalizeItem);
  }
  const sortedKeys = Object.keys(item).sort();
  const res: Record<string, any> = {};
  for (const k of sortedKeys) {
    const val = item[k];
    if (val !== undefined) {
      res[k] = canonicalizeItem(val);
    }
  }
  return res;
}

export function areItemsEqual(a: any, b: any): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  return JSON.stringify(canonicalizeItem(a)) === JSON.stringify(canonicalizeItem(b));
}

export function areItemListsEqual(listA: any[], listB: any[]): boolean {
  if (!listA && !listB) return true;
  if (!listA || !listB) return false;
  if (listA.length !== listB.length) return false;

  const sortedA = [...listA].sort((x, y) => String(x.id).localeCompare(String(y.id)));
  const sortedB = [...listB].sort((x, y) => String(x.id).localeCompare(String(y.id)));

  for (let i = 0; i < sortedA.length; i++) {
    if (!areItemsEqual(sortedA[i], sortedB[i])) {
      return false;
    }
  }
  return true;
}

/**
 * Subscribes to a Firestore collection in real time.
 * If the collection in Firestore is empty and fallback items are provided,
 * seeds those fallback items to Firestore so all connected devices get the baseline data.
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onData: (items: T[]) => void,
  initialFallback?: T[]
): () => void {
  const colRef = collection(db, collectionName);

  let isSeeding = false;

  const unsubscribe = onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty && initialFallback && initialFallback.length > 0 && !isSeeding) {
        isSeeding = true;
        try {
          const batch = writeBatch(db);
          initialFallback.forEach((item) => {
            const docRef = doc(db, collectionName, String(item.id));
            batch.set(docRef, sanitizeForFirestore(item), { merge: true });
          });
          await batch.commit();
        } catch (e) {
          console.warn(`Initial seed error for ${collectionName}:`, e);
        } finally {
          isSeeding = false;
        }
        return;
      }

      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({ id: docSnap.id, ...data } as T);
      });

      onData(items);
    },
    (error) => {
      console.warn(`Firestore snapshot error for ${collectionName}:`, error);
      try {
        handleFirestoreError(error, OperationType.GET, collectionName);
      } catch (e) {
        // Fallback gracefully so component state remains responsive
      }
    }
  );

  return unsubscribe;
}

/**
 * Saves or updates a single item in Firestore.
 */
export async function syncDocToFirestore(
  collectionName: string,
  item: { id: string; [key: string]: any }
): Promise<void> {
  if (!item || !item.id) return;
  try {
    const docRef = doc(db, collectionName, String(item.id));
    await setDoc(docRef, sanitizeForFirestore(item), { merge: true });
  } catch (error) {
    console.error(`Failed to sync doc ${item.id} to ${collectionName}:`, error);
  }
}

/**
 * Deletes a document from Firestore and permanently marks it as deleted so it is never restored.
 */
export async function deleteDocFromFirestore(
  collectionName: string,
  id: string
): Promise<void> {
  if (!id) return;
  markIdAsDeleted(collectionName, id);
  try {
    const docRef = doc(db, collectionName, String(id));
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Failed to delete doc ${id} from ${collectionName}:`, error);
  }
}

/**
 * Syncs an entire array to Firestore (saves items, deletes missing ones if desired).
 */
export async function syncArrayToFirestore<T extends { id: string }>(
  collectionName: string,
  currentItems: T[],
  previousItems?: T[]
): Promise<void> {
  try {
    const batch = writeBatch(db);
    currentItems.forEach((item) => {
      const docRef = doc(db, collectionName, String(item.id));
      batch.set(docRef, sanitizeForFirestore(item), { merge: true });
    });

    if (previousItems) {
      const currentIds = new Set(currentItems.map((i) => String(i.id)));
      previousItems.forEach((prev) => {
        if (!currentIds.has(String(prev.id))) {
          const docRef = doc(db, collectionName, String(prev.id));
          batch.delete(docRef);
        }
      });
    }

    await batch.commit();
  } catch (error) {
    console.error(`Failed to sync array to ${collectionName}:`, error);
  }
}
