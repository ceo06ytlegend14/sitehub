import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';
import {
  defaultUiPreferences,
  getUiPreferences,
  resetUiPreferences,
  setUiPreferences,
} from '@/src/services/preferencesService';
import { UiPreferences } from '@/src/types/models';

interface PreferencesContextValue {
  preferences: UiPreferences;
  isReady: boolean;
  updatePreferences: (next: Partial<UiPreferences>) => Promise<void>;
  resetPreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<UiPreferences>(defaultUiPreferences);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    getUiPreferences()
      .then((stored) => setPreferences(stored))
      .finally(() => setIsReady(true));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({
      preferences,
      isReady,
      async updatePreferences(next) {
        const previous = preferences;
        const updated = { ...preferences, ...next };
        setPreferences(updated);
        try {
          await setUiPreferences(updated);
        } catch (error) {
          setPreferences(previous);
          throw error;
        }
      },
      async resetPreferences() {
        const previous = preferences;
        setPreferences(defaultUiPreferences);
        try {
          await resetUiPreferences();
        } catch (error) {
          setPreferences(previous);
          throw error;
        }
      },
    }),
    [isReady, preferences]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export { PreferencesContext };
