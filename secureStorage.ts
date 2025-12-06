/**
 * SHOESWIPER SECURE STORAGE
 * Phase 1 Security Hardening
 * 
 * Provides encrypted storage for sensitive data
 * Replaces direct localStorage usage for security-critical information
 */

// ============================================
// ENCRYPTION UTILITIES
// ============================================

const ENCRYPTION_KEY_NAME = 'shoeswiper_enc_key';
const STORAGE_PREFIX = 'ss_secure_';

/**
 * Generate a cryptographic key for encryption
 */
async function getOrCreateEncryptionKey(): Promise<CryptoKey> {
  // Check if we have a stored key
  const storedKey = sessionStorage.getItem(ENCRYPTION_KEY_NAME);
  
  if (storedKey) {
    try {
      const keyData = JSON.parse(storedKey);
      return await crypto.subtle.importKey(
        'jwk',
        keyData,
        { name: 'AES-GCM', length: 256 },
        true,
        ['encrypt', 'decrypt']
      );
    } catch (e) {
      // Key corrupted, generate new one
      sessionStorage.removeItem(ENCRYPTION_KEY_NAME);
    }
  }
  
  // Generate new key
  const key = await crypto.subtle.generateKey(
    { name: 'AES-GCM', length: 256 },
    true,
    ['encrypt', 'decrypt']
  );
  
  // Export and store key (in sessionStorage - cleared on tab close)
  const exportedKey = await crypto.subtle.exportKey('jwk', key);
  sessionStorage.setItem(ENCRYPTION_KEY_NAME, JSON.stringify(exportedKey));
  
  return key;
}

/**
 * Encrypt data using AES-GCM
 */
async function encryptData(data: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encodedData = new TextEncoder().encode(data);
  
  const encryptedData = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encodedData
  );
  
  // Combine IV and encrypted data
  const combined = new Uint8Array(iv.length + encryptedData.byteLength);
  combined.set(iv);
  combined.set(new Uint8Array(encryptedData), iv.length);
  
  // Convert to base64
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt data using AES-GCM
 */
async function decryptData(encryptedString: string): Promise<string> {
  const key = await getOrCreateEncryptionKey();
  
  // Decode from base64
  const combined = new Uint8Array(
    atob(encryptedString).split('').map(c => c.charCodeAt(0))
  );
  
  // Extract IV and encrypted data
  const iv = combined.slice(0, 12);
  const encryptedData = combined.slice(12);
  
  const decryptedData = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedData
  );
  
  return new TextDecoder().decode(decryptedData);
}

// ============================================
// SECURE STORAGE CLASS
// ============================================

/**
 * SecureStorage provides encrypted localStorage operations
 * Use for sensitive data like tokens, user preferences, etc.
 */
export class SecureStorage {
  private static instance: SecureStorage;
  private cache: Map<string, any> = new Map();
  
  private constructor() {}
  
  static getInstance(): SecureStorage {
    if (!SecureStorage.instance) {
      SecureStorage.instance = new SecureStorage();
    }
    return SecureStorage.instance;
  }
  
  /**
   * Store encrypted data
   */
  async setItem<T>(key: string, value: T): Promise<void> {
    try {
      const serialized = JSON.stringify(value);
      const encrypted = await encryptData(serialized);
      localStorage.setItem(STORAGE_PREFIX + key, encrypted);
      this.cache.set(key, value);
    } catch (error) {
      console.error('[SecureStorage] Error storing data:', error);
      throw new Error('Failed to securely store data');
    }
  }
  
  /**
   * Retrieve and decrypt data
   */
  async getItem<T>(key: string): Promise<T | null> {
    // Check cache first
    if (this.cache.has(key)) {
      return this.cache.get(key) as T;
    }
    
    try {
      const encrypted = localStorage.getItem(STORAGE_PREFIX + key);
      if (!encrypted) return null;
      
      const decrypted = await decryptData(encrypted);
      const value = JSON.parse(decrypted) as T;
      this.cache.set(key, value);
      return value;
    } catch (error) {
      console.error('[SecureStorage] Error retrieving data:', error);
      // If decryption fails, clear the corrupted data
      localStorage.removeItem(STORAGE_PREFIX + key);
      return null;
    }
  }
  
  /**
   * Remove item
   */
  removeItem(key: string): void {
    localStorage.removeItem(STORAGE_PREFIX + key);
    this.cache.delete(key);
  }
  
  /**
   * Clear all secure storage
   */
  clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(STORAGE_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    this.cache.clear();
  }
  
  /**
   * Check if item exists
   */
  hasItem(key: string): boolean {
    return localStorage.getItem(STORAGE_PREFIX + key) !== null;
  }
}

// ============================================
// NON-SENSITIVE STORAGE (Clear storage)
// ============================================

/**
 * Regular storage for non-sensitive data
 * Use for things like UI preferences, viewed items, etc.
 */
export class AppStorage {
  private static readonly PREFIX = 'shoeswiper_';
  
  static setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('[AppStorage] Error storing data:', error);
    }
  }
  
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = localStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('[AppStorage] Error retrieving data:', error);
      return defaultValue;
    }
  }
  
  static removeItem(key: string): void {
    localStorage.removeItem(this.PREFIX + key);
  }
  
  static clear(): void {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  }
}

// ============================================
// SESSION STORAGE (Cleared on tab close)
// ============================================

/**
 * Session-only storage - cleared when tab closes
 * Use for temporary data that shouldn't persist
 */
export class SessionStore {
  private static readonly PREFIX = 'ss_session_';
  
  static setItem<T>(key: string, value: T): void {
    try {
      sessionStorage.setItem(this.PREFIX + key, JSON.stringify(value));
    } catch (error) {
      console.error('[SessionStore] Error storing data:', error);
    }
  }
  
  static getItem<T>(key: string, defaultValue: T | null = null): T | null {
    try {
      const item = sessionStorage.getItem(this.PREFIX + key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.error('[SessionStore] Error retrieving data:', error);
      return defaultValue;
    }
  }
  
  static removeItem(key: string): void {
    sessionStorage.removeItem(this.PREFIX + key);
  }
}

// ============================================
// STORAGE KEYS CONFIGURATION
// ============================================

/**
 * Centralized storage key configuration
 * Defines which storage type to use for each data type
 */
export const StorageKeys = {
  // Secure (encrypted) storage
  SECURE: {
    AUTH_TOKEN: 'auth_token',
    REFRESH_TOKEN: 'refresh_token',
    USER_EMAIL: 'user_email',
    STRIPE_CUSTOMER_ID: 'stripe_customer_id',
  },
  
  // Regular storage (non-sensitive)
  APP: {
    FAVORITES: 'favorites',
    PRICE_ALERTS: 'price_alerts',
    PRICE_NOTIFICATIONS: 'price_notifications',
    REFERRAL_CODE: 'referral_code',
    REFERRAL_STATS: 'referral_stats',
    NOTIFICATION_SETTINGS: 'notification_settings',
    THEME: 'theme',
    LANGUAGE: 'language',
    ONBOARDING_COMPLETE: 'onboarding_complete',
    SEARCH_HISTORY: 'search_history',
    RECENTLY_VIEWED: 'recently_viewed',
  },
  
  // Session storage (cleared on tab close)
  SESSION: {
    CURRENT_SESSION_ID: 'session_id',
    LAST_SEARCH_FILTERS: 'search_filters',
    FEED_POSITION: 'feed_position',
    ANALYTICS_BUFFER: 'analytics_buffer',
  },
} as const;

// ============================================
// MIGRATION UTILITY
// ============================================

/**
 * Migrate existing localStorage data to new secure storage
 * Call this once on app initialization
 */
export async function migrateToSecureStorage(): Promise<void> {
  const secureStorage = SecureStorage.getInstance();
  
  // List of keys to migrate to secure storage
  const keysToMigrate = [
    'shoeswiper_email_capture',
    // Add other sensitive keys here
  ];
  
  for (const key of keysToMigrate) {
    const existingData = localStorage.getItem(key);
    if (existingData) {
      try {
        const parsed = JSON.parse(existingData);
        const newKey = key.replace('shoeswiper_', '');
        await secureStorage.setItem(newKey, parsed);
        localStorage.removeItem(key); // Remove old unencrypted data
        console.log(`[Migration] Migrated ${key} to secure storage`);
      } catch (error) {
        console.error(`[Migration] Failed to migrate ${key}:`, error);
      }
    }
  }
}

// ============================================
// REACT HOOKS
// ============================================

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook for using secure storage
 */
export function useSecureStorage<T>(
  key: string,
  initialValue: T
): [T | null, (value: T) => Promise<void>, boolean] {
  const [storedValue, setStoredValue] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const loadValue = async () => {
      const secureStorage = SecureStorage.getInstance();
      const value = await secureStorage.getItem<T>(key);
      setStoredValue(value ?? initialValue);
      setLoading(false);
    };
    loadValue();
  }, [key, initialValue]);
  
  const setValue = useCallback(async (value: T) => {
    const secureStorage = SecureStorage.getInstance();
    await secureStorage.setItem(key, value);
    setStoredValue(value);
  }, [key]);
  
  return [storedValue, setValue, loading];
}

/**
 * Hook for using app storage
 */
export function useAppStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return AppStorage.getItem<T>(key, initialValue) ?? initialValue;
  });
  
  const setValue = useCallback((value: T) => {
    AppStorage.setItem(key, value);
    setStoredValue(value);
  }, [key]);
  
  return [storedValue, setValue];
}

/**
 * Hook for using session storage
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T) => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    return SessionStore.getItem<T>(key, initialValue) ?? initialValue;
  });
  
  const setValue = useCallback((value: T) => {
    SessionStore.setItem(key, value);
    setStoredValue(value);
  }, [key]);
  
  return [storedValue, setValue];
}

// ============================================
// FINGERPRINT / DEVICE ID (for rate limiting)
// ============================================

/**
 * Generate a semi-persistent device fingerprint
 * Used for rate limiting anonymous users
 */
export async function getDeviceFingerprint(): Promise<string> {
  const components = [
    navigator.userAgent,
    navigator.language,
    screen.width,
    screen.height,
    screen.colorDepth,
    new Date().getTimezoneOffset(),
    navigator.hardwareConcurrency || 0,
  ];
  
  const fingerprint = components.join('|');
  
  // Hash the fingerprint
  const encoder = new TextEncoder();
  const data = encoder.encode(fingerprint);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('').substring(0, 32);
}

// ============================================
// EXPORT
// ============================================

export const secureStorage = SecureStorage.getInstance();

export default {
  SecureStorage,
  AppStorage,
  SessionStore,
  StorageKeys,
  migrateToSecureStorage,
  useSecureStorage,
  useAppStorage,
  useSessionStorage,
  getDeviceFingerprint,
};
