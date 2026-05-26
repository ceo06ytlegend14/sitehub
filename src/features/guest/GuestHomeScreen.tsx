import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppIcon } from '@/src/components/AppIcon';
import { MetricCard } from '@/src/components/MetricCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_DEMO_ANALYTICS, GUEST_SAMPLE_PROFILE_SLUG } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';

export function GuestHomeScreen() {
  const { user } = useAuth();
  const { requireAccount } = useRequireAccount();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="caption" tone="muted" style={styles.greeting}>
          Guest Preview
        </AppText>
        <AppText variant="h1">Hello, {user?.displayName ?? 'there'}</AppText>
        <AppText variant="body" tone="muted">
          Scan, tap, and explore — sign up when you are ready for your own NFC identity.
        </AppText>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Demo views" value={String(GUEST_DEMO_ANALYTICS.profileViews)} highlight="Preview" />
        <MetricCard label="Demo taps" value={String(GUEST_DEMO_ANALYTICS.nfcTaps)} />
      </View>

      <AppCard style={styles.actionCard}>
        <View style={styles.actionCardInner}>
          <View style={styles.actionIcon}>
            <AppIcon name="ScanLine" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.actionText}>
            <AppText variant="h2">Scan QR</AppText>
            <AppText variant="caption" tone="muted">
              Try the camera scanner or open demo profile codes.
            </AppText>
          </View>
        </View>
        <AppButton label="Open Scanner" onPress={() => router.push('/scan')} />
      </AppCard>

      <AppCard style={styles.actionCard}>
        <View style={styles.actionCardInner}>
          <View style={[styles.actionIcon, styles.actionIconNfc]}>
            <AppIcon name="Nfc" size={22} color="#7c3aed" />
          </View>
          <View style={styles.actionText}>
            <AppText variant="h2">NFC Tap Preview</AppText>
            <AppText variant="caption" tone="muted">
              Simulated tap animation → sample public profile (no chip write).
            </AppText>
          </View>
        </View>
        <AppButton label="Try NFC Demo" variant="secondary" onPress={() => router.push('/nfc-demo')} />
      </AppCard>

      <AppCard style={styles.actionCard}>
        <View style={styles.actionCardInner}>
          <View style={styles.actionIcon}>
            <AppIcon name="User" size={22} color={theme.colors.primary} />
          </View>
          <View style={styles.actionText}>
            <AppText variant="h2">Sample profile</AppText>
            <AppText variant="caption" tone="muted">
              View Instagram, Telegram, and preview Add to Contact.
            </AppText>
          </View>
        </View>
        <AppButton
          label="View sample"
          variant="ghost"
          onPress={() => router.push(`/public/${GUEST_SAMPLE_PROFILE_SLUG}`)}
        />
      </AppCard>

      <View style={styles.row}>
        <AppButton
          label="Themes"
          fullWidth={false}
          style={styles.halfButton}
          variant="outline"
          onPress={() => router.push('/theme-picker')}
        />
        <AppButton
          label="Analytics"
          fullWidth={false}
          style={styles.halfButton}
          variant="outline"
          onPress={() => router.push('/guest-analytics')}
        />
      </View>

      <AppButton
        label="Create my NFC identity"
        onPress={() =>
          requireAccount(undefined, {
            message: 'Create your account to unlock your own NFC identity.',
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xxs,
    marginBottom: theme.spacing.sm,
  },
  greeting: {
    textTransform: 'uppercase',
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  actionCard: {
    gap: theme.spacing.md,
  },
  actionCardInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionIconNfc: {
    backgroundColor: '#F3E8FF',
  },
  actionText: {
    flex: 1,
    gap: 2,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});
