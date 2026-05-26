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
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" style={styles.headerSub}>
          This period
        </AppText>
        <AppText variant="h1" weight="bold" style={styles.headerTitle}>
          My Wages
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryIcon}>
            <AppIcon name="BadgeDollarSign" size={22} color={printerTheme.primary} />
          </View>
          <View style={styles.summaryCopy}>
            <AppText variant="caption" tone="muted" weight="bold" style={styles.summaryLabel}>
              TOTAL EARNED
            </AppText>
            <AppText style={styles.summaryAmount}>${totalWage.toFixed(2)}</AppText>
            <AppText variant="caption" tone="muted" style={styles.summaryMeta}>
              {totalCards} cards · {completed.length} jobs complete
            </AppText>
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
    backgroundColor: printerTheme.background,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
    gap: 2,
  },
  headerSub: {
    color: theme.colors.textMuted,
  },
  headerTitle: {
    color: printerTheme.text,
  },
  summaryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    ...theme.shadows.control,
  },
  summaryIcon: {
    width: 44,
    height: 44,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: printerTheme.soft,
  },
  summaryCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  summaryLabel: {
    letterSpacing: 0.35,
  },
  summaryAmount: {
    color: printerTheme.text,
    fontSize: 30,
    lineHeight: 34,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  summaryMeta: {
    marginTop: 2,
  },
  scroll: {
    padding: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
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
