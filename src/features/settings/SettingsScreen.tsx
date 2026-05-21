import { router } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { languageOptions, themeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRoleFlags } from '@/src/hooks/useRoleFlags';
import { usePreferences } from '@/src/hooks/usePreferences';

export function SettingsScreen() {
  const { signOutUser } = useAuth();
  const { isCustomer } = useRoleFlags();
  const { preferences, updatePreferences } = usePreferences();

  async function handleSignOut() {
    try {
      await signOutUser();
      router.replace('/auth/login');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign out';
      Alert.alert('Error', message);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="h1">Settings</AppText>
      <AppText variant="body" tone="muted">
        Language, theme, and account controls.
      </AppText>

      <AppCard>
        <AppText variant="h2">Language Picker</AppText>
        <View style={styles.optionWrap}>
          {languageOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updatePreferences({ language: option.value })}
              style={[styles.option, preferences.language === option.value && styles.optionActive]}
            >
              <AppText variant="caption" tone={preferences.language === option.value ? 'inverse' : 'primary'}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <AppText variant="h2">Theme Picker</AppText>
        <View style={styles.optionWrap}>
          {themeOptions.map((option) => (
            <Pressable
              key={option.value}
              onPress={() => updatePreferences({ theme: option.value })}
              style={[styles.option, preferences.theme === option.value && styles.optionActive]}
            >
              <AppText variant="caption" tone={preferences.theme === option.value ? 'inverse' : 'primary'}>
                {option.label}
              </AppText>
            </Pressable>
          ))}
        </View>
        {isCustomer ? (
          <AppButton label="Open Theme Preview" variant="ghost" onPress={() => router.push('/theme-picker')} />
        ) : null}
      </AppCard>

      <AppCard>
        <AppText variant="h2">Account</AppText>
        <AppText variant="body" tone="muted" style={styles.accountText}>
          Sign out from this device.
        </AppText>
        <AppButton label="Sign Out" variant="secondary" onPress={handleSignOut} />
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  optionWrap: {
    marginTop: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  option: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.sm,
    backgroundColor: '#FFFFFF',
  },
  optionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  accountText: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
});
