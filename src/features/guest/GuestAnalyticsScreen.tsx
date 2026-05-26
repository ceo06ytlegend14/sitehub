import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { MetricCard } from '@/src/components/MetricCard';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_DEMO_ANALYTICS } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';

export function GuestAnalyticsScreen() {
  const maxWeekly = Math.max(...GUEST_DEMO_ANALYTICS.weeklyViews);

  return (
    <ScreenContainer>
      <AppHeader title="Analytics" subtitle="Read-only demo data" showBack />

      <View style={styles.demoPill}>
        <AppText variant="caption" weight="bold" style={styles.demoPillText}>
          DEMO PREVIEW
        </AppText>
      </View>

      <View style={styles.metricsRow}>
        <MetricCard label="Profile views" value={String(GUEST_DEMO_ANALYTICS.profileViews)} highlight="Preview" />
        <MetricCard label="NFC taps" value={String(GUEST_DEMO_ANALYTICS.nfcTaps)} />
      </View>
      <View style={styles.metricsRow}>
        <MetricCard label="QR scans" value={String(GUEST_DEMO_ANALYTICS.qrScans)} />
        <MetricCard label="Contact saves" value={String(GUEST_DEMO_ANALYTICS.contactSaves)} />
      </View>

      <AppCard>
        <AppText variant="h2">Traffic sources</AppText>
        {GUEST_DEMO_ANALYTICS.topSources.map((source) => (
          <View key={source.label} style={styles.sourceRow}>
            <AppText variant="body">{source.label}</AppText>
            <AppText variant="body" weight="bold">
              {source.value}%
            </AppText>
          </View>
        ))}
      </AppCard>

      <AppCard>
        <AppText variant="h2">Views this week</AppText>
        <View style={styles.chart}>
          {GUEST_DEMO_ANALYTICS.weeklyViews.map((value, index) => (
            <View key={index} style={styles.barCol}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max(12, (value / maxWeekly) * 96),
                    backgroundColor: theme.colors.primary,
                  },
                ]}
              />
              <AppText variant="caption" tone="muted" style={styles.barLabel}>
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}
              </AppText>
            </View>
          ))}
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  demoPill: {
    alignSelf: 'flex-start',
    backgroundColor: theme.colors.surfaceSoft,
    borderRadius: theme.radius.pill,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 4,
  },
  demoPillText: {
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  sourceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.xs,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: theme.spacing.md,
    height: 120,
  },
  barCol: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 4,
  },
  bar: {
    width: '100%',
    maxWidth: 28,
    borderRadius: theme.radius.sm,
  },
  barLabel: {
    fontSize: 10,
  },
});
