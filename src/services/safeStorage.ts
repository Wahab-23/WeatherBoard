/**
 * Safe storage wrapper around window.localStorage with automatic in-memory fallback.
 * Ensures the application never crashes in private browsing mode, restricted storage,
 * or environments where localStorage throws SecurityError / QuotaExceededError.
 */

class SafeStorage {
  private memoryFallback: Map<string, string> = new Map();
  private isStorageAvailable: boolean;

  constructor() {
    this.isStorageAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    if (typeof window === 'undefined' || !window.localStorage) {
      return false;
    }
    try {
      const testKey = '__weatherboard_storage_test__';
      window.localStorage.setItem(testKey, '1');
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  public getItem(key: string): string | null {
    if (this.isStorageAvailable) {
      try {
        return window.localStorage.getItem(key);
      } catch {
        // Fallback to memory on failure
        return this.memoryFallback.get(key) ?? null;
      }
    }
    return this.memoryFallback.get(key) ?? null;
  }

  public setItem(key: string, value: string): boolean {
    // Always keep memory fallback in sync
    this.memoryFallback.set(key, value);

    if (this.isStorageAvailable) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.warn(`[SafeStorage] localStorage write failed for key "${key}", using memory fallback:`, err);
        return false;
      }
    }
    return true;
  }

  public removeItem(key: string): boolean {
    this.memoryFallback.delete(key);

    if (this.isStorageAvailable) {
      try {
        window.localStorage.removeItem(key);
        return true;
      } catch (err) {
        console.warn(`[SafeStorage] localStorage remove failed for key "${key}":`, err);
        return false;
      }
    }
    return true;
  }

  public getJSON<T>(key: string, defaultValue: T): T {
    try {
      const item = this.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  public setJSON<T>(key: string, value: T): boolean {
    try {
      return this.setItem(key, JSON.stringify(value));
    } catch {
      return false;
    }
  }

  public isAvailable(): boolean {
    return this.isStorageAvailable;
  }
}

export const safeStorage = new SafeStorage();

