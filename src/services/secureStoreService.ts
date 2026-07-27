import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from '../utils/logger';

const isWeb = Platform.OS === 'web';

export const secureStoreService = {
  async set(key: string, value: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.setItem(key, value);
      } else {
        await SecureStore.setItemAsync(key, value);
      }
    } catch (error) {
      logger.error('[SecureStore] Failed to save key:', error);
    }
  },

  async get(key: string): Promise<string | null> {
    try {
      if (isWeb) {
        return await AsyncStorage.getItem(key);
      } else {
        return await SecureStore.getItemAsync(key);
      }
    } catch (error) {
      logger.error('[SecureStore] Failed to read key:', error);
      return null;
    }
  },

  async remove(key: string): Promise<void> {
    try {
      if (isWeb) {
        await AsyncStorage.removeItem(key);
      } else {
        await SecureStore.deleteItemAsync(key);
      }
    } catch (error) {
      logger.error('[SecureStore] Failed to remove key:', error);
    }
  },
};
