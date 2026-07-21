import { apiJson } from './socialApi';
import { getSecureJson, setSecureJson } from './cryptoStorage';

type LockType = 'pin' | 'password';

export type LockVault = {
  appLock?: {
    type: LockType;
    salt: string;
    hash: string;
  };
  chatLocks: Record<string, { type: LockType; salt: string; hash: string }>;
};

const LOCAL_VAULT_KEY = 'lock-vault-local';

function bytesToBase64(input: Uint8Array): string {
  return window.btoa(String.fromCharCode(...input));
}

function base64ToBytes(input: string): Uint8Array<ArrayBuffer> {
  const raw = Uint8Array.from(window.atob(input), (char) => char.charCodeAt(0));
  return new Uint8Array(raw) as Uint8Array<ArrayBuffer>;
}

async function pbkdf2Hash(secret: string, salt: Uint8Array<ArrayBuffer>): Promise<string> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 }, material, 256);
  return bytesToBase64(new Uint8Array(bits));
}

async function loadVault(): Promise<LockVault> {
  return (await getSecureJson<LockVault>(LOCAL_VAULT_KEY)) ?? { chatLocks: {} };
}

async function saveVault(vault: LockVault): Promise<void> {
  await setSecureJson(LOCAL_VAULT_KEY, vault);
}

export async function configureAppLock(type: LockType, secret: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Hash(secret, salt);
  const vault = await loadVault();
  vault.appLock = { type, salt: bytesToBase64(salt), hash };
  await saveVault(vault);
}

export async function verifyAppLock(secret: string): Promise<boolean> {
  const vault = await loadVault();
  if (!vault.appLock) {
    return true;
  }
  const hash = await pbkdf2Hash(secret, base64ToBytes(vault.appLock.salt));
  return hash === vault.appLock.hash;
}

export async function hasConfiguredAppLock(): Promise<boolean> {
  const vault = await loadVault();
  return Boolean(vault.appLock);
}

export async function configureChatLock(conversationId: string, type: LockType, secret: string): Promise<void> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const hash = await pbkdf2Hash(secret, salt);
  const vault = await loadVault();
  vault.chatLocks[conversationId] = { type, salt: bytesToBase64(salt), hash };
  await saveVault(vault);
}

export async function hasChatLock(conversationId: string): Promise<boolean> {
  const vault = await loadVault();
  return Boolean(vault.chatLocks[conversationId]);
}

export async function verifyChatLock(conversationId: string, secret: string): Promise<boolean> {
  const vault = await loadVault();
  const lock = vault.chatLocks[conversationId];
  if (!lock) {
    return true;
  }
  const hash = await pbkdf2Hash(secret, base64ToBytes(lock.salt));
  return hash === lock.hash;
}

async function deriveRecoveryKey(recoveryKey: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
  const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(recoveryKey), 'PBKDF2', false, ['deriveKey']);
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', hash: 'SHA-256', salt, iterations: 210000 },
    material,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt', 'decrypt'],
  );
}

export async function exportEncryptedLockVault(recoveryKey: string): Promise<{ encrypted_vault: string; vault_nonce: string; vault_salt: string; vault_version: number; recovery_hint: string }> {
  const vault = await loadVault();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const nonce = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveRecoveryKey(recoveryKey, salt);
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, key, new TextEncoder().encode(JSON.stringify(vault)));
  return {
    encrypted_vault: bytesToBase64(new Uint8Array(ciphertext)),
    vault_nonce: bytesToBase64(nonce),
    vault_salt: bytesToBase64(salt),
    vault_version: 1,
    recovery_hint: recoveryKey.slice(-4).padStart(recoveryKey.length, '*'),
  };
}

export async function importEncryptedLockVault(recoveryKey: string, payload: { encrypted_vault: string; vault_nonce: string; vault_salt: string }): Promise<void> {
  const key = await deriveRecoveryKey(recoveryKey, base64ToBytes(payload.vault_salt));
  const plaintext = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv: base64ToBytes(payload.vault_nonce) },
    key,
    base64ToBytes(payload.encrypted_vault),
  );
  await saveVault(JSON.parse(new TextDecoder().decode(plaintext)) as LockVault);
}

export async function syncEncryptedLockVault(recoveryKey: string): Promise<void> {
  const payload = await exportEncryptedLockVault(recoveryKey);
  await apiJson('/api/v1/security/lock-vault', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export async function restoreEncryptedLockVault(recoveryKey: string): Promise<void> {
  const response = await apiJson<{ success: boolean; vault: { encrypted_vault: string; vault_nonce: string; vault_salt: string } }>('/api/v1/security/lock-vault');
  await importEncryptedLockVault(recoveryKey, response.vault);
}