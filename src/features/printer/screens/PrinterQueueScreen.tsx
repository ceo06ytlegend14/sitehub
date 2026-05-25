import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppAvatar } from '@/src/components/AppAvatar';
import { AppBadge } from '@/src/components/AppBadge';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { AppEmptyState } from '@/src/components/AppState';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { PrinterJob } from '@/src/types/models';

const printerTheme = theme.roles.printer;

type TabFilter = 'all' | 'queued' | 'printing' | 'done';
type BadgeTone = 'success' | 'warning' | 'error' | 'info' | 'pending';

const stageTone: Record<PrinterJob['stage'], BadgeTone> = {
  queued: 'warning',
  printing: 'info',
  nfc_writing: 'info',
  nfc_verification: 'info',
  done: 'success',
  failed: 'error',
};

const stageLabel: Record<PrinterJob['stage'], string> = {
  queued: 'Pending',
  printing: 'Printing',
  nfc_writing: 'NFC Write',
  nfc_verification: 'Verifying',
  done: 'Done',
  failed: 'Failed',
};

function JobCard({ job }: { job: PrinterJob }) {
  const wage = (job.cardsPrinted * job.perCardBonus + job.perOrderBonus).toFixed(2);
  const stepIndex = job.stage === 'queued' ? 0 : job.stage === 'printing' ? 1 : job.stage === 'done' ? 3 : 2;

  return (
    <Pressable
      style={({ pressed }) => [styles.jobCard, pressed && styles.pressed]}
      onPress={() => router.push({ pathname: '/printer/nfc/[jobId]', params: { jobId: job.id } })}
    >
      <View style={styles.jobTop}>
        <View style={styles.jobTitleWrap}>
          <View style={styles.jobIcon}>
            <AppIcon name="Printer" size={20} color={printerTheme.primary} />
          </View>
          <View style={styles.jobCopy}>
            <AppText variant="h2" style={styles.jobId}>Job #{String(job.queueNumber).slice(-4)}</AppText>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              Order {job.orderId.slice(0, 8)}
            </AppText>
          </View>
        </View>
        <AppBadge label={stageLabel[job.stage]} tone={stageTone[job.stage]} />
      </View>

      <View style={styles.stepRow}>
        {(['Print', 'Encode', 'QA'] as const).map((label, index) => {
          const complete = stepIndex > index;
          return (
            <View key={label} style={styles.stepItem}>
              <View style={[styles.stepDot, complete && styles.stepDotDone]} />
              <AppText style={[styles.stepLabel, complete && styles.stepLabelDone]}>{label}</AppText>
            </View>
          );
        })}
      </View>

      <View style={styles.jobBottom}>
        <View style={styles.jobMetaRow}>
          <AppIcon name="Nfc" size={20} color={printerTheme.accent} />
          <AppText variant="caption" tone="muted">{job.cardsPrinted} cards</AppText>
          {job.failedCards > 0 ? <AppBadge label={`${job.failedCards} failed`} tone="error" /> : null}
        </View>
        <AppText variant="body" weight="bold" style={styles.jobWage}>${wage}</AppText>
      </View>
    </Pressable>
  );
}

export default function PrinterQueueScreen() {
  const { user } = useAuth();
  const { jobs, isLoading, error } = usePrinterJobs();
  const [tab, setTab] = useState<TabFilter>('all');

  const queueCount = jobs.filter((job) => job.stage !== 'done' && job.stage !== 'failed').length;
  const readyCount = jobs.filter((job) => job.stage === 'done').length;

  const filtered = useMemo(() => {
    if (tab === 'all') return jobs.filter((job) => job.stage !== 'failed');
    if (tab === 'queued') return jobs.filter((job) => job.stage === 'queued');
    if (tab === 'printing') {
      return jobs.filter((job) => job.stage === 'printing' || job.stage === 'nfc_writing' || job.stage === 'nfc_verification');
    }
    return jobs.filter((job) => job.stage === 'done');
  }, [jobs, tab]);

  const tabs: { key: TabFilter; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'queued', label: 'Pending' },
    { key: 'printing', label: 'Active' },
    { key: 'done', label: 'Done' },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <AppText variant="caption" weight="bold" style={styles.headerSub}>Workshop</AppText>
            <AppText variant="h1" weight="bold" style={styles.headerTitle}>Job Queue</AppText>
          </View>
          <AppAvatar name={user?.displayName ?? 'Printer'} role="printer" size={46} style={styles.avatar} />
        </View>

        <View style={styles.statsPanel}>
          <View style={styles.statCard}>
            <AppIcon name="ClipboardList" size={22} color={theme.colors.textInverse} />
            <AppText style={styles.statNum}>{queueCount}</AppText>
            <AppText style={styles.statLabel}>In queue</AppText>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCard}>
            <AppIcon name="ShieldCheck" size={22} color={theme.colors.textInverse} />
            <AppText style={styles.statNum}>{readyCount}</AppText>
            <AppText style={styles.statLabel}>Done</AppText>
          </View>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.tabPill, active && styles.tabPillActive]}
                onPress={() => setTab(item.key)}
              >
                <AppText variant="caption" weight="bold" style={active ? styles.tabTextActive : styles.tabText}>
                  {item.label}
                </AppText>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        {error ? (
          <View style={styles.stateCard}>
            <AppText variant="body" style={styles.errorText}>{error}</AppText>
          </View>
        ) : null}
        {isLoading ? (
          <View style={styles.stateCard}>
            <AppText variant="body" tone="muted">Loading queue...</AppText>
          </View>
        ) : filtered.length === 0 ? (
          <AppEmptyState
            role="printer"
            iconName="ClipboardList"
            title="Queue is clear"
            description="No jobs in this category right now."
          />
        ) : (
          filtered.map((job) => <JobCard key={job.id} job={job} />)
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
    paddingBottom: theme.spacing.md,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    gap: theme.spacing.md,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  headerSub: {
    color: theme.colors.textInverse,
    opacity: 0.82,
  },
  headerTitle: {
    color: theme.colors.textInverse,
  },
  avatar: {
    backgroundColor: printerTheme.primaryDark,
  },
  statsPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  statNum: {
    color: theme.colors.textInverse,
    fontSize: 28,
    lineHeight: 34,
    fontWeight: '700',
  },
  statLabel: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '600',
    opacity: 0.82,
  },
  statDivider: {
    width: 1,
    height: 48,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  tabs: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.lg,
  },
  tabPill: {
    height: 36,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  tabPillActive: {
    backgroundColor: theme.colors.surface,
  },
  tabText: {
    color: theme.colors.textInverse,
  },
  tabTextActive: {
    color: printerTheme.primaryDark,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
  },
  jobCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  pressed: {
    opacity: 0.78,
  },
  jobTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  jobTitleWrap: {
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
    gap: 1,
  },
  jobId: {
    color: printerTheme.text,
  },
  stepRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.status.pending,
  },
  stepDotDone: {
    backgroundColor: printerTheme.primary,
  },
  stepLabel: {
    color: theme.colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  stepLabelDone: {
    color: printerTheme.primaryDark,
    fontWeight: '700',
  },
  jobBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
  },
  jobMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
    flexWrap: 'wrap',
    flex: 1,
  },
  jobWage: {
    color: theme.status.success,
  },
  stateCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.lg,
    alignItems: 'center',
    ...theme.shadows.card,
  },
  errorText: {
    color: theme.status.error,
    textAlign: 'center',
  },
});
