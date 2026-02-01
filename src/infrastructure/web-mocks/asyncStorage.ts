/**
 * Web Mock for @react-native-async-storage/async-storage
 * Uses localStorage as backend
 */

type Callback = (error?: Error | null, result?: string | null) => void;
type MultiCallback = (errors?: readonly (Error | null)[] | null, result?: readonly string[] | null) => void;
type MultiGetCallback = (errors?: readonly (Error | null)[] | null, result?: readonly [string, string | null][] | null) => void;

/**
 * AsyncStorage implementation using localStorage
 */
const AsyncStorage = {
  /**
   * Fetches item from localStorage
   * @param key Key to fetch
   * @param callback Optional callback
   */
  getItem: async (key: string, callback?: Callback): Promise<string | null> => {
    try {
      const value = localStorage.getItem(key);
      callback?.(null, value);
      return value;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.(err, null);
      throw err;
    }
  },

  /**
   * Stores item in localStorage
   * @param key Key to store
   * @param value Value to store
   * @param callback Optional callback
   */
  setItem: async (key: string, value: string, callback?: Callback): Promise<void> => {
    try {
      localStorage.setItem(key, value);
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.(err);
      throw err;
    }
  },

  /**
   * Removes item from localStorage
   * @param key Key to remove
   * @param callback Optional callback
   */
  removeItem: async (key: string, callback?: Callback): Promise<void> => {
    try {
      localStorage.removeItem(key);
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.(err);
      throw err;
    }
  },

  /**
   * Merges value with existing value (JSON merge)
   * @param key Key to merge
   * @param value Value to merge
   * @param callback Optional callback
   */
  mergeItem: async (key: string, value: string, callback?: Callback): Promise<void> => {
    try {
      const existingValue = localStorage.getItem(key);
      let mergedValue: any;

      if (existingValue) {
        const existingObj = JSON.parse(existingValue);
        const newObj = JSON.parse(value);
        mergedValue = { ...existingObj, ...newObj };
      } else {
        mergedValue = JSON.parse(value);
      }

      localStorage.setItem(key, JSON.stringify(mergedValue));
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.(err);
      throw err;
    }
  },

  /**
   * Clears all AsyncStorage data
   * Note: This clears ALL localStorage, use with caution
   * @param callback Optional callback
   */
  clear: async (callback?: Callback): Promise<void> => {
    try {
      // Only clear keys that were set by AsyncStorage (with prefix)
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.(err);
      throw err;
    }
  },

  /**
   * Gets all keys from localStorage
   * @param callback Optional callback
   */
  getAllKeys: async (callback?: MultiCallback): Promise<readonly string[]> => {
    try {
      const keys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          keys.push(key);
        }
      }
      callback?.(null, keys);
      return keys;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.([err], null);
      throw err;
    }
  },

  /**
   * Fetches multiple items from localStorage
   * @param keys Keys to fetch
   * @param callback Optional callback
   */
  multiGet: async (
    keys: readonly string[],
    callback?: MultiGetCallback
  ): Promise<readonly [string, string | null][]> => {
    try {
      const result: [string, string | null][] = keys.map(key => [
        key,
        localStorage.getItem(key),
      ]);
      callback?.(null, result);
      return result;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.([err], null);
      throw err;
    }
  },

  /**
   * Stores multiple items in localStorage
   * @param keyValuePairs Array of [key, value] pairs
   * @param callback Optional callback
   */
  multiSet: async (
    keyValuePairs: readonly [string, string][],
    callback?: MultiCallback
  ): Promise<void> => {
    try {
      keyValuePairs.forEach(([key, value]) => {
        localStorage.setItem(key, value);
      });
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.([err]);
      throw err;
    }
  },

  /**
   * Removes multiple items from localStorage
   * @param keys Keys to remove
   * @param callback Optional callback
   */
  multiRemove: async (
    keys: readonly string[],
    callback?: MultiCallback
  ): Promise<void> => {
    try {
      keys.forEach(key => {
        localStorage.removeItem(key);
      });
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.([err]);
      throw err;
    }
  },

  /**
   * Merges multiple items in localStorage
   * @param keyValuePairs Array of [key, value] pairs
   * @param callback Optional callback
   */
  multiMerge: async (
    keyValuePairs: readonly [string, string][],
    callback?: MultiCallback
  ): Promise<void> => {
    try {
      for (const [key, value] of keyValuePairs) {
        const existingValue = localStorage.getItem(key);
        let mergedValue: any;

        if (existingValue) {
          const existingObj = JSON.parse(existingValue);
          const newObj = JSON.parse(value);
          mergedValue = { ...existingObj, ...newObj };
        } else {
          mergedValue = JSON.parse(value);
        }

        localStorage.setItem(key, JSON.stringify(mergedValue));
      }
      callback?.(null);
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      callback?.([err]);
      throw err;
    }
  },

  /**
   * Flushes any pending requests (no-op for localStorage)
   */
  flushGetRequests: (): void => {
    // No-op for localStorage, synchronous by nature
  },

  /**
   * Hook to use AsyncStorage with React
   * Returns [value, setValue, isLoading]
   */
  useAsyncStorage: (key: string) => {
    return {
      getItem: async (callback?: Callback) => AsyncStorage.getItem(key, callback),
      setItem: async (value: string, callback?: Callback) => AsyncStorage.setItem(key, value, callback),
      mergeItem: async (value: string, callback?: Callback) => AsyncStorage.mergeItem(key, value, callback),
      removeItem: async (callback?: Callback) => AsyncStorage.removeItem(key, callback),
    };
  },
};

export default AsyncStorage;

// Named exports for compatibility
export const getItem = AsyncStorage.getItem;
export const setItem = AsyncStorage.setItem;
export const removeItem = AsyncStorage.removeItem;
export const mergeItem = AsyncStorage.mergeItem;
export const clear = AsyncStorage.clear;
export const getAllKeys = AsyncStorage.getAllKeys;
export const multiGet = AsyncStorage.multiGet;
export const multiSet = AsyncStorage.multiSet;
export const multiRemove = AsyncStorage.multiRemove;
export const multiMerge = AsyncStorage.multiMerge;
export const flushGetRequests = AsyncStorage.flushGetRequests;
export const useAsyncStorage = AsyncStorage.useAsyncStorage;
