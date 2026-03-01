import { useCallback } from 'react';

export const useStorage = () => {
  const get = useCallback(async <T = string>(key: string): Promise<T | null> => {
    try {
      const result = await (window as any).storage.get(key);
      if (!result) return null;
      try { return JSON.parse(result.value) as T; } catch { return result.value as T; }
    } catch { return null; }
  }, []);

  const set = useCallback(async <T>(key: string, value: T): Promise<boolean> => {
    try {
      const serialized = typeof value === 'string' ? value : JSON.stringify(value);
      const result = await (window as any).storage.set(key, serialized);
      return !!result;
    } catch { return false; }
  }, []);

  const remove = useCallback(async (key: string): Promise<boolean> => {
    try {
      const result = await (window as any).storage.delete(key);
      return !!result;
    } catch { return false; }
  }, []);

  const list = useCallback(async (prefix?: string): Promise<string[]> => {
    try {
      const result = await (window as any).storage.list(prefix);
      return result?.keys || [];
    } catch { return []; }
  }, []);

  return { get, set, remove, list };
};