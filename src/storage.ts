import type { PlannerState } from './types';

const DB_NAME = 'study-tape-v1';
const STORE = 'planner';
const KEY = 'current';

function database(): Promise<IDBDatabase> {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error || new Error('Could not open local storage.'));
  });
}

export async function loadState(): Promise<PlannerState | undefined> {
  const db = await database();
  return new Promise<PlannerState | undefined>((resolve, reject) => {
    const request = db.transaction(STORE).objectStore(STORE).get(KEY);
    request.onsuccess = () => resolve(request.result as PlannerState | undefined);
    request.onerror = () => reject(request.error || new Error('Could not read local data.'));
  }).finally(() => db.close());
}

export async function saveState(state: PlannerState): Promise<void> {
  const db = await database();
  return new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE, 'readwrite');
    transaction.objectStore(STORE).put(state, KEY);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error || new Error('Could not save local data.'));
  }).finally(() => db.close());
}
