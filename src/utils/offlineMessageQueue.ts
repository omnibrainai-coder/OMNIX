import { apiJson } from './socialApi';
import { retryWithBackoff } from './retry';

type PendingMessage = {
  id: string;
  conversationId: string;
  payload: Record<string, unknown>;
  createdAt: string;
};

const DB_NAME = 'omnix-offline-queue';
const STORE_NAME = 'messages';

function openQueue(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('Unable to open offline queue'));
  });
}

export async function enqueuePendingMessage(item: PendingMessage): Promise<void> {
  const db = await openQueue();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).put(item);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to queue message'));
  });
  db.close();
}

async function getPendingMessages(): Promise<PendingMessage[]> {
  const db = await openQueue();
  const items = await new Promise<PendingMessage[]>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readonly');
    const request = transaction.objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve((request.result as PendingMessage[]) ?? []);
    request.onerror = () => reject(request.error ?? new Error('Unable to read queue'));
  });
  db.close();
  return items;
}

async function removePendingMessage(id: string): Promise<void> {
  const db = await openQueue();
  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(STORE_NAME, 'readwrite');
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('Unable to remove queued message'));
  });
  db.close();
}

export async function flushPendingMessages(): Promise<void> {
  const pending = await getPendingMessages();
  for (const item of pending) {
    await retryWithBackoff(async () => {
      await apiJson(`/api/chat/conversations/${item.conversationId}/messages`, {
        method: 'POST',
        body: JSON.stringify(item.payload),
      });
      await removePendingMessage(item.id);
    }, { retries: 5, initialDelayMs: 400 });
  }
}