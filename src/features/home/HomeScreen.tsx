import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { MetricCard } from '@/src/components/MetricCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { useOrders } from '@/src/hooks/useOrders';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { useRoleFlags } from '@/src/hooks/useRoleFlags';

export function HomeScreen() {
  const { user } = useAuth();
  const { role, isSales, isPrinter, isCustomer } = useRoleFlags();
  const jobs = usePrinterJobs();
  const { orders } = useOrders(role, user?.id ?? '');
  const { bioPage } = useBioPage(user?.id ?? '');

  const queueCount = jobs.filter((job) => job.stage !== 'done').length;
  const completedToday = jobs.filter((job) => job.stage === 'done').length;
  const pendingOrders = orders.filter((order) => order.status !== 'completed').length;

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <AppText variant="h1">Hello, {user?.displayName ?? 'there'}</AppText>
        <AppText variant="body" tone="muted">
          {isCustomer ? 'Customer Bio Cloud' : 'Internal App'} dashboard
        </AppText>
      </View>

      {isSales ? (
        <>
          <MetricCard label="Open Orders" value={`${pendingOrders}`} highlight="Sales" />
          <MetricCard label="Ready For Print" value={`${queueCount}`} />
          <AppCard>
            <AppText variant="h2">New Order Intake</AppText>
            <AppText variant="body" tone="muted" style={styles.blockText}>
              Capture customer request and push it to printer queue instantly.
            </AppText>
            <AppButton label="Create New Order" onPress={() => router.push('/new-order')} />
          </AppCard>
          <AppCard>
            <AppText variant="h2">My Payouts</AppText>
            <AppText variant="body" tone="muted" style={styles.blockText}>
              Track commissions and payout status by period.
            </AppText>
            <AppButton label="Open Payouts" variant="secondary" onPress={() => router.push('/(tabs)/profile')} />
          </AppCard>
        </>
      ) : null}

      {isPrinter ? (
        <>
          <MetricCard label="Printer Queue" value={`${queueCount}`} highlight="Live" />
          <MetricCard label="QA Captured" value={`${completedToday}`} />
          <AppCard>
            <AppText variant="h2">Printer Job Queue</AppText>
            <AppText variant="body" tone="muted" style={styles.blockText}>
              Move jobs from queue to NFC programming and QA capture.
            </AppText>
            <AppButton label="Open Queue" onPress={() => router.push('/(tabs)/attendance')} />
          </AppCard>
          <View style={styles.row}>
            <AppButton label="NFC Programming" fullWidth={false} style={styles.halfButton} onPress={() => router.push('/nfc-programming')} />
            <AppButton label="QA Video" fullWidth={false} variant="secondary" style={styles.halfButton} onPress={() => router.push('/qa-video')} />
          </View>
        </>
      ) : null}

      {isCustomer ? (
        <>
          <MetricCard label="Card Status" value={bioPage ? 'Active' : 'Not Linked'} highlight="Customer" />
          <MetricCard label="Public URL" value={bioPage ? `/${bioPage.slug}` : 'Not set'} />
          <AppCard>
            <AppText variant="h2">Activate Card</AppText>
            <AppText variant="body" tone="muted" style={styles.blockText}>
              Link your physical NFC card to your public bio profile.
            </AppText>
            <AppButton label="Activate Card" onPress={() => router.push('/activate-card')} />
          </AppCard>
          <View style={styles.row}>
            <AppButton label="Pick Theme" fullWidth={false} style={styles.halfButton} onPress={() => router.push('/theme-picker')} />
            <AppButton label="Edit Bio Page" fullWidth={false} variant="secondary" style={styles.halfButton} onPress={() => router.push('/edit-bio')} />
          </View>
        </>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: theme.spacing.xs,
  },
  blockText: {
    marginTop: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  halfButton: {
    flex: 1,
  },
});
