import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppAvatar } from '@/src/components/AppAvatar';
import { AppBadge } from '@/src/components/AppBadge';
import { AppIcon, type AppIconName } from '@/src/components/AppIcon';
import { AppEmptyState, AppLoadingState } from '@/src/components/AppState';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { orderCardStatusOptions, orderStatusOptions, productTypeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePreferences } from '@/src/hooks/usePreferences';
import { Order } from '@/src/types/models';

function orderAmount(order: Order) {
  const product = productTypeOptions.find((item) => item.value === order.productType);
  return order.quantity * (product?.price ?? 49);
}

function formatMoney(value: number) {
  return `$${value.toFixed(2)}`;
}

interface StatChipProps {
  label: string;
  value: string;
  iconName: AppIconName;
}

function StatChip({ label, value, iconName }: StatChipProps) {
  const { colors } = usePreferences();

  return (
    <View style={[styles.statChip, { backgroundColor: colors.surfaceSoft, borderColor: colors.border }]}>
      <View style={[styles.statIcon, { backgroundColor: colors.primarySoft }]}>
        <AppIcon name={iconName} size={17} color={colors.primary} />
      </View>
      <View style={styles.statCopy}>
        <AppText variant="caption" tone="muted" weight="medium" numberOfLines={1}>
          {label}
        </AppText>
        <AppText style={styles.statValue} weight="bold" numberOfLines={1} adjustsFontSizeToFit>
          {value}
        </AppText>
      </View>
    </View>
  );
}

interface QuickActionProps {
  label: string;
  iconName: AppIconName;
  primary?: boolean;
  onPress: () => void;
}

function QuickAction({ label, iconName, primary = false, onPress }: QuickActionProps) {
  const { colors } = usePreferences();

  return (
    <Pressable
      accessibilityRole="button"
      style={({ pressed }) => [
        styles.quickAction,
        {
          backgroundColor: primary ? colors.primary : colors.surface,
          borderColor: primary ? colors.primary : colors.border,
        },
        pressed && styles.pressed,
      ]}
      onPress={onPress}
    >
      <AppIcon name={iconName} size={18} color={primary ? colors.textInverse : colors.primary} />
      <AppText
        variant="caption"
        weight="bold"
        tone={primary ? 'inverse' : 'primary'}
        numberOfLines={1}
        style={styles.quickActionLabel}
      >
        {label}
      </AppText>
    </Pressable>
  );
}

function OrderRow({ order }: { order: Order }) {
  const { colors } = usePreferences();
  const statusOpt = orderStatusOptions.find((option) => option.value === order.status);
  const cardStatus = order.cardStatus ?? 'active';
  const cardStatusOpt = orderCardStatusOptions.find((item) => item.value === cardStatus);

  return (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && styles.orderCardPressed,
      ]}
      onPress={() => router.push({ pathname: appRoutes.orderDetail, params: { orderId: order.id } })}
    >
      <View style={styles.orderLeft}>
        <AppText variant="caption" tone="muted" weight="bold">
          #{order.id.slice(0, 6).toUpperCase()}
        </AppText>
        <AppText variant="body" weight="bold" numberOfLines={1}>
          {order.customerName}
        </AppText>
        <AppText variant="caption" tone="muted" numberOfLines={1}>
          {order.productType?.replace('_', ' ')} - {order.cardCode}
        </AppText>
        {cardStatus !== 'active' && cardStatusOpt ? (
          <AppText variant="caption" tone="muted">
            {cardStatusOpt.label}
          </AppText>
        ) : null}
      </View>
      <View style={styles.orderRight}>
        <AppText variant="h2" weight="bold">
          ${orderAmount(order).toFixed(2)}
        </AppText>
        <AppBadge label={statusOpt?.label ?? order.status} tone="role" role="sales" />
      </View>
    </Pressable>
  );
}

export default function SalesDashboardScreen() {
  const { user } = useAuth();
  const { orders, isLoading, refresh } = useOrders('sales', user?.id ?? '');
  const { colors } = usePreferences();

  useEffect(() => {
    refresh();
  }, [refresh]);

  const unrealized = useMemo(
    () => orders.filter((order) => order.paymentStatus !== 'paid').reduce((sum, order) => sum + orderAmount(order), 0),
    [orders]
  );
  const realized = useMemo(
    () => orders.filter((order) => order.paymentStatus === 'paid').reduce((sum, order) => sum + orderAmount(order), 0),
    [orders]
  );
  const activeOrders = orders.filter(
    (order) => order.status !== 'delivered' && (order.cardStatus ?? 'active') !== 'closed'
  );
  const pipeline = activeOrders
    .filter((order) => order.status !== 'delivered' && (order.cardStatus ?? 'active') !== 'closed')
    .slice(0, 15);
  const recommendation = activeOrders.length > 0
    ? {
        title: `${activeOrders.length} active order${activeOrders.length === 1 ? '' : 's'}`,
        subtitle: unrealized > 0 ? 'Review unpaid work and follow up cleanly.' : 'Keep the pipeline moving to delivery.',
        route: appRoutes.sales.orders,
      }
    : {
        title: 'Ready for the next customer',
        subtitle: 'Create an order with fulfilment details in one flow.',
        route: appRoutes.sales.newOrder,
      };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.headerShell}>
        <View style={[styles.header, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <View style={styles.headerTop}>
            <View style={styles.headerCopy}>
              <View style={[styles.rolePill, { backgroundColor: colors.primarySoft }]}>
                <AppIcon name="BadgeCheck" size={14} color={colors.primary} />
                <AppText variant="caption" weight="bold" style={{ color: colors.primary }}>
                  Sales Rep
                </AppText>
              </View>
              <AppText style={styles.headerTitle} weight="bold" numberOfLines={1}>
                {user?.displayName ?? 'Orders'}
              </AppText>
            </View>
            <AppAvatar name={user?.displayName ?? 'Sales'} role="sales" size={42} style={styles.avatar} />
          </View>

          <View style={styles.statGrid}>
            <StatChip label="Unrealized" value={formatMoney(unrealized)} iconName="CircleDollarSign" />
            <StatChip label="Commission" value={formatMoney(realized)} iconName="Wallet" />
            <StatChip label="Open" value={`${activeOrders.length}`} iconName="ClipboardList" />
          </View>

          <View style={styles.quickActions}>
            <QuickAction label="Create" iconName="Plus" primary onPress={() => router.push(appRoutes.sales.newOrder)} />
            <QuickAction label="Pipeline" iconName="ClipboardList" onPress={() => router.push(appRoutes.sales.orders)} />
            <QuickAction label="Payouts" iconName="Wallet" onPress={() => router.push(appRoutes.sales.payouts)} />
          </View>
        </View>
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <Pressable
          accessibilityRole="button"
          style={({ pressed }) => [
            styles.recommendation,
            { backgroundColor: colors.surface, borderColor: colors.border },
            pressed && styles.pressed,
          ]}
          onPress={() => router.push(recommendation.route)}
        >
          <View style={[styles.recommendIcon, { backgroundColor: colors.primarySoft }]}>
            <AppIcon name="Sparkles" size={18} color={colors.primary} />
          </View>
          <View style={styles.recommendCopy}>
            <AppText variant="caption" weight="bold" style={{ color: colors.primary }}>
              Recommended
            </AppText>
            <AppText variant="body" weight="bold" numberOfLines={1}>
              {recommendation.title}
            </AppText>
            <AppText variant="caption" tone="muted" numberOfLines={1}>
              {recommendation.subtitle}
            </AppText>
          </View>
          <AppIcon name="ChevronRight" size={18} color={colors.primary} />
        </Pressable>

        <View style={styles.pipelineHeader}>
          <AppText variant="h2" weight="bold">
            Pipeline
          </AppText>
          <Pressable onPress={() => router.push(appRoutes.sales.orders)} hitSlop={10}>
            <AppText variant="caption" weight="bold" style={[styles.linkText, { color: colors.primary }]}>
              See all
            </AppText>
          </Pressable>
        </View>

        {isLoading ? (
          <AppLoadingState title="Loading pipeline..." role="sales" />
        ) : pipeline.length === 0 ? (
          <AppEmptyState
            title="No active orders"
            description="Create a new order to start the sales workflow."
            iconName="ClipboardList"
            role="sales"
          />
        ) : (
          pipeline.map((order) => <OrderRow key={order.id} order={order} />)
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerShell: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.xs,
    paddingBottom: theme.spacing.sm,
  },
  header: {
    borderRadius: theme.radius.xl,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.sm,
    gap: theme.spacing.xs,
    ...theme.shadows.card,
  },
  headerTitle: {
    fontSize: 24,
    lineHeight: 29,
  },
  avatar: {
    backgroundColor: theme.colors.primary,
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
    gap: 5,
  },
  rolePill: {
    alignSelf: 'flex-start',
    minHeight: 26,
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  statGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
  statChip: {
    flex: 1,
    minWidth: 88,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statIcon: {
    width: 28,
    height: 28,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  statValue: {
    fontSize: 16,
    lineHeight: 20,
  },
  recommendation: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    ...theme.shadows.control,
  },
  recommendIcon: {
    width: 38,
    height: 38,
    borderRadius: theme.radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  recommendCopy: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  quickActions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  quickAction: {
    flex: 1,
    minHeight: 42,
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
    paddingHorizontal: theme.spacing.xs,
    ...theme.shadows.control,
  },
  quickActionLabel: {
    fontSize: 12,
  },
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.98 }],
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    padding: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
  },
  pipelineHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  linkText: {
    fontSize: 13,
  },
  orderCard: {
    borderRadius: theme.radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    padding: theme.spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    ...theme.shadows.card,
  },
  orderCardPressed: {
    opacity: 0.84,
  },
  orderLeft: {
    flex: 1,
    minWidth: 0,
    gap: 3,
  },
  orderRight: {
    alignItems: 'flex-end',
    gap: theme.spacing.xs,
    flexShrink: 0,
    maxWidth: '42%',
  },
});
