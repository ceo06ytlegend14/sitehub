import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/src/components/AppButton';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';

const printerTheme = theme.roles.printer;

const SCAN_STEPS = [
  {
    title: 'Open this Scan screen',
    detail: 'Tap Scan in the bottom tab bar (between Queue and the + button).',
  },
  {
    title: 'Pick a job',
    detail: 'Tap the NFC zone below or Start NFC Write for the next queued job. You can also open a job from Queue first.',
  },
  {
    title: 'Write the chip',
    detail: 'Review the profile URL, tap Write & Lock Chip, and hold a blank NFC card to your phone.',
  },
  {
    title: 'Verify and finish QA',
    detail: 'Wait for verification, then continue to the QA video step to complete the job.',
  },
] as const;

export default function ScanEntryScreen() {
  const { jobs } = usePrinterJobs();
  const nextJob = jobs.find((job) => job.stage === 'queued' || job.stage === 'printing');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" style={styles.headerSub}>
          NFC station
        </AppText>
        <AppText variant="h1" weight="bold" style={styles.headerTitle}>
          Quick Scan
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <View style={styles.callout}>
          <View style={styles.calloutIcon}>
            <AppIcon name="ScanLine" size={20} color={printerTheme.primary} />
          </View>
          <View style={styles.calloutCopy}>
            <AppText variant="body" weight="bold" style={styles.calloutTitle}>
              Use the Scan tab to start
            </AppText>
            <AppText variant="caption" tone="muted" style={styles.calloutText}>
              You are on the right screen. Tap the large NFC area below or the primary action to open encoding for the
              next job in your queue.
            </AppText>
          </View>
        </View>

        <Pressable
          style={({ pressed }) => [styles.tapZone, pressed && styles.tapZonePressed]}
          onPress={() => {
            if (nextJob) {
              router.push({ pathname: '/printer/nfc/[jobId]', params: { jobId: nextJob.id } });
            }
          }}
        >
          <View style={styles.tapIcon}>
            <AppIcon name="Nfc" size={24} color={printerTheme.primary} />
          </View>
          <AppText variant="h2" weight="bold" style={styles.tapTitle}>
            Ready to Write
          </AppText>
          <AppText variant="body" tone="muted" style={styles.tapSub}>
            {nextJob ? `Next job #${String(nextJob.queueNumber).slice(-4)}` : 'No jobs in queue'}
          </AppText>
          <AppText variant="caption" style={styles.tapHint}>
            Tap here to open the NFC writer
          </AppText>
        </Pressable>

        <View style={styles.stepsCard}>
          <AppText variant="caption" weight="bold" style={styles.stepsHeading}>
            HOW IT WORKS
          </AppText>
          {SCAN_STEPS.map((item, index) => (
            <View key={item.title} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <AppText style={styles.stepNumText}>{index + 1}</AppText>
              </View>
              <View style={styles.stepCopy}>
                <AppText variant="body" weight="semibold" style={styles.stepTitle}>
                  {item.title}
                </AppText>
                <AppText variant="caption" tone="muted" style={styles.stepText}>
                  {item.detail}
                </AppText>
              </View>
            </View>
          ))}
        </View>

        {nextJob ? (
          <AppButton
            label="Start NFC Write"
            iconName="Nfc"
            role="printer"
            onPress={() => router.push({ pathname: '/printer/nfc/[jobId]', params: { jobId: nextJob.id } })}
          />
        ) : (
          <AppButton
            label="View Queue"
            iconName="ClipboardList"
            variant="outline"
            role="printer"
            onPress={() => router.push('/printer/queue')}
          />
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
    paddingBottom: theme.spacing.md,
    gap: 2,
  },
  headerTitle: {
    color: printerTheme.text,
  },
  headerSub: {
    color: theme.colors.textMuted,
  },
  body: {
    padding: theme.spacing.lg,
    paddingBottom: 120,
    gap: theme.spacing.md,
  },
  callout: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: printerTheme.soft,
    padding: theme.spacing.md,
    ...theme.shadows.control,
  },
  calloutIcon: {
    width: 40,
    height: 40,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: printerTheme.soft,
  },
  calloutCopy: {
    flex: 1,
    gap: 4,
  },
  calloutTitle: {
    color: printerTheme.text,
  },
  calloutText: {
    lineHeight: 18,
  },
  tapZone: {
    minHeight: 220,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: printerTheme.soft,
    borderStyle: 'dashed',
    padding: theme.spacing.lg,
    ...theme.shadows.card,
  },
  tapZonePressed: {
    opacity: 0.82,
  },
  tapIcon: {
    width: 72,
    height: 72,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: printerTheme.soft,
  },
  tapTitle: {
    color: printerTheme.primaryDark,
    textAlign: 'center',
  },
  tapSub: {
    textAlign: 'center',
  },
  tapHint: {
    color: printerTheme.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  stepsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  stepsHeading: {
    color: theme.colors.textMuted,
    letterSpacing: 0.4,
    marginBottom: 2,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.sm,
  },
  stepCopy: {
    flex: 1,
    gap: 2,
  },
  stepTitle: {
    color: printerTheme.text,
  },
  stepNum: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    backgroundColor: printerTheme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumText: {
    color: theme.colors.textInverse,
    fontSize: 12,
    fontWeight: '700',
  },
  stepText: {
    lineHeight: 17,
  },
});
