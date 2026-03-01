/**
 * useStorage - Stable localStorage wrapper (singleton).
 *
 * Returns the same object reference every render so it is safe
 * to include in useEffect / useCallback dependency arrays
 * without causing infinite re-render loops.
 */

const get = <T = string>(key: string): T | null => {
  try {
    const value = localStorage.getItem(key);
    if (value === null) return null;
    try { return JSON.parse(value) as T; }
    catch { return value as T; }
  } catch { return null; }
};

const set = <T>(key: string, value: T): boolean => {
  try {
    const serialized = typeof value === 'string' ? value : JSON.stringify(value);
    localStorage.setItem(key, serialized);
    return true;
  } catch { return false; }
};

const remove = (key: string): boolean => {
  try { localStorage.removeItem(key); return true; }
  catch { return false; }
};

const list = (prefix?: string): string[] => {
  try {
    const keys = Object.keys(localStorage);
    return prefix ? keys.filter((k) => k.startsWith(prefix)) : keys;
  } catch { return []; }
};

const storageApi = { get, set, remove, list } as const;

export const useStorage = () => storageApi;
