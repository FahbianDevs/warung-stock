import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

/**
 * Storage service dengan fallback untuk web
 * Menggunakan AsyncStorage untuk native, localStorage untuk web
 * Dengan memory cache untuk performa lebih cepat
 */

interface StorageService {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

function isValidSecureStoreKey(key: string) {
  // expo-secure-store constraint: non-empty and only [A-Za-z0-9._-]
  return /^[A-Za-z0-9._-]+$/.test(key);
}

// Memory cache untuk mempercepat read operations
const memoryCache = new Map<string, string | null>();

// Fallback untuk web menggunakan localStorage
const webStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      // Check memory cache first
      if (memoryCache.has(key)) {
        return memoryCache.get(key) ?? null;
      }
      const value = localStorage.getItem(key);
      memoryCache.set(key, value);
      return value;
    } catch (e) {
      console.error("Web storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
      memoryCache.set(key, value);
    } catch (e) {
      console.error("Web storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      localStorage.removeItem(key);
      memoryCache.set(key, null);
    } catch (e) {
      console.error("Web storage removeItem error:", e);
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
      memoryCache.clear();
    } catch (e) {
      console.error("Web storage clear error:", e);
    }
  },
};

// Wrapper untuk storage native dengan error handling dan retry logic
// Prioritas: SecureStore (tersedia di Expo Go), fallback: AsyncStorage (jika tersedia)
const nativeStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      // Check memory cache first
      if (memoryCache.has(key)) {
        return memoryCache.get(key) ?? null;
      }

      // Try with timeout for native initialization
      const timeoutPromise = new Promise<string | null>((resolve) => {
        setTimeout(() => {
          console.warn(
            "Native storage access timeout - falling back to memory cache",
          );
          resolve(null);
        }, 3000);
      });

      const storagePromise = (async () => {
        const secureAvailable = await SecureStore.isAvailableAsync().catch(
          () => false,
        );

        if (secureAvailable && isValidSecureStoreKey(key)) {
          return await SecureStore.getItemAsync(key);
        }

        // Lazy import AsyncStorage supaya tidak langsung error kalau native module tidak ada
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        return await AsyncStorage.getItem(key);
      })();

      const value = await Promise.race([storagePromise, timeoutPromise]);

      if (value !== null) {
        memoryCache.set(key, value);
      }
      return value;
    } catch (e) {
      console.warn(
        "Native storage getItem error - falling back to memory cache:",
        e,
      );
      // Return dari memory cache jika ada, atau null
      return memoryCache.get(key) ?? null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      memoryCache.set(key, value);
      // Try to save to SecureStore first (Expo Go), then AsyncStorage (jika tersedia)
      const secureAvailable = await SecureStore.isAvailableAsync().catch(
        () => false,
      );

      if (secureAvailable && isValidSecureStoreKey(key)) {
        await SecureStore.setItemAsync(key, value);
        return;
      }

      try {
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        await AsyncStorage.setItem(key, value);
      } catch (asyncErr) {
        console.warn(
          "Native storage setItem failed, using memory cache only:",
          asyncErr,
        );
      }
    } catch (e) {
      console.error("Native storage setItem error:", e);
      memoryCache.set(key, value);
    }
  },
  removeItem: async (key: string) => {
    try {
      memoryCache.set(key, null);
      // Try to remove from SecureStore first, then AsyncStorage
      const secureAvailable = await SecureStore.isAvailableAsync().catch(
        () => false,
      );

      if (secureAvailable && isValidSecureStoreKey(key)) {
        await SecureStore.deleteItemAsync(key);
        return;
      }

      try {
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        await AsyncStorage.removeItem(key);
      } catch (asyncErr) {
        console.warn("Native storage removeItem failed:", asyncErr);
      }
    } catch (e) {
      console.error("Native storage removeItem error:", e);
      memoryCache.set(key, null);
    }
  },
  clear: async () => {
    try {
      const secureAvailable = await SecureStore.isAvailableAsync().catch(
        () => false,
      );

      // SecureStore tidak punya clear() global, jadi kita best-effort hapus key yang pernah di-cache
      if (secureAvailable) {
        const cachedKeys = Array.from(memoryCache.keys());
        memoryCache.clear();
        await Promise.all(
          cachedKeys
            .filter((k) => isValidSecureStoreKey(k))
            .map((k) => SecureStore.deleteItemAsync(k).catch(() => null)),
        );

        // Also clear AsyncStorage for keys that couldn't be stored in SecureStore.
        try {
          const { default: AsyncStorage } = await import(
            "@react-native-async-storage/async-storage"
          );
          await AsyncStorage.clear();
        } catch {
          // ignore
        }
        return;
      }

      memoryCache.clear();

      // Try to clear AsyncStorage, but don't fail if it doesn't work
      try {
        const { default: AsyncStorage } = await import(
          "@react-native-async-storage/async-storage"
        );
        await AsyncStorage.clear();
      } catch (asyncErr) {
        console.warn("Native storage clear failed:", asyncErr);
      }
    } catch (e) {
      console.error("Native storage clear error:", e);
      memoryCache.clear();
    }
  },
};

// Gunakan storage yang sesuai dengan platform
export const storage: StorageService =
  Platform.OS === "web" ? webStorage : nativeStorage;

export default storage;
