import { useCallback } from "react";

export const useStorage = () => {
  const get = useCallback(<T = string>(key: string): T | null => {
    try {
      const value = localStorage.getItem(key);
      if (!value) return null;

      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch {
      return null;
    }
  }, []);

  const set = useCallback(<T>(key: string, value: T): boolean => {
    try {
      const serialized =
        typeof value === "string" ? value : JSON.stringify(value);

      localStorage.setItem(key, serialized);
      return true;
    } catch {
      return false;
    }
  }, []);

  const remove = useCallback((key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }, []);

  const list = useCallback((prefix?: string): string[] => {
    try {
      const keys = Object.keys(localStorage);
      if (!prefix) return keys;

      return keys.filter((k) => k.startsWith(prefix));
    } catch {
      return [];
    }
  }, []);

  return { get, set, remove, list };
};