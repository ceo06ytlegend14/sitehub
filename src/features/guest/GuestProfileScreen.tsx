import { router } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppIcon } from '@/src/components/AppIcon';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_SAMPLE_PROFILE_SLUG } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';

export function GuestProfileScreen() {
  const { user, signOutUser } = useAuth();
  const { requireAccount } = useRequireAccount();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h1">Guest Profile</AppText>
        <View style={styles.previewPill}>
          <AppText variant="caption" weight="bold" style={styles.previewPillText}>
            PREVIEW MODE
          </AppText>
        </View>
      </View>

      <AppCard style={styles.identityCard}>
        <View style={styles.avatar}>
          <AppText style={styles.avatarText}>{(user?.displayName ?? 'G')[0]}</AppText>
        </View>
        <View style={styles.identityCopy}>
          <AppText variant="h2">{user?.displayName ?? 'Guest User'}</AppText>
          <AppText variant="caption" tone="muted">
            Explore the app — create an account for your own NFC identity.
          </AppText>
        </View>
      </AppCard>

      <AppButton
        label="Create my profile"
        onPress={() =>
          requireAccount(undefined, {
            message: 'Create an account to build and save your own public NFC identity.',
          })
        }
      />
      <AppButton
        label="Preview sample profile"
        variant="ghost"
        onPress={() => router.push(`/public/${GUEST_SAMPLE_PROFILE_SLUG}`)}
      />

      <AppText variant="caption" tone="muted" style={styles.sectionLabel}>
        Locked until you sign up
      </AppText>
      {[
        { label: 'Generate personal QR', icon: 'QrCode' as const },
        { label: 'Write NFC chip', icon: 'Nfc' as const },
        { label: 'Add to Apple / Google Wallet', icon: 'Wallet' as const },
        { label: 'Upload profile photo', icon: 'Image' as const },
      ].map((action) => (
        <Pressable
          key={action.label}
          onPress={() =>
            requireAccount(undefined, {
              message: `Create an account to unlock: ${action.label.toLowerCase()}.`,
            })
          }
        >
          <AppCard style={styles.lockedRow}>
            <AppIcon name={action.icon} size={20} color={theme.colors.textMuted} />
            <AppText variant="body" style={styles.lockedLabel}>
              {action.label}
            </AppText>
            <AppIcon name="ShieldCheck" size={16} color={theme.colors.textMuted} />
          </AppCard>
        </Pressable>
      ))}

      <AppButton label="Sign In" onPress={() => router.push('/auth/login')} />
      <AppButton label="Sign Out of Guest" variant="outline" onPress={() => void signOutUser()} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.xs,
  },
  previewPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  previewPillText: {
    color: theme.colors.primary,
  },
  identityCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: '700',
  },
  identityCopy: {
    flex: 1,
    gap: 4,
  },
  sectionLabel: {
    marginTop: theme.spacing.md,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  lockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    opacity: 0.85,
  },
  lockedLabel: {
    flex: 1,
  },
});
