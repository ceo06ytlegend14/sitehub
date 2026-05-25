import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppIcon } from '@/src/components/AppIcon';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { languageOptions, bioThemeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { usePreferences } from '@/src/hooks/usePreferences';
import { UiPreferences } from '@/src/types/models';
import {
  getRoleCapabilities,
  getRoleLabel,
  getRoleScopeSummary,
} from '@/src/utils/roleCapabilities';

type SavingKey = 'language' | 'theme' | 'reset' | 'signOut' | null;
type Message = { type: 'success' | 'error'; text: string } | null;

export function SettingsScreen() {
  const { signOutUser, user } = useAuth();
  const { preferences, updatePreferences, resetPreferences, isReady } = usePreferences();
  const [savingKey, setSavingKey] = useState<SavingKey>(null);
  const [message, setMessage] = useState<Message>(null);

  const isBusy = savingKey !== null;
  const capabilities = getRoleCapabilities(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const languageLabel = languageOptions.find((option) => option.value === preferences.language)?.label ?? 'English';
  const themeLabel = bioThemeOptions.find((option) => option.value === preferences.theme)?.label ?? 'Vibrant Pink';

  async function savePreference(
    key: Exclude<SavingKey, 'reset' | 'signOut' | null>,
    next: Partial<UiPreferences>,
    label: string
  ) {
    if (!isReady || isBusy) return;

    setSavingKey(key);
    setMessage(null);
    try {
      await updatePreferences(next);
      setMessage({ type: 'success', text: `${label} saved.` });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unable to save settings.';
      setMessage({ type: 'error', text });
    } finally {
      setSavingKey(null);
    }
  }

  async function performReset() {
    if (isBusy) return;

    setSavingKey('reset');
    setMessage(null);
    try {
      await resetPreferences();
      setMessage({ type: 'success', text: 'Settings reset to defaults.' });
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unable to reset settings.';
      setMessage({ type: 'error', text });
    } finally {
      setSavingKey(null);
    }
  }

  function handleReset() {
    Alert.alert('Reset settings?', 'Language and theme will return to the app defaults.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: () => void performReset() },
    ]);
  }

  async function performSignOut() {
    if (isBusy) return;

    setSavingKey('signOut');
    setMessage(null);
    try {
      await signOutUser();
      router.replace(appRoutes.login);
    } catch (error) {
      const text = error instanceof Error ? error.message : 'Unable to sign out.';
      setMessage({ type: 'error', text });
      setSavingKey(null);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h1">Settings</AppText>
        <AppText variant="body" tone="muted">
          Account access, language, theme, and session controls.
        </AppText>
      </View>

      {message ? (
        <View style={[styles.message, message.type === 'error' ? styles.messageError : styles.messageSuccess]}>
          <AppText variant="caption" style={message.type === 'error' ? styles.messageErrorText : styles.messageSuccessText}>
            {message.text}
          </AppText>
        </View>
      ) : null}

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="User" size={20} color={theme.colors.primary} />
          <AppText variant="h2">Account</AppText>
        </View>
        <View style={styles.accountRow}>
          <View style={styles.accountInfo}>
            <AppText variant="body">{user?.displayName ?? 'Guest User'}</AppText>
            <AppText variant="caption" tone="muted">
              {user?.email ?? 'Not signed in'}
            </AppText>
            <AppText variant="caption" tone="muted">
              Scope: {getRoleScopeSummary(user?.role)}
            </AppText>
          </View>
          <View style={styles.rolePill}>
            <AppText variant="caption" tone="inverse" style={styles.roleText}>
              {roleLabel.toUpperCase()}
            </AppText>
          </View>
        </View>
        <View style={styles.detailGrid}>
          <View style={styles.detailCell}>
            <AppText variant="caption" tone="muted">Language</AppText>
            <AppText variant="body" style={styles.detailValue}>{languageLabel}</AppText>
          </View>
          <View style={styles.detailCell}>
            <AppText variant="caption" tone="muted">Theme</AppText>
            <AppText variant="body" style={styles.detailValue}>{themeLabel}</AppText>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="ShieldCheck" size={20} color={theme.colors.primary} />
          <AppText variant="h2">Role Access</AppText>
        </View>
        <View style={styles.capabilityList}>
          {capabilities.map((capability) => (
            <View key={capability.title} style={styles.capabilityRow}>
              <View style={styles.capabilityDot} />
              <View style={styles.capabilityCopy}>
                <AppText variant="body" style={styles.capabilityTitle}>{capability.title}</AppText>
                <AppText variant="caption" tone="muted">{capability.description}</AppText>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="ShieldCheck" size={20} color={theme.colors.primary} />
          <AppText variant="h2">Language</AppText>
        </View>
        <View style={styles.optionWrap}>
          {languageOptions.map((option) => {
            const selected = preferences.language === option.value;
            return (
              <Pressable
                key={option.value}
                disabled={!isReady || isBusy}
                onPress={() => savePreference('language', { language: option.value }, 'Language')}
                style={[
                  styles.option,
                  selected && styles.optionActive,
                  (!isReady || isBusy) && styles.optionDisabled,
                ]}
              >
                <AppText variant="caption" tone={selected ? 'inverse' : 'primary'}>
                  {option.label}
                </AppText>
                {selected ? <AppIcon name="ChevronRight" size={20} color="#fff" /> : null}
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="Settings" size={20} color={theme.colors.primary} />
          <AppText variant="h2">Theme</AppText>
        </View>
        <View style={styles.optionWrap}>
          {bioThemeOptions.map((option) => {
            const selected = preferences.theme === option.value;
            return (
              <Pressable
                key={option.value}
                disabled={!isReady || isBusy}
                onPress={() => savePreference('theme', { theme: option.value }, 'Theme')}
                style={[
                  styles.option,
                  selected && styles.optionActive,
                  (!isReady || isBusy) && styles.optionDisabled,
                ]}
              >
                <View style={styles.themeLabelRow}>
                  <View style={[styles.themeSwatch, { backgroundColor: option.accent }]} />
                  <AppText variant="caption" tone={selected ? 'inverse' : 'primary'}>
                    {option.label}
                  </AppText>
                </View>
                {selected ? <AppIcon name="ChevronRight" size={20} color="#fff" /> : null}
              </Pressable>
            );
          })}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="LogOut" size={20} color={theme.colors.danger} />
          <AppText variant="h2">Session</AppText>
        </View>
        <Pressable
          disabled={isBusy}
          onPress={handleReset}
          style={[styles.actionRow, isBusy && styles.optionDisabled]}
        >
          <View style={styles.actionCopy}>
            <AppText variant="body" style={styles.actionTitle}>Reset Local Settings</AppText>
            <AppText variant="caption" tone="muted">Restore language and theme defaults.</AppText>
          </View>
          <AppText variant="caption" style={styles.actionText}>
            {savingKey === 'reset' ? 'Resetting...' : 'Reset'}
          </AppText>
        </Pressable>
        <Pressable
          disabled={isBusy}
          onPress={() => void performSignOut()}
          style={[styles.actionRow, styles.signOutRow, isBusy && styles.optionDisabled]}
        >
          <View style={styles.actionCopy}>
            <AppText variant="body" style={styles.signOutText}>Sign Out</AppText>
            <AppText variant="caption" tone="muted">End the current account session.</AppText>
          </View>
          <AppText variant="caption" style={styles.signOutText}>
            {savingKey === 'signOut' ? 'Signing out...' : 'Sign Out'}
          </AppText>
        </Pressable>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: 2,
    marginBottom: theme.spacing.xs,
  },
  message: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
  },
  messageSuccess: {
    backgroundColor: '#E9F9F2',
    borderColor: '#BDEBD7',
  },
  messageError: {
    backgroundColor: '#FDEDEC',
    borderColor: '#F5C8C2',
  },
  messageSuccessText: {
    color: '#167B51',
    fontWeight: '700',
  },
  messageErrorText: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  accountRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.md,
  },
  accountInfo: {
    flex: 1,
    gap: 3,
  },
  rolePill: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.primaryDark,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  detailGrid: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  detailCell: {
    flex: 1,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    backgroundColor: '#F7FCFD',
    gap: 3,
  },
  detailValue: {
    fontWeight: '700',
  },
  capabilityList: {
    gap: theme.spacing.sm,
  },
  capabilityRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  capabilityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.primary,
    marginTop: 7,
  },
  capabilityCopy: {
    flex: 1,
    gap: 2,
  },
  capabilityTitle: {
    fontWeight: '700',
  },
  optionWrap: {
    gap: theme.spacing.xs,
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: '#FFFFFF',
  },
  optionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  themeLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  themeSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.7)',
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  signOutRow: {
    marginTop: theme.spacing.sm,
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontWeight: '700',
  },
  actionText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
  signOutText: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
