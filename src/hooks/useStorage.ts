import { useCallback } from 'react';

const STORAGE_PREFIX = 'sv:';

const hasCloudStorage = (): boolean => {
  try {
    return typeof (window as any).storage?.get === 'function';
  } catch {
    return false;
  }
};

const local = {
  get: (key: string): { value: string } | null => {
    const raw = localStorage.getItem(STORAGE_PREFIX + key);
    return raw !== null ? { value: raw } : null;
  },
  set: (key: string, value: string): { key: string; value: string } | null => {
    try {
      localStorage.setItem(STORAGE_PREFIX + key, value);
      return { key, value };
    } catch {
      return null;
    }
  },
  delete: (key: string): { key: string; deleted: boolean } | null => {
    localStorage.removeItem(STORAGE_PREFIX + key);
    return { key, deleted: true };
  },
  list: (prefix?: string): { keys: string[] } => {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const raw = localStorage.key(i);
      if (!raw || !raw.startsWith(STORAGE_PREFIX)) continue;
      const clean = raw.slice(STORAGE_PREFIX.length);
      if (!prefix || clean.startsWith(prefix)) keys.push(clean);
    }
    return { keys };
  },
};

const getBackend = (): typeof local | (typeof window & { storage: any })['storage'] => {
  return hasCloudStorage() ? (window as any).storage : local;
};

export const useStorage = () => {
  const get = useCallback(async <T = string>(key: string): Promise<T | null> => {
    try {
      const backend = getBackend();
      const result = await backend.get(key);
      if (!result) return null;
      try {
        return JSON.parse(result.value) as T;
      } catch {
        return result.value as T;
      }
    } catch {
      return null;
    }
  }, []);

  const set = useCallback(async <T>(key: string, value: T): Promise<boolean> => {
    try {
      const backend = getBackend();
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const result = await backend.set(key, serialized);
      return !!result;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      const backend = getBackend();
      const result = await backend.delete(key);
      return !!result;
    } catch {
      return false;
    }
  }, []);

  const list = useCallback(async (prefix?: string): Promise<string[]> => {
    try {
      const backend = getBackend();
      const result = await backend.list(prefix);
      return result?.keys || [];
    } catch {
      return [];
    }
  }, []);

  return { get, set, remove, list };
};
