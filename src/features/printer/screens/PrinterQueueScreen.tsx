import { useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '@/src/components/AppBadge';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { AppEmptyState } from '@/src/components/AppState';
import { appRoutes } from '@/src/constants/navigation';
import { theme } from '@/src/constants/theme';
import { useNotifications } from '@/src/hooks/useNotifications';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { AppSearchBar, type AppSearchBarHandle } from '@/src/components/AppSearchBar';
import { searchEmptyMessage, useSearchQuery } from '@/src/hooks/useSearchQuery';
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
  const { jobs, isLoading, error } = usePrinterJobs();
  const { unreadCount } = useNotifications();
  const [tab, setTab] = useState<TabFilter>('all');
  const searchRef = useRef<AppSearchBarHandle>(null);
  const {
    input: searchInput,
    setInput: setSearchInput,
    query: searchQuery,
    submitSearch,
    clearSearch,
  } = useSearchQuery();

  const filtered = useMemo(() => {
    const base =
      tab === 'all'
        ? jobs.filter((job) => job.stage !== 'failed')
        : tab === 'queued'
          ? jobs.filter((job) => job.stage === 'queued')
          : tab === 'printing'
            ? jobs.filter(
                (job) =>
                  job.stage === 'printing' ||
                  job.stage === 'nfc_writing' ||
                  job.stage === 'nfc_verification'
              )
            : jobs.filter((job) => job.stage === 'done');

    const q = searchQuery.trim().toLowerCase();
    if (!q) return base;

    return base.filter((job) => {
      const queue = String(job.queueNumber);
      const id = job.id.toLowerCase();
      const orderId = job.orderId.toLowerCase();
      return (
        queue.includes(q) ||
        id.includes(q) ||
        orderId.includes(q)
      );
    });
  }, [jobs, tab, searchQuery]);

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
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notifications"
            onPress={() => router.push(appRoutes.printer.notifications)}
            hitSlop={10}
            style={({ pressed }) => [styles.notifButton, pressed && styles.pressed]}
          >
            <View style={styles.notifIconShell}>
              <AppIcon name="Bell" size={20} color={printerTheme.primary} />
              {unreadCount > 0 ? (
                <View style={styles.notifBadge}>
                  <AppText style={styles.notifBadgeText} numberOfLines={1}>
                    {unreadCount > 99 ? '99+' : String(unreadCount)}
                  </AppText>
                </View>
              ) : null}
            </View>
          </Pressable>
        </View>

        <AppSearchBar
          ref={searchRef}
          embedded
          value={searchInput}
          onChangeText={setSearchInput}
          onSearch={submitSearch}
          onClear={clearSearch}
          loading={isLoading}
          role="printer"
          placeholder="Search by job, order, or ID…"
        />

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabs}>
          {tabs.map((item) => {
            const active = tab === item.key;
            return (
              <Pressable
                key={item.key}
                style={[styles.tabPill, active ? styles.tabPillActive : styles.tabPillIdle]}
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
            title="No jobs"
            description={searchEmptyMessage(
              false,
              Boolean(searchQuery),
              searchQuery,
              tab === 'all' ? 'Queue is clear right now.' : 'No jobs in this category right now.'
            )}
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
    backgroundColor: printerTheme.background,
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
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
    color: theme.colors.textMuted,
  },
  headerTitle: {
    color: printerTheme.text,
  },
  notifButton: {
    width: 46,
    height: 46,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    ...theme.shadows.control,
  },
  notifIconShell: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBadge: {
    position: 'absolute',
    top: -7,
    right: -9,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.danger,
    borderWidth: 2,
    borderColor: theme.colors.surface,
  },
  notifBadgeText: {
    color: theme.colors.textInverse,
    fontSize: 9,
    fontWeight: '800',
    includeFontPadding: false,
  },
  tabs: {
    gap: theme.spacing.xs,
    paddingRight: theme.spacing.lg,
  },
  tabPill: {
    height: 34,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: StyleSheet.hairlineWidth,
  },
  tabPillIdle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  tabPillActive: {
    backgroundColor: printerTheme.primary,
    borderColor: printerTheme.primary,
  },
  tabText: {
    color: theme.colors.textMuted,
  },
  tabTextActive: {
    color: theme.colors.textInverse,
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
    borderRadius: 18,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.control,
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
