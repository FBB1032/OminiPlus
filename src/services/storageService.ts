import AsyncStorage from '@react-native-async-storage/async-storage';

export const storageService = {
  async get(key: string): Promise<string | null> {
    try {
      return await AsyncStorage.getItem(key);
    } catch {
      return null;
    }
  },

  async set(key: string, value: string): Promise<void> {
    try {
      await AsyncStorage.setItem(key, value);
    } catch {
      // silently fail
    }
  },

  async setObject<T>(key: string, value: T): Promise<void> {
    try {
      await AsyncStorage.setItem(key, JSON.stringify(value));
    } catch {
      // silently fail
    }
  },

  async getObject<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      await AsyncStorage.removeItem(key);
    } catch {
      // silently fail
    }
  },

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await Promise.all(keys.map((key) => AsyncStorage.removeItem(key)));
    } catch {
      // silently fail
    }
  },

  async clear(): Promise<void> {
    try {
      await AsyncStorage.clear();
    } catch {
      // silently fail
    }
  },
};
