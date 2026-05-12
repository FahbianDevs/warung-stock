import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

/**
 * Storage service dengan fallback untuk web
 * Menggunakan AsyncStorage untuk native, localStorage untuk web
 */

interface StorageService {
  getItem: (key: string) => Promise<string | null>;
  setItem: (key: string, value: string) => Promise<void>;
  removeItem: (key: string) => Promise<void>;
  clear: () => Promise<void>;
}

// Fallback untuk web menggunakan localStorage
const webStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.error("Web storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.error("Web storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      console.error("Web storage removeItem error:", e);
    }
  },
  clear: async () => {
    try {
      localStorage.clear();
    } catch (e) {
      console.error("Web storage clear error:", e);
    }
  },
};

// Wrapper untuk AsyncStorage dengan error handling
const nativeStorage: StorageService = {
  getItem: async (key: string) => {
    try {
      return await AsyncStorage.getItem(key);
    } catch (e) {
      console.error("Native storage getItem error:", e);
      return null;
    }
  },
  setItem: async (key: string, value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
    } catch (e) {
      console.error("Native storage setItem error:", e);
    }
  },
  removeItem: async (key: string) => {
    try {
      await AsyncStorage.removeItem(key);
    } catch (e) {
      console.error("Native storage removeItem error:", e);
    }
  },
  clear: async () => {
    try {
      await AsyncStorage.clear();
    } catch (e) {
      console.error("Native storage clear error:", e);
    }
  },
};

// Gunakan storage yang sesuai dengan platform
export const storage: StorageService =
  Platform.OS === "web" ? webStorage : nativeStorage;

export default storage;
