import AsyncStorage from '@react-native-async-storage/async-storage';
import { UiPreferences } from '@/src/types/models';

const PREFERENCE_KEY = 'ui_preferences_v1';

export const defaultUiPreferences: UiPreferences = {
  language: 'en',
  theme: 'vibrant_pink',
};

export async function getUiPreferences(): Promise<UiPreferences> {
  try {
    const raw = await AsyncStorage.getItem(PREFERENCE_KEY);
    if (!raw) return defaultUiPreferences;

    return { ...defaultUiPreferences, ...(JSON.parse(raw) as Partial<UiPreferences>) };
  } catch {
    return defaultUiPreferences;
  }
}

export async function setUiPreferences(preferences: UiPreferences) {
  await AsyncStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences));
}

export async function resetUiPreferences() {
  await AsyncStorage.removeItem(PREFERENCE_KEY);
}
