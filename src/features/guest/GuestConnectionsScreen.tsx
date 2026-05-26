import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_DEMO_CONNECTIONS } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';

export function GuestConnectionsScreen() {
  const { requireAccount } = useRequireAccount();

  return (
    <ScreenContainer>
      <AppHeader title="Connections" subtitle="Sample recent taps & scans" />

      <View style={styles.banner}>
        <AppIcon name="Info" size={16} color={theme.colors.primary} />
        <AppText variant="caption" tone="muted" style={styles.bannerText}>
          Demo connections only — sign in to save your real scan history and contacts.
        </AppText>
      </View>

      {GUEST_DEMO_CONNECTIONS.map((item) => (
        <Pressable key={item.id} onPress={() => router.push(`/public/${item.slug}`)}>
          <AppCard style={styles.row}>
            <View style={styles.avatar}>
              <AppText style={styles.avatarText}>{item.name[0]}</AppText>
            </View>
            <View style={styles.copy}>
              <AppText variant="body" weight="semibold">
                {item.name}
              </AppText>
              <AppText variant="caption" tone="muted">
                {item.subtitle}
              </AppText>
            </View>
            <AppText variant="caption" tone="muted">
              {item.when}
            </AppText>
          </AppCard>
        </Pressable>
      ))}

      <Pressable
        onPress={() =>
          requireAccount(undefined, {
            message: 'Create an account to save contacts and sync your connection history.',
          })
        }
      >
        <AppCard style={styles.saveRow}>
          <AppIcon name="User" size={20} color={theme.colors.primary} />
          <AppText variant="body" weight="semibold">
            Save connection
          </AppText>
        </AppCard>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.xs,
    padding: theme.spacing.sm,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surfaceSoft,
  },
  bannerText: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 18,
  },
  copy: {
    flex: 1,
    gap: 2,
  },
  saveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
});
