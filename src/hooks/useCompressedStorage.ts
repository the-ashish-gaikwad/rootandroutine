import { useState, useEffect, useCallback, useRef } from 'react';
import { compressToUTF16, decompressFromUTF16 } from 'lz-string';
import { db } from '@/lib/db';

/**
 * Drop-in replacement for useLocalStorage that stores data in IndexedDB
 * with LZ-string compression. Provides the same [value, setValue, removeValue] API.
 */
export function useCompressedStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const initialized = useRef(false);
  const latestValue = useRef<T>(initialValue);

  // Keep ref in sync for use inside callbacks
  latestValue.current = storedValue;

  // Load from IndexedDB on mount
  useEffect(() => {
    let cancelled = false;

    db.compressed
      .get(key)
      .then((record) => {
        if (cancelled) return;
        if (record) {
          try {
            const decompressed = decompressFromUTF16(record.value);
            if (decompressed) {
              const parsed = JSON.parse(decompressed) as T;
              setStoredValue(parsed);
              latestValue.current = parsed;
            }
          } catch (error) {
            console.warn(`Error reading IndexedDB key "${key}":`, error);
          }
        }
        initialized.current = true;
      })
      .catch((error) => {
        if (!cancelled) {
          console.warn(`Error accessing IndexedDB for "${key}":`, error);
          initialized.current = true;
        }
      });

    return () => {
      cancelled = true;
    };
  }, [key]);

  // Persist to IndexedDB (fire-and-forget)
  const persist = useCallback(
    (value: T) => {
      try {
        const json = JSON.stringify(value);
        const compressed = compressToUTF16(json);
        db.compressed
          .put({ key, value: compressed, updatedAt: Date.now() })
          .catch((err) => console.warn(`Error writing IndexedDB key "${key}":`, err));
      } catch (error) {
        console.warn(`Error serializing data for "${key}":`, error);
      }
    },
    [key]
  );

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      const valueToStore =
        value instanceof Function ? value(latestValue.current) : value;
      setStoredValue(valueToStore);
      latestValue.current = valueToStore;
      persist(valueToStore);
    },
    [persist]
  );

  const removeValue = useCallback(() => {
    setStoredValue(initialValue);
    latestValue.current = initialValue;
    db.compressed
      .delete(key)
      .catch((err) => console.warn(`Error removing IndexedDB key "${key}":`, err));
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}
