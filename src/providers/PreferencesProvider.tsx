import { PropsWithChildren, createContext, useEffect, useMemo, useState } from 'react';
import { getUiPreferences, setUiPreferences } from '@/src/services/preferencesService';
import { UiPreferences } from '@/src/types/models';

interface PreferencesContextValue {
  preferences: UiPreferences;
  isReady: boolean;
  updatePreferences: (next: Partial<UiPreferences>) => Promise<void>;
}

const defaultPreferences: UiPreferences = {
  language: 'en',
  theme: 'mint',
};

const PreferencesContext = createContext<PreferencesContextValue | undefined>(undefined);

export function PreferencesProvider({ children }: PropsWithChildren) {
  const [preferences, setPreferences] = useState<UiPreferences>(defaultPreferences);
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
        const updated = { ...preferences, ...next };
        setPreferences(updated);
        await setUiPreferences(updated);
      },
    }),
    [isReady, preferences]
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export { PreferencesContext };

