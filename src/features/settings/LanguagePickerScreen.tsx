import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { AppSelect } from '@/src/components/AppSelect';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { languageOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAppTheme } from '@/src/hooks/useAppTheme';

export function LanguagePickerScreen() {
  const { preferences, updatePreferences, isReady } = useAppTheme();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLanguageChange(value: string) {
    if (!isReady || saving) return;
    setSaving(true);
    setError(null);
    try {
      await updatePreferences({ language: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save language.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Language"
        subtitle="Display language"
        showBack={router.canGoBack()}
      />
      <AppText variant="body" tone="muted">
        Choose your preferred display language. Your choice is saved automatically.
      </AppText>

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <AppCard>
        <AppSelect
          label="Language"
          value={preferences.language}
          options={languageOptions.map((option) => ({
            label: option.label,
            value: option.value,
          }))}
          disabled={!isReady || saving}
          onChange={(value) => void handleLanguageChange(value)}
        />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  error: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
