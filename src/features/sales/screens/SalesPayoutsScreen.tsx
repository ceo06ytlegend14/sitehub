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
import { usePreferences } from '@/src/hooks/usePreferences';
import { Payout } from '@/src/types/models';

const salesTheme = theme.roles.sales;

export default function MyPayoutsScreen() {
  const { user } = useAuth();
  const { payouts } = usePayouts(user?.id ?? '');
  const { orders, refresh } = useOrders('sales', user?.id ?? '');
  const { colors } = usePreferences();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const totalCommission = payouts.reduce((sum, payout) => sum + payout.amount, 0);
  const pendingApproval = payouts.filter((payout) => payout.status === 'pending').reduce((sum, payout) => sum + payout.amount, 0);
  const paidOut = payouts.filter((payout) => payout.status === 'paid').reduce((sum, payout) => sum + payout.amount, 0);
  const recentDelivered = orders.filter((order) => order.status === 'delivered').slice(0, 8);
  const pendingCount = payouts.filter((payout) => payout.status === 'pending').length;
  const paidCount = payouts.filter((payout) => payout.status === 'paid').length;

  function payoutStatusStyle(status: Payout['status']) {
    if (status === 'paid') {
      return {
        container: { backgroundColor: 'rgba(52,199,89,0.14)', borderColor: 'rgba(52,199,89,0.35)' },
        text: { color: '#1F7A3A' },
      };
    }
    if (status === 'pending') {
      return {
        container: { backgroundColor: 'rgba(255,159,10,0.14)', borderColor: 'rgba(255,159,10,0.35)' },
        text: { color: '#9A5D00' },
      };
    }
    return {
      container: { backgroundColor: colors.surfaceSoft, borderColor: colors.border },
      text: { color: colors.textMuted },
    };
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <AppText variant="caption" tone="muted" weight="bold">
          Sales
        </AppText>
        <AppText variant="h1" weight="bold" style={{ color: colors.typographyColor }}>
          My Payouts
        </AppText>
        <AppBadge label="Commission workflow" tone="role" role="sales" />

        <View style={[styles.totalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <AppText variant="caption" tone="muted" weight="medium">
            Total commission
          </AppText>
          <AppText style={[styles.totalAmount, { color: colors.typographyColor }]}>${totalCommission.toFixed(2)}</AppText>
          <AppText variant="caption" tone="muted">
            {orders.length} orders - {pendingCount} pending
          </AppText>

          <View style={styles.walletStrip}>
            <View style={[styles.walletPill, { backgroundColor: colors.surfaceSoft }]}>
              <AppText variant="caption" tone="muted" weight="medium">
                Awaiting
              </AppText>
              <AppText variant="body" weight="bold" style={{ color: colors.typographyColor }}>
                ${pendingApproval.toFixed(2)}
              </AppText>
            </View>
            <View style={[styles.walletPill, { backgroundColor: colors.surfaceSoft }]}>
              <AppText variant="caption" tone="muted" weight="medium">
                Paid
              </AppText>
              <AppText variant="body" weight="bold" style={{ color: salesTheme.primary }}>
                ${paidOut.toFixed(2)}
              </AppText>
            </View>
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
              <AppIcon name="ClipboardList" size={20} color={salesTheme.primary} />
            </View>
            <AppText variant="h2" weight="bold">
              Queue
            </AppText>
          </View>
          <AppText variant="caption" tone="muted">
            Pending manager approval
          </AppText>
          <AppText variant="h1" weight="bold" style={{ color: colors.typographyColor }}>
            ${pendingApproval.toFixed(2)}
          </AppText>
          <AppText variant="caption" tone="muted">
            {pendingCount} submitted - waiting approval
          </AppText>
        </View>

        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
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
            {paidCount} payouts - this month
          </AppText>
        </View>

        {payouts.length > 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
                <AppIcon name="History" size={19} color={salesTheme.primary} />
              </View>
              <AppText variant="h2" weight="bold">
                Recent payouts
              </AppText>
            </View>
            {payouts.slice(0, 6).map((payout, index) => {
              const tone = payoutStatusStyle(payout.status);
              return (
                <View
                  key={payout.id}
                  style={[
                    styles.payoutRow,
                    index > 0 && {
                      borderTopWidth: StyleSheet.hairlineWidth,
                      borderTopColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.payoutLeft}>
                    <AppText variant="body" weight="semibold" numberOfLines={1}>
                      {payout.periodLabel || `Payout ${payout.id.slice(0, 6).toUpperCase()}`}
                    </AppText>
                    <AppText variant="caption" tone="muted" numberOfLines={1}>
                      {new Date(payout.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </AppText>
                  </View>
                  <View style={styles.payoutRight}>
                    <AppText variant="body" weight="bold" style={{ color: colors.typographyColor }}>
                      ${payout.amount.toFixed(2)}
                    </AppText>
                    <View style={[styles.statusPill, tone.container]}>
                      <AppText variant="caption" weight="bold" style={tone.text}>
                        {payout.status.toUpperCase()}
                      </AppText>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>
        ) : null}

        {recentDelivered.length > 0 ? (
          <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <View style={styles.cardHeader}>
              <View style={[styles.iconWrap, { backgroundColor: colors.primarySoft }]}>
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
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
    gap: theme.spacing.xs,
  },
  totalCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.sm,
    gap: 6,
  },
  totalAmount: {
    fontSize: 26,
    lineHeight: 32,
    letterSpacing: -0.3,
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: theme.spacing.sm,
    paddingBottom: 120,
    gap: theme.spacing.xs,
  },
  card: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.sm,
    gap: 6,
    ...theme.shadows.control,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walletStrip: {
    marginTop: 6,
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  walletPill: {
    flex: 1,
    borderRadius: theme.radius.md,
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 2,
  },
  roleText: {
    color: salesTheme.primary,
  },
  unlockedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
    paddingTop: 10,
  },
  unlockedLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  payoutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.sm,
    paddingVertical: 10,
  },
  payoutLeft: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  payoutRight: {
    alignItems: 'flex-end',
    gap: 4,
    flexShrink: 0,
  },
  statusPill: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
});
