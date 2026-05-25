import { useEffect, useMemo } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppAvatar } from '@/src/components/AppAvatar';
import { AppBadge } from '@/src/components/AppBadge';
import { AppButton } from '@/src/components/AppButton';
import { AppEmptyState, AppLoadingState } from '@/src/components/AppState';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { orderCardStatusOptions, orderStatusOptions, productTypeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { Order } from '@/src/types/models';

const salesTheme = theme.roles.sales;

function orderAmount(order: Order) {
  const product = productTypeOptions.find((item) => item.value === order.productType);
  return order.quantity * (product?.price ?? 49);
}

function OrderRow({ order }: { order: Order }) {
  const statusOpt = orderStatusOptions.find((option) => option.value === order.status);
  const cardStatus = order.cardStatus ?? 'active';
  const cardStatusOpt = orderCardStatusOptions.find((item) => item.value === cardStatus);

  return (
    <Pressable
      style={({ pressed }) => [styles.orderCard, pressed && styles.orderCardPressed]}
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
  const pipeline = orders
    .filter((order) => order.status !== 'delivered' && (order.cardStatus ?? 'active') !== 'closed')
    .slice(0, 15);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View style={styles.headerCopy}>
            <AppText variant="caption" tone="muted" weight="bold">
              Sales Rep - {user?.displayName ?? 'Staff'}
            </AppText>
            <AppText variant="h1" weight="bold">
              Orders
            </AppText>
          </View>
          <AppAvatar name={user?.displayName ?? 'Sales'} role="sales" size={44} />
        </View>

        <View style={styles.metricRow}>
          <View style={styles.metricCard}>
            <AppText variant="caption" tone="muted" weight="medium">
              Unrealized revenue
            </AppText>
            <AppText variant="h2" weight="bold">
              ${unrealized.toFixed(2)}
            </AppText>
          </View>
          <View style={styles.metricCard}>
            <AppText variant="caption" tone="muted" weight="medium">
              Realized commission
            </AppText>
            <AppText variant="h2" weight="bold" style={styles.roleText}>
              ${realized.toFixed(2)}
            </AppText>
          </View>
        </View>

        <AppButton
          label="New Order"
          iconName="Plus"
          role="sales"
          onPress={() => router.push(appRoutes.sales.newOrder)}
        />
      </View>

      <ScrollView style={styles.body} contentContainerStyle={styles.bodyContent} showsVerticalScrollIndicator={false}>
        <View style={styles.pipelineHeader}>
          <AppText variant="h2" weight="bold">
            Pipeline
          </AppText>
          <Pressable onPress={() => router.push(appRoutes.sales.orders)} hitSlop={10}>
            <AppText variant="caption" weight="bold" style={styles.linkText}>
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
    backgroundColor: salesTheme.background,
  },
  header: {
    paddingHorizontal: theme.spacing.md,
    paddingTop: theme.spacing.sm,
    paddingBottom: theme.spacing.md,
    gap: theme.spacing.md,
    backgroundColor: salesTheme.background,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  headerCopy: {
    flex: 1,
    gap: 2,
  },
  metricRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  metricCard: {
    flex: 1,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: 4,
    ...theme.shadows.card,
  },
  roleText: {
    color: salesTheme.primary,
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
    color: salesTheme.primary,
  },
  orderCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
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
  },
});
