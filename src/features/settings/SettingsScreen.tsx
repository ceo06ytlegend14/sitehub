import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { AppSelect } from '@/src/components/AppSelect';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { languageOptions, profileThemeOptions, typographyColorOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAppTheme } from '@/src/hooks/useAppTheme';
import { useAuth } from '@/src/hooks/useAuth';
import { useIsGuest } from '@/src/hooks/useIsGuest';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';
import { ProfileTheme, TypographyColorKey, UiPreferences } from '@/src/types/models';
import {
  getRoleCapabilities,
  getRoleLabel,
  getRoleScopeSummary,
} from '@/src/utils/roleCapabilities';

type SavingKey =
  | 'language'
  | 'profileTheme'
  | 'typographyColor'
  | 'reset'
  | 'signOut'
  | null;
type Message = { type: 'success' | 'error'; text: string } | null;

export function SettingsScreen() {
  const { signOutUser, user } = useAuth();
  const isGuest = useIsGuest();
  const { requireAccount } = useRequireAccount();
  const { preferences, colors, updatePreferences, resetPreferences, isReady } = useAppTheme();
  const [savingKey, setSavingKey] = useState<SavingKey>(null);
  const [message, setMessage] = useState<Message>(null);
  const showBack = router.canGoBack();

  const isBusy = savingKey !== null;
  const controlsDisabled = !isReady;
  const isSaving = (key: Exclude<SavingKey, null>) => savingKey === key;
  const capabilities = getRoleCapabilities(user?.role);
  const roleLabel = getRoleLabel(user?.role);
  const languageLabel =
    languageOptions.find((option) => option.value === preferences.language)?.label ?? 'English';
  const profileThemeLabel =
    profileThemeOptions.find((option) => option.value === preferences.profileTheme)?.label ?? 'Aqua';
  const typographyLabel =
    typographyColorOptions.find((option) => option.value === preferences.typographyColor)?.label ??
    'Deep Teal';

  async function savePreference(
    key: Exclude<SavingKey, 'reset' | 'signOut' | null>,
    next: Partial<UiPreferences>,
    label: string
  ) {
    if (!requireAccount(undefined, { message: 'Create an account to save settings and sync preferences.' })) {
      return;
    }
    if (!isReady || savingKey === key) return;

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
    if (!requireAccount(undefined, { message: 'Create an account to save settings.' })) {
      return;
    }
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
    Alert.alert(
      'Reset settings?',
      'Language, theme, and text color will return to defaults.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => void performReset() },
      ]
    );
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
      <AppHeader
        title="Settings"
        subtitle={isGuest ? 'Preview — changes are not saved' : 'Account & appearance'}
        showBack={showBack}
      />

      {isGuest ? (
        <View style={[styles.message, { backgroundColor: colors.surfaceSoft }]}>
          <AppText variant="caption" style={{ color: colors.primary, fontWeight: '700' }}>
            Guest mode: explore appearance options. Sign up to save settings to your account.
          </AppText>
        </View>
      ) : null}

      {!isReady ? (
        <AppText variant="body" tone="muted">
          Loading your saved preferences…
        </AppText>
      ) : null}

      {message ? (
        <View
          style={[
            styles.message,
            {
              backgroundColor: message.type === 'error' ? colors.surfaceSoft : colors.primarySoft,
            },
          ]}
        >
          <AppText
            variant="caption"
            style={{
              color: message.type === 'error' ? theme.colors.danger : colors.primary,
              fontWeight: '700',
            }}
          >
            {message.text}
          </AppText>
        </View>
      ) : null}

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="User" size={20} color={colors.primary} />
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
          <View style={[styles.rolePill, { backgroundColor: colors.primaryDark }]}>
            <AppText variant="caption" tone="inverse" style={styles.roleText}>
              {roleLabel.toUpperCase()}
            </AppText>
          </View>
        </View>
        <View style={styles.detailGrid}>
          <View style={[styles.detailCell, { backgroundColor: colors.surfaceSoft }]}>
            <AppText variant="caption" tone="muted">
              Language
            </AppText>
            <AppText variant="body" style={styles.detailValue}>
              {languageLabel}
            </AppText>
          </View>
          <View style={[styles.detailCell, { backgroundColor: colors.surfaceSoft }]}>
            <AppText variant="caption" tone="muted">
              Theme
            </AppText>
            <AppText variant="body" style={styles.detailValue}>
              {profileThemeLabel}
            </AppText>
          </View>
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="ShieldCheck" size={20} color={colors.primary} />
          <AppText variant="h2">Role Access</AppText>
        </View>
        <View style={styles.capabilityList}>
          {capabilities.map((capability) => (
            <View key={capability.title} style={styles.capabilityRow}>
              <View style={[styles.capabilityDot, { backgroundColor: colors.primary }]} />
              <View style={styles.capabilityCopy}>
                <AppText variant="body" style={styles.capabilityTitle}>
                  {capability.title}
                </AppText>
                <AppText variant="caption" tone="muted">
                  {capability.description}
                </AppText>
              </View>
            </View>
          ))}
        </View>
      </AppCard>

      <AppCard>
        <View style={styles.sectionHeader}>
          <AppIcon name="ShieldCheck" size={20} color={colors.primary} />
          <AppText variant="h2">Preferences</AppText>
        </View>
        <View style={styles.preferencesStack}>
          <AppSelect
            label="Language"
            value={preferences.language}
            options={languageOptions.map((option) => ({
              label: option.label,
              value: option.value,
            }))}
            disabled={controlsDisabled || isSaving('language')}
            onChange={(value) => void savePreference('language', { language: value }, 'Language')}
          />
          <AppSelect<ProfileTheme>
            label="Profile theme"
            value={preferences.profileTheme}
            description="Aqua, Ocean, or Slate — applies across sales, printer, admin, and guest profiles."
            options={profileThemeOptions.map((option) => ({
              label: option.label,
              value: option.value,
              leading: <View style={[styles.themeSwatch, { backgroundColor: option.accent }]} />,
            }))}
            disabled={controlsDisabled || isSaving('profileTheme')}
            onChange={(value) =>
              void savePreference('profileTheme', { profileTheme: value }, 'Profile theme')
            }
          />
          <AppSelect<TypographyColorKey>
            label="Text color"
            value={preferences.typographyColor}
            description={`Accent color for body text (${typographyLabel} selected).`}
            options={typographyColorOptions.map((option) => ({
              label: option.label,
              value: option.value,
              leading: <View style={[styles.swatchDot, { backgroundColor: option.color }]} />,
            }))}
            disabled={controlsDisabled || isSaving('typographyColor')}
            onChange={(value) =>
              void savePreference('typographyColor', { typographyColor: value }, 'Text color')
            }
          />
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
            <AppText variant="body" style={styles.actionTitle}>
              Reset Local Settings
            </AppText>
            <AppText variant="caption" tone="muted">
              Restore language, theme, and text color defaults.
            </AppText>
          </View>
          <AppText variant="caption" style={[styles.actionText, { color: colors.primary }]}>
            {savingKey === 'reset' ? 'Resetting...' : 'Reset'}
          </AppText>
        </Pressable>
        <Pressable
          disabled={isBusy}
          onPress={() => void performSignOut()}
          style={[
            styles.actionRow,
            styles.signOutRow,
            { borderTopColor: colors.border },
            isBusy && styles.optionDisabled,
          ]}
        >
          <View style={styles.actionCopy}>
            <AppText variant="body" style={styles.signOutText}>
              Sign Out
            </AppText>
            <AppText variant="caption" tone="muted">
              End the current account session.
            </AppText>
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
  message: {
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    ...theme.shadows.card,
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
    borderRadius: theme.radius.md,
    padding: theme.spacing.sm,
    gap: 3,
    ...theme.shadows.card,
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
    marginTop: 7,
  },
  capabilityCopy: {
    flex: 1,
    gap: 2,
  },
  capabilityTitle: {
    fontWeight: '700',
  },
  preferencesStack: {
    gap: theme.spacing.md,
  },
  themeSwatch: {
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  swatchDot: {
    width: 18,
    height: 18,
    borderRadius: 9,
  },
  optionDisabled: {
    opacity: 0.55,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.md,
    paddingBottom: theme.spacing.xs,
  },
  signOutRow: {
    marginTop: theme.spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: theme.spacing.md,
  },
  actionCopy: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontWeight: '700',
  },
  actionText: {
    fontWeight: '700',
  },
  signOutText: {
    color: theme.colors.danger,
    fontWeight: '700',
  },
});
