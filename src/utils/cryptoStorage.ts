const DB_NAME = 'omnix-secure-store';
const STORE_NAME = 'kv';

declare global {
	interface Window {
		AndroidSecureBridge?: {
			getSecret: (key: string) => string;
			setSecret: (key: string, value: string) => void;
			removeSecret: (key: string) => void;
		};
	}
}

function openSecureStore(): Promise<IDBDatabase> {
	return new Promise((resolve, reject) => {
		const request = window.indexedDB.open(DB_NAME, 1);
		request.onupgradeneeded = () => {
			const db = request.result;
			if (!db.objectStoreNames.contains(STORE_NAME)) {
				db.createObjectStore(STORE_NAME);
			}
		};
		request.onsuccess = () => resolve(request.result);
		request.onerror = () => reject(request.error ?? new Error('Unable to open secure store'));
	});
}

async function idbSet(key: string, value: string): Promise<void> {
	const db = await openSecureStore();
	await new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');
		transaction.objectStore(STORE_NAME).put(value, key);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error ?? new Error('Secure store write failed'));
	});
	db.close();
}

async function idbGet(key: string): Promise<string | null> {
	const db = await openSecureStore();
	const value = await new Promise<string | null>((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readonly');
		const request = transaction.objectStore(STORE_NAME).get(key);
		request.onsuccess = () => resolve(typeof request.result === 'string' ? request.result : null);
		request.onerror = () => reject(request.error ?? new Error('Secure store read failed'));
	});
	db.close();
	return value;
}

async function idbRemove(key: string): Promise<void> {
	const db = await openSecureStore();
	await new Promise<void>((resolve, reject) => {
		const transaction = db.transaction(STORE_NAME, 'readwrite');
		transaction.objectStore(STORE_NAME).delete(key);
		transaction.oncomplete = () => resolve();
		transaction.onerror = () => reject(transaction.error ?? new Error('Secure store delete failed'));
	});
	db.close();
}

export async function setSecureItem(key: string, value: string): Promise<void> {
	if (window.AndroidSecureBridge) {
		window.AndroidSecureBridge.setSecret(key, value);
		return;
	}
	await idbSet(key, value);
}

export async function getSecureItem(key: string): Promise<string | null> {
	if (window.AndroidSecureBridge) {
		const value = window.AndroidSecureBridge.getSecret(key);
		return value || null;
	}
	return idbGet(key);
}

export async function removeSecureItem(key: string): Promise<void> {
	if (window.AndroidSecureBridge) {
		window.AndroidSecureBridge.removeSecret(key);
		return;
	}
	await idbRemove(key);
}

export async function setSecureJson<T>(key: string, value: T): Promise<void> {
	await setSecureItem(key, JSON.stringify(value));
}

export async function getSecureJson<T>(key: string): Promise<T | null> {
	const raw = await getSecureItem(key);
	if (!raw) {
		return null;
	}
	return JSON.parse(raw) as T;
}
