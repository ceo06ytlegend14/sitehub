import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { usePayouts } from '@/src/hooks/usePayouts';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { useRoleFlags } from '@/src/hooks/useRoleFlags';

export function PayoutsProfileScreen() {
  const { user } = useAuth();
  const { isSales, isPrinter, isCustomer } = useRoleFlags();
  const { payouts } = usePayouts(user?.id ?? '');
  const jobs = usePrinterJobs();
  const { bioPage } = useBioPage(user?.id ?? '');

  const totalPayouts = payouts.reduce((acc, payout) => acc + payout.amount, 0);
  const qaDone = jobs.filter((job) => job.stage === 'done').length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h1">{isSales ? 'My Payouts' : 'Profile'}</AppText>
        <AppText variant="body" tone="muted">
          {isSales ? 'Commission summary and payout history.' : 'Personal account and role details.'}
        </AppText>
      </View>

      <AppCard>
        <AppText variant="h2">{user?.displayName ?? 'User'}</AppText>
        <AppText variant="body" tone="muted">
          {user?.email}
        </AppText>
        <AppText variant="caption" tone="muted" style={styles.meta}>
          Role: {user?.role ?? 'customer'}
        </AppText>
      </AppCard>

      {isSales ? (
        <>
          <AppCard>
            <AppText variant="h2">Total Paid + Pending</AppText>
            <AppText variant="h1" style={styles.total}>
              RM {totalPayouts.toFixed(2)}
            </AppText>
          </AppCard>
          {payouts.map((payout) => (
            <AppCard key={payout.id}>
              <View style={styles.row}>
                <AppText variant="h2">{payout.periodLabel}</AppText>
                <AppText variant="caption" tone="muted">
                  {payout.status}
                </AppText>
              </View>
              <AppText variant="body">RM {payout.amount.toFixed(2)}</AppText>
            </AppCard>
          ))}
        </>
      ) : null}

      {isPrinter ? (
        <AppCard>
          <AppText variant="h2">QA Throughput</AppText>
          <AppText variant="body" tone="muted">
            Completed QA videos: {qaDone}
          </AppText>
          <AppButton label="Capture New QA Video" onPress={() => router.push('/qa-video')} />
        </AppCard>
      ) : null}

      {isCustomer ? (
        <AppCard>
          <AppText variant="h2">Public Bio Page</AppText>
          <AppText variant="body" tone="muted">
            {bioPage ? `https://bio-cloud.app/${bioPage.slug}` : 'Not published yet.'}
          </AppText>
          <View style={styles.actions}>
            <AppButton label="Edit Bio" fullWidth={false} style={styles.actionButton} onPress={() => router.push('/edit-bio')} />
            {bioPage ? (
              <AppButton
                label="Open Public"
                fullWidth={false}
                variant="secondary"
                style={styles.actionButton}
                onPress={() => router.push(`/public/${bioPage.slug}`)}
              />
            ) : null}
          </View>
        </AppCard>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs,
  },
  meta: {
    marginTop: theme.spacing.xs,
  },
  total: {
    marginTop: theme.spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.xs,
  },
  actions: {
    marginTop: theme.spacing.md,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  actionButton: {
    flex: 1,
  },
});

