/**
 * Zustand persist storage backends.
 *
 * secureStorage  — expo-secure-store (encrypted, ~2KB limit per key)
 *                  Use for: auth state, app preferences
 * asyncStorage   — @react-native-async-storage/async-storage (larger, unencrypted)
 *                  Use for: tickets, stories
 */

import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StateStorage } from 'zustand/middleware';

export const secureStorage: StateStorage = {
  getItem: async (key) => {
    try {
      return await SecureStore.getItemAsync(key);
    } catch {
      return null;
    }
  },
  setItem: async (key, value) => {
    try {
      await SecureStore.setItemAsync(key, value);
    } catch {
      // Silently fail if value exceeds SecureStore limit
    }
  },
  removeItem: async (key) => {
    try {
      await SecureStore.deleteItemAsync(key);
    } catch {}
  },
};

export const asyncStorage: StateStorage = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: (key, value) => AsyncStorage.setItem(key, value),
  removeItem: (key) => AsyncStorage.removeItem(key),
};
