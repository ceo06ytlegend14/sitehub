import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { AppSelect } from '@/src/components/AppSelect';
import { AppText } from '@/src/components/AppText';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { bioThemeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { BioTheme } from '@/src/types/models';

export function ThemePickerScreen() {
  const { user } = useAuth();
  const { bioPage, saveBioPage, isLoading } = useBioPage(user?.id ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const current = bioPage?.theme ?? 'vibrant_pink';

  async function handleSelect(value: BioTheme) {
    if (!bioPage || saving) return;
    setSaving(true);
    setError(null);
    try {
      await saveBioPage({ ...bioPage, theme: value });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save theme.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppHeader
        title="Bio theme"
        subtitle="Public page look"
        showBack={router.canGoBack()}
      />
      <AppText variant="body" tone="muted">
        Pick the look for your public bio page. Changes save when you choose a theme.
      </AppText>

      {error ? (
        <AppText variant="caption" style={styles.error}>
          {error}
        </AppText>
      ) : null}

      <AppCard>
        <AppSelect<BioTheme>
          label="Theme"
          value={current}
          disabled={isLoading || !bioPage || saving}
          options={bioThemeOptions.map((opt) => ({
            label: opt.label,
            value: opt.value,
            leading: (
              <View style={[styles.swatch, { backgroundColor: opt.bg }]}>
                <View style={[styles.swatchBar, { backgroundColor: opt.accent }]} />
              </View>
            ),
          }))}
          onChange={(value) => void handleSelect(value)}
        />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  swatch: {
    width: 36,
    height: 36,
    borderRadius: theme.radius.md,
    justifyContent: 'flex-end',
    padding: 4,
  },
  swatchBar: {
    height: 6,
    borderRadius: theme.radius.pill,
    opacity: 0.85,
  },
  error: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
