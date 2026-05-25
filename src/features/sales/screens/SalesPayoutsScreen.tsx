import { useEffect } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '@/src/components/AppBadge';
import { AppEmptyState } from '@/src/components/AppState';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePayouts } from '@/src/hooks/usePayouts';

const salesTheme = theme.roles.sales;

export default function MyPayoutsScreen() {
  const { user } = useAuth();
  const { payouts } = usePayouts(user?.id ?? '');
  const { orders, refresh } = useOrders('sales', user?.id ?? '');

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalCommission = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingApproval = payouts.filter((payout) => payout.status === 'pending').reduce((sum, payout) => sum + payout.amount, 0);
  const paidOut = payouts.filter((payout) => payout.status === 'paid').reduce((sum, payout) => sum + payout.amount, 0);
  const recentDelivered = orders.filter((order) => order.status === 'delivered').slice(0, 8);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <AppText variant="caption" tone="muted" weight="bold">
          Sales
        </AppText>
        <AppText variant="h1" weight="bold">
          My Payouts
        </AppText>
        <AppBadge label="Commission workflow" tone="role" role="sales" />
        <View style={styles.totalCard}>
          <AppText variant="caption" tone="inverse" weight="medium">
            Total commission
          </AppText>
          <AppText style={styles.totalAmount}>${totalCommission.toFixed(2)}</AppText>
          <AppText variant="caption" tone="inverse">
            {orders.length} orders - {payouts.filter((payout) => payout.status === 'pending').length} pending
          </AppText>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <AppIcon name="ClipboardList" size={20} color={salesTheme.primary} />
            </View>
            <AppText variant="h2" weight="bold">
              Queue
            </AppText>
          </View>
          <AppText variant="caption" tone="muted">
            Pending manager approval
          </AppText>
          <AppText variant="h1" weight="bold">
            ${pendingApproval.toFixed(2)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {payouts.filter((payout) => payout.status === 'pending').length} submitted - waiting approval
          </AppText>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.iconWrap}>
              <AppIcon name="Wallet" size={20} color={salesTheme.primary} />
            </View>
            <AppText variant="h2" weight="bold">
              Paid out
            </AppText>
          </View>
          <AppText variant="h1" weight="bold" style={styles.roleText}>
            ${paidOut.toFixed(2)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {payouts.filter((payout) => payout.status === 'paid').length} payouts - this month
          </AppText>
        </View>

        {recentDelivered.length > 0 ? (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.iconWrap}>
                <AppIcon name="BadgeDollarSign" size={20} color={salesTheme.primary} />
              </View>
              <AppText variant="h2" weight="bold">
                Recent unlocked
              </AppText>
            </View>
            {recentDelivered.map((order) => (
              <View key={order.id} style={styles.unlockedRow}>
                <View style={styles.unlockedLeft}>
                  <AppText variant="body" weight="semibold" numberOfLines={1}>
                    {order.customerName}
                  </AppText>
                  <AppText variant="caption" tone="muted">
                    {order.productType?.replace('_', ' ')}
                  </AppText>
                </View>
                <AppText variant="body" weight="bold" style={styles.roleText}>
                  +${(order.quantity * 4.9).toFixed(2)}
                </AppText>
              </View>
            ))}
          </View>
        ) : null}

        {payouts.length === 0 && recentDelivered.length === 0 ? (
          <AppEmptyState title="No payout records yet" description="Delivered orders will appear here." iconName="Wallet" role="sales" />
        ) : null}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: salesTheme.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.sm,
    backgroundColor: salesTheme.background,
  },
  totalCard: {
    backgroundColor: salesTheme.primary,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
  },
  totalAmount: {
    color: theme.colors.textInverse,
    fontSize: 32,
    lineHeight: 40,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: salesTheme.soft,
  },
  roleText: {
    color: salesTheme.primary,
  },
  unlockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: theme.spacing.sm,
  },
  unlockedLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
});
