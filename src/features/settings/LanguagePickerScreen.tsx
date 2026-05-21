import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { languageOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { usePreferences } from '@/src/hooks/usePreferences';

export function LanguagePickerScreen() {
  const { preferences, updatePreferences } = usePreferences();

  return (
    <ScreenContainer>
      <AppText variant="h1">Language Picker</AppText>
      <AppText variant="body" tone="muted">
        Choose your preferred display language.
      </AppText>

      <AppCard>
        <View style={styles.list}>
          {languageOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updatePreferences({ language: option.value })}
              style={[styles.item, preferences.language === option.value && styles.itemActive]}
            >
              <AppText variant="body" tone={preferences.language === option.value ? 'inverse' : 'primary'}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  list: {
    gap: theme.spacing.xs,
  },
  item: {
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  itemActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primary,
  },
});

