import { StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

interface MetricCardProps {
  label: string;
  value: string;
  highlight?: string;
}

export function MetricCard({ label, value, highlight }: MetricCardProps) {
  return (
    <AppCard style={styles.card}>
      <AppText variant="caption" tone="muted">
        {label}
      </AppText>
      <View style={styles.row}>
        <AppText variant="h2">{value}</AppText>
        {highlight ? (
          <View style={styles.badge}>
            <AppText variant="caption" tone="inverse">
              {highlight}
            </AppText>
          </View>
        ) : null}
      </View>
    </AppCard>
  );
}

const styles = StyleSheet.create({
  card: {
    paddingVertical: theme.spacing.md,
  },
  row: {
    marginTop: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  badge: {
    borderRadius: theme.radius.pill,
    backgroundColor: theme.colors.accent,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xxs,
  },
});

