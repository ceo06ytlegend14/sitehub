import { Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppButton } from '@/src/components/AppButton';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';

const printerTheme = theme.roles.printer;

export default function ScanEntryScreen() {
  const { jobs } = usePrinterJobs();
  const nextJob = jobs.find((job) => job.stage === 'queued' || job.stage === 'printing');

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText variant="caption" weight="bold" style={styles.headerSub}>NFC station</AppText>
        <AppText variant="h1" weight="bold" style={styles.headerTitle}>Quick Scan</AppText>
      </View>

      <View style={styles.body}>
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
          <AppText variant="h2" weight="bold" style={styles.tapTitle}>Ready to Write</AppText>
          <AppText variant="body" tone="muted" style={styles.tapSub}>
            {nextJob ? `Next job #${String(nextJob.queueNumber).slice(-4)}` : 'No jobs in queue'}
          </AppText>
        </Pressable>

        <View style={styles.stepsCard}>
          {['Tap blank NFC card to phone', 'Write profile URL', 'Read back to verify', 'Lock the chip'].map((item, index) => (
            <View key={item} style={styles.stepRow}>
              <View style={styles.stepNum}>
                <AppText style={styles.stepNumText}>{index + 1}</AppText>
              </View>
              <AppText variant="body" style={styles.stepText}>{item}</AppText>
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
      </View>
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
    paddingVertical: theme.spacing.lg,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
    gap: 2,
  },
  headerTitle: {
    color: theme.colors.textInverse,
  },
  headerSub: {
    color: theme.colors.textInverse,
    opacity: 0.82,
  },
  body: {
    flex: 1,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  tapZone: {
    flex: 1,
    minHeight: 260,
    borderRadius: theme.radius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
    borderWidth: 2,
    borderColor: printerTheme.soft,
    borderStyle: 'dashed',
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
  stepsCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
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
    flex: 1,
    color: printerTheme.text,
  },
});
