/**
 * NAT-IA Encryption Service
 * End-to-End Encryption for sensitive messages
 * Uses Web Crypto API (browser) and Node crypto (server)
 */

import {
  EncryptionResult,
  DecryptionResult,
  UserEncryptionKey,
  KeyStatus,
  JsonValue,
} from './types';
import { ENCRYPTION_CONFIG } from './constants';
import {
  createSecurityClient,
  type EncryptionKeyRow,
  type SecuritySupabaseClient,
} from './supabase-client';

const KEY_STATUS_VALUES = new Set<KeyStatus>(Object.values(KeyStatus));

function isKeyStatusValue(value: JsonValue | undefined): value is KeyStatus {
  return typeof value === 'string' && KEY_STATUS_VALUES.has(value as KeyStatus);
}

function toStringValue(value: JsonValue | undefined): string | undefined {
  return typeof value === 'string' ? value : undefined;
}

function parseEncryptionRow(record: Record<string, JsonValue>): EncryptionKeyRow | null {
  const userId = toStringValue(record.user_id);
  const keyId = toStringValue(record.key_id);
  const encryptedKey = toStringValue(record.encrypted_key);
  const algorithm = toStringValue(record.algorithm);
  const createdAt = toStringValue(record.created_at);
  const statusValue = record.status;

  if (!userId || !keyId || !encryptedKey || !algorithm || !createdAt || !isKeyStatusValue(statusValue)) {
    return null;
  }

  const row: EncryptionKeyRow = {
    user_id: userId,
    key_id: keyId,
    encrypted_key: encryptedKey,
    algorithm,
    created_at: createdAt,
    status: statusValue,
  };

  if (typeof record.rotated_at === 'string') {
    row.rotated_at = record.rotated_at;
  }

  if (typeof record.id === 'string') {
    row.id = record.id;
  }

  return row;
}

// Supabase client
let supabaseClient: SecuritySupabaseClient | null = null;

// Key cache (in-memory)
const keyCache = new Map<string, CryptoKey>();

/**
 * Inicializa o serviço de criptografia
 */
export function initializeEncryption(
  supabaseUrl: string,
  supabaseKey: string
): void {
  supabaseClient = createSecurityClient(supabaseUrl, supabaseKey);
}

/**
 * Verifica se Web Crypto API está disponível
 */
function isCryptoAvailable(): boolean {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    return true;
  }
  // Node.js crypto
  try {
    require('crypto');
    return true;
  } catch {
    return false;
  }
}

/**
 * Obtém crypto API (browser ou Node.js)
 */
function getCrypto(): {
  subtle: SubtleCrypto;
  getRandomValues: (array: Uint8Array) => Uint8Array;
} {
  if (typeof window !== 'undefined' && window.crypto) {
    return window.crypto;
  }

  // Node.js fallback
  const nodeCrypto = require('crypto');
  return {
    subtle: nodeCrypto.webcrypto.subtle,
    getRandomValues: (array: Uint8Array) => {
      nodeCrypto.randomFillSync(array);
      return array;
    },
  };
}

/**
 * Gera uma chave de criptografia única para uma usuária
 */
export async function generateUserKey(userId: string): Promise<UserEncryptionKey> {
  if (!isCryptoAvailable()) {
    throw new Error('Crypto API not available');
  }

  const crypto = getCrypto();

  // Gerar chave AES-256-GCM
  const key = await crypto.subtle.generateKey(
    {
      name: 'AES-GCM',
      length: ENCRYPTION_CONFIG.KEY_LENGTH * 8, // 256 bits
    },
    true, // extractable
    ['encrypt', 'decrypt']
  );

  // Exportar chave para armazenamento
  const exportedKey = await crypto.subtle.exportKey('raw', key);
  const keyBytes = new Uint8Array(exportedKey);

  // Converter para base64
  const keyBase64 = btoa(String.fromCharCode(...keyBytes));

  // Gerar ID único
  const keyId = await generateKeyId(userId);

  // Criptografar a chave com master key (se disponível)
  const encryptedKey = await encryptMasterKey(keyBase64);

  // Criar registro
  const userKey: UserEncryptionKey = {
    userId,
    keyId,
    encryptedKey,
    algorithm: ENCRYPTION_CONFIG.ALGORITHM,
    createdAt: new Date(),
    status: KeyStatus.ACTIVE,
  };

  // Salvar no Supabase
  if (supabaseClient) {
    await supabaseClient.from('nathia_encryption_keys').insert({
      user_id: userId,
      key_id: keyId,
      encrypted_key: encryptedKey,
      algorithm: ENCRYPTION_CONFIG.ALGORITHM,
      created_at: userKey.createdAt.toISOString(),
      rotated_at: null,
      status: KeyStatus.ACTIVE,
    } satisfies EncryptionKeyRow);
  }

  // Cache da chave
  keyCache.set(userId, key);

  return userKey;
}

/**
 * Recupera chave de criptografia de uma usuária
 */
async function getUserKey(userId: string): Promise<CryptoKey> {
  // Verificar cache
  if (keyCache.has(userId)) {
    return keyCache.get(userId)!;
  }

  if (!supabaseClient) {
    throw new Error('Encryption service not initialized');
  }

  // Buscar do banco
  const { data, error } = await supabaseClient
    .from('nathia_encryption_keys')
    .select('*')
    .eq('user_id', userId)
    .eq('status', KeyStatus.ACTIVE)
    .single();

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error('User encryption key not found');
  }

  const parsedRow = parseEncryptionRow(data);

  if (!parsedRow) {
    throw new Error('User encryption key not found');
  }

  // Descriptografar chave com master key
  const keyBase64 = await decryptMasterKey(parsedRow.encrypted_key);

  // Converter de base64 para bytes
  const keyBytes = Uint8Array.from(atob(keyBase64), (c) => c.charCodeAt(0));

  // Importar chave
  const crypto = getCrypto();
  const key = await crypto.subtle.importKey(
    'raw',
    keyBytes,
    {
      name: 'AES-GCM',
      length: ENCRYPTION_CONFIG.KEY_LENGTH * 8,
    },
    true,
    ['encrypt', 'decrypt']
  );

  // Cachear
  keyCache.set(userId, key);

  return key;
}

/**
 * Criptografa uma mensagem
 */
export async function encryptMessage(
  userId: string,
  plaintext: string
): Promise<EncryptionResult> {
  if (!isCryptoAvailable()) {
    // Fallback: retornar sem criptografar (com warning)
    console.warn('[Encryption] Crypto not available, storing plaintext');
    return {
      encrypted: plaintext,
      iv: '',
      keyId: 'none',
    };
  }

  try {
    const crypto = getCrypto();

    // Obter chave do usuário (ou gerar se não existir)
    let key: CryptoKey;
    try {
      key = await getUserKey(userId);
    } catch {
      const userKey = await generateUserKey(userId);
      key = await getUserKey(userId);
    }

    // Gerar IV (Initialization Vector)
    const iv = new Uint8Array(ENCRYPTION_CONFIG.IV_LENGTH);
    crypto.getRandomValues(iv);

    // Converter texto para bytes
    const encoder = new TextEncoder();
    const data = encoder.encode(plaintext);

    // Criptografar
    const encryptedData = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv,
      },
      key,
      data
    );

    // Converter para base64
    const encryptedBytes = new Uint8Array(encryptedData);
    const encryptedBase64 = btoa(String.fromCharCode(...encryptedBytes));
    const ivBase64 = btoa(String.fromCharCode(...iv));

    // Extrair auth tag (últimos 16 bytes)
    const authTag = encryptedBytes.slice(-ENCRYPTION_CONFIG.AUTH_TAG_LENGTH);
    const authTagBase64 = btoa(String.fromCharCode(...authTag));

    return {
      encrypted: encryptedBase64,
      iv: ivBase64,
      authTag: authTagBase64,
      keyId: await getKeyId(userId),
    };
  } catch (error) {
    console.error('[Encryption] Error encrypting message:', error);
    throw error;
  }
}

/**
 * Descriptografa uma mensagem
 */
export async function decryptMessage(
  userId: string,
  encrypted: string,
  iv: string,
  keyId: string
): Promise<DecryptionResult> {
  if (!isCryptoAvailable() || keyId === 'none') {
    // Fallback: retornar como está (não criptografado)
    return {
      decrypted: encrypted,
      success: true,
    };
  }

  try {
    const crypto = getCrypto();

    // Obter chave
    const key = await getUserKey(userId);

    // Converter de base64 para bytes
    const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
      c.charCodeAt(0)
    );
    const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

    // Descriptografar
    const decryptedData = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBytes,
      },
      key,
      encryptedBytes
    );

    // Converter bytes para texto
    const decoder = new TextDecoder();
    const decrypted = decoder.decode(decryptedData);

    return {
      decrypted,
      success: true,
    };
  } catch (error) {
    console.error('[Encryption] Error decrypting message:', error);
    return {
      decrypted: '',
      success: false,
      error: 'Decryption failed',
    };
  }
}

/**
 * Gera ID único para chave
 */
async function generateKeyId(userId: string): Promise<string> {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `key_${userId}_${timestamp}_${random}`;
}

/**
 * Obtém ID da chave ativa do usuário
 */
async function getKeyId(userId: string): Promise<string> {
  if (!supabaseClient) {
    return 'none';
  }

  const { data } = await supabaseClient
    .from('nathia_encryption_keys')
    .select('key_id')
    .eq('user_id', userId)
    .eq('status', KeyStatus.ACTIVE)
    .single();

  const keyIdValue = data ? toStringValue(data.key_id) : undefined;

  return keyIdValue || 'none';
}

/**
 * Criptografa chave com master key (para armazenamento seguro)
 * NOTA: Esta é uma implementação simplificada. Em produção, use KMS (AWS KMS, Google Cloud KMS, etc)
 */
async function encryptMasterKey(keyData: string): Promise<string> {
  // Em produção, usar KMS (Key Management Service)
  // Por enquanto, retornar como está (base64)
  // TODO: Implementar KMS integration

  return keyData;
}

/**
 * Descriptografa chave com master key
 */
async function decryptMasterKey(encryptedKey: string): Promise<string> {
  // Em produção, usar KMS
  // Por enquanto, retornar como está
  // TODO: Implementar KMS integration

  return encryptedKey;
}

/**
 * Rotaciona chave de uma usuária (para segurança)
 */
export async function rotateUserKey(userId: string): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Encryption service not initialized');
  }

  // Marcar chave atual como deprecated
  await supabaseClient
    .from('nathia_encryption_keys')
    .update({
      status: KeyStatus.DEPRECATED,
      rotated_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', KeyStatus.ACTIVE);

  // Gerar nova chave
  await generateUserKey(userId);

  // Remover do cache
  keyCache.delete(userId);

  // TODO: Re-criptografar mensagens antigas com nova chave (background job)
}

/**
 * Verifica se usuário tem chave ativa
 */
export async function hasActiveKey(userId: string): Promise<boolean> {
  if (!supabaseClient) {
    return false;
  }

  const { data, error } = await supabaseClient
    .from('nathia_encryption_keys')
    .select('key_id')
    .eq('user_id', userId)
    .eq('status', KeyStatus.ACTIVE)
    .single();

  if (error) {
    return false;
  }

  return data ? typeof data.key_id === 'string' : false;
}

/**
 * Revoga chave de uma usuária (em caso de comprometimento)
 */
export async function revokeUserKey(userId: string): Promise<void> {
  if (!supabaseClient) {
    throw new Error('Encryption service not initialized');
  }

  await supabaseClient
    .from('nathia_encryption_keys')
    .update({
      status: KeyStatus.REVOKED,
    })
    .eq('user_id', userId);

  // Remover do cache
  keyCache.delete(userId);
}

/**
 * Limpa cache de chaves
 */
export function clearKeyCache(): void {
  keyCache.clear();
}

/**
 * Verifica se chave precisa de rotação
 */
export async function needsKeyRotation(userId: string): Promise<boolean> {
  if (!supabaseClient) {
    return false;
  }

  const { data } = await supabaseClient
    .from('nathia_encryption_keys')
    .select('created_at, rotated_at')
    .eq('user_id', userId)
    .eq('status', KeyStatus.ACTIVE)
    .single();

  if (!data) return false;

  const createdAt = toStringValue(data.created_at) || '';
  const rotatedAt = toStringValue(data.rotated_at);

  if (!createdAt) {
    return false;
  }

  const referenceDate = rotatedAt || createdAt;
  const keyAge = Date.now() - new Date(referenceDate).getTime();
  const maxAge = ENCRYPTION_CONFIG.KEY_ROTATION_DAYS * 24 * 60 * 60 * 1000;

  return keyAge > maxAge;
}

/**
 * Hash de mensagem para verificação de integridade (sem criptografia)
 */
export async function hashMessage(message: string): Promise<string> {
  const crypto = getCrypto();
  const encoder = new TextEncoder();
  const data = encoder.encode(message);

  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));

  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Verifica integridade de mensagem
 */
export async function verifyMessageIntegrity(
  message: string,
  expectedHash: string
): Promise<boolean> {
  const actualHash = await hashMessage(message);
  return actualHash === expectedHash;
}
