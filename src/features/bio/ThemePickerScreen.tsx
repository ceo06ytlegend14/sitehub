import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { themeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

const previewColors = {
  mint: ['#D8FFF3', '#7DE8C0'],
  coral: ['#FFE0D6', '#FF9E85'],
  ocean: ['#DDF1FF', '#7FC6F4'],
} as const;

export function ThemePickerScreen() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <ScreenContainer>
      <AppText variant="h1">Pick Theme</AppText>
      <AppText variant="body" tone="muted">
        Choose your Bio Cloud look.
      </AppText>

      {themeOptions.map((option) => (
        <Pressable key={option.value} onPress={() => updatePreferences({ theme: option.value })}>
          <AppCard style={[styles.card, preferences.theme === option.value && styles.cardActive]}>
            <View style={[styles.preview, { backgroundColor: previewColors[option.value][0] }]}>
              <View style={[styles.previewAccent, { backgroundColor: previewColors[option.value][1] }]} />
            </View>
            <View style={styles.copy}>
              <AppText variant="h2">{option.label}</AppText>
              <AppText variant="caption" tone="muted">
                {preferences.theme === option.value ? 'Selected' : 'Tap to apply'}
              </AppText>
            </View>
          </AppCard>
        </Pressable>
      ))}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  cardActive: {
    borderColor: theme.colors.primary,
    borderWidth: 2,
  },
  preview: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.lg,
    justifyContent: 'flex-end',
    padding: theme.spacing.xs,
  },
  previewAccent: {
    height: 16,
    borderRadius: theme.radius.pill,
  },
  copy: {
    gap: theme.spacing.xxs,
  },
});

