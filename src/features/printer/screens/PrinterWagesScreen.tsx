import { useMemo } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '@/src/components/AppBadge';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { AppEmptyState } from '@/src/components/AppState';
import { theme } from '@/src/constants/theme';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';

const printerTheme = theme.roles.printer;

export default function WagesScreen() {
  const { jobs } = usePrinterJobs();
  const completed = useMemo(() => jobs.filter((job) => job.stage === 'done'), [jobs]);
  const totalCards = useMemo(() => completed.reduce((sum, job) => sum + job.cardsPrinted, 0), [completed]);
  const totalWage = useMemo(
    () => completed.reduce((sum, job) => sum + job.cardsPrinted * job.perCardBonus + job.perOrderBonus, 0),
    [completed]
  );
  const failedCards = useMemo(() => completed.reduce((sum, job) => sum + job.failedCards, 0), [completed]);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" style={styles.headerSub}>This period</AppText>
        <AppText variant="h1" weight="bold" style={styles.headerTitle}>My Wages</AppText>
        <View style={styles.totalCard}>
          <View style={styles.totalIcon}>
            <AppIcon name="BadgeDollarSign" size={24} color={theme.colors.textInverse} />
          </View>
          <View style={styles.totalCopy}>
            <AppText style={styles.totalLabel}>Total Earned</AppText>
            <AppText style={styles.totalAmount}>${totalWage.toFixed(2)}</AppText>
            <AppText style={styles.totalSub}>{totalCards} cards, {completed.length} jobs done</AppText>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <AppIcon name="Printer" size={22} color={printerTheme.primary} />
            </View>
            <AppText style={styles.statNum}>{totalCards}</AppText>
            <AppText style={styles.statLabel}>Cards Printed</AppText>
          </View>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, failedCards > 0 && styles.statIconError]}>
              <AppIcon name="ShieldCheck" size={22} color={failedCards > 0 ? theme.status.error : theme.status.success} />
            </View>
            <AppText style={[styles.statNum, failedCards > 0 && styles.statError]}>{failedCards}</AppText>
            <AppText style={styles.statLabel}>Failed Cards</AppText>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <AppText variant="h2" weight="bold" style={styles.sectionTitle}>Job Breakdown</AppText>
          <AppBadge label={`${completed.length} complete`} tone="success" />
        </View>

        {completed.length === 0 ? (
          <AppEmptyState
            role="printer"
            iconName="BadgeDollarSign"
            title="No completed jobs yet"
            description="Finished jobs will show wage totals here."
          />
        ) : (
          completed.map((job) => {
            const earned = job.cardsPrinted * job.perCardBonus + job.perOrderBonus;
            return (
              <View key={job.id} style={styles.jobRow}>
                <View style={styles.jobLeft}>
                  <View style={styles.jobIcon}>
                    <AppIcon name="ClipboardList" size={20} color={printerTheme.primary} />
                  </View>
                  <View style={styles.jobCopy}>
                    <AppText variant="body" weight="bold" style={styles.jobNum}>Job #{String(job.queueNumber).slice(-4)}</AppText>
                    <AppText variant="caption" tone="muted">{job.cardsPrinted} cards, {job.failedCards} failed</AppText>
                  </View>
                </View>
                <View style={styles.jobRight}>
                  <AppText variant="body" weight="bold" style={styles.jobEarned}>+${earned.toFixed(2)}</AppText>
                  <AppBadge label={job.salaryStatus ?? 'pending'} tone={job.salaryStatus === 'paid' ? 'success' : 'warning'} />
                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: printerTheme.background,
  },
  header: {
    backgroundColor: printerTheme.primary,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.xl,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  headerSub: {
    color: theme.colors.textInverse,
    opacity: 0.82,
  },
  headerTitle: {
    color: theme.colors.textInverse,
    marginBottom: theme.spacing.md,
  },
  totalCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  totalIcon: {
    width: 52,
    height: 52,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: printerTheme.primaryDark,
  },
  totalCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  totalLabel: {
    color: theme.colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    opacity: 0.8,
  },
  totalAmount: {
    color: theme.colors.textInverse,
    fontSize: 36,
    lineHeight: 42,
    fontWeight: '700',
  },
  totalSub: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.78,
  },
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    alignItems: 'center',
    gap: 5,
    ...theme.shadows.card,
  },
  statIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    backgroundColor: printerTheme.soft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statIconError: {
    backgroundColor: `${theme.status.error}14`,
  },
  statNum: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
    color: printerTheme.text,
  },
  statError: {
    color: theme.status.error,
  },
  statLabel: {
    color: theme.colors.textMuted,
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    marginTop: theme.spacing.sm,
  },
  sectionTitle: {
    color: printerTheme.text,
  },
  jobRow: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  jobLeft: {
    flex: 1,
    minWidth: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  jobIcon: {
    width: 42,
    height: 42,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: printerTheme.soft,
  },
  jobCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  jobNum: {
    color: printerTheme.text,
  },
  jobRight: {
    alignItems: 'flex-end',
    gap: 5,
  },
  jobEarned: {
    color: theme.status.success,
  },
});
