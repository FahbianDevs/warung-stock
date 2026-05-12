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

// Wrapper untuk AsyncStorage dengan error handling
const nativeStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      // Check memory cache first
      if (memoryCache.has(key)) {
        return memoryCache.get(key) ?? null;
      }
      const value = await AsyncStorage.getItem(key);
      memoryCache.set(key, value);
      return value;
    } catch (e) {
      console.error("Native storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      memoryCache.set(key, value);
    } catch (e) {
      console.error("Native storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
      memoryCache.set(key, null);
    } catch (e) {
      console.error("Native storage removeItem error:", e);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
      memoryCache.clear();
    } catch (e) {
      console.error("Native storage clear error:", e);
    }
  },
};

// Gunakan storage yang sesuai dengan platform
export const storage: StorageService =
  Platform.OS === "web" ? webStorage : nativeStorage;

export default storage;
