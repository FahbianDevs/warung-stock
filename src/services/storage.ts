import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

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

// Fallback memory-only storage untuk ketika AsyncStorage tidak available
const memoryOnlyStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      if (memoryCache.has(key)) {
        return memoryCache.get(key) ?? null;
      }
      return null;
    } catch (e) {
      console.error("Memory storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      memoryCache.set(key, value);
    } catch (e) {
      console.error("Memory storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      memoryCache.set(key, null);
    } catch (e) {
      console.error("Memory storage removeItem error:", e);
    }
  },
  clear: async () => {
    try {
      memoryCache.clear();
    } catch (e) {
      console.error("Memory storage clear error:", e);
    }
  },
};

// Wrapper untuk AsyncStorage dengan error handling dan retry logic
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
            "AsyncStorage access timeout - falling back to memory cache",
          );
          resolve(null);
        }, 3000);
      });

      const storagePromise = AsyncStorage.getItem(key);
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
      // Try to save to AsyncStorage, but don't fail if it doesn't work
      try {
        await AsyncStorage.setItem(key, value);
      } catch (asyncErr) {
        console.warn(
          "AsyncStorage setItem failed, using memory cache only:",
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
      // Try to remove from AsyncStorage, but don't fail if it doesn't work
      try {
        await AsyncStorage.removeItem(key);
      } catch (asyncErr) {
        console.warn("AsyncStorage removeItem failed:", asyncErr);
      }
    } catch (e) {
      console.error("Native storage removeItem error:", e);
      memoryCache.set(key, null);
    }
  },
  clear: async () => {
    try {
      memoryCache.clear();
      // Try to clear AsyncStorage, but don't fail if it doesn't work
      try {
        await AsyncStorage.clear();
      } catch (asyncErr) {
        console.warn("AsyncStorage clear failed:", asyncErr);
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
