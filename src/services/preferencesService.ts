import AsyncStorage from '@react-native-async-storage/async-storage';
import { UiPreferences } from '@/src/types/models';

const PREFERENCE_KEY = 'ui_preferences_v1';

const defaultPreferences: UiPreferences = {
  language: 'en',
  theme: 'mint',
};

export async function getUiPreferences(): Promise<UiPreferences> {
  const raw = await AsyncStorage.getItem(PREFERENCE_KEY);
  if (!raw) return defaultPreferences;

  try {
    return { ...defaultPreferences, ...(JSON.parse(raw) as Partial<UiPreferences>) };
  } catch {
    return defaultPreferences;
  }
}

export async function setUiPreferences(preferences: UiPreferences) {
  await AsyncStorage.setItem(PREFERENCE_KEY, JSON.stringify(preferences));
}

