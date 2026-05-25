import { useEffect } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '@/src/components/AppBadge';
import { AppEmptyState, AppLoadingState } from '@/src/components/AppState';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { orderCardStatusOptions, orderStatusOptions, productTypeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { Order } from '@/src/types/models';

const salesTheme = theme.roles.sales;

function money(order: Order) {
  const product = productTypeOptions.find((item) => item.value === order.productType);
  return (product?.price ?? 49) * order.quantity;
}

function OrderCard({ order }: { order: Order }) {
  const statusOpt = orderStatusOptions.find((option) => option.value === order.status);
  const product = productTypeOptions.find((item) => item.value === order.productType);
  const productName = product?.label ?? order.productType?.replace(/_/g, ' ');
  const contact = order.phone || order.telegram || 'No contact';
  const cardStatus = order.cardStatus ?? 'active';
  const cardStatusOpt = orderCardStatusOptions.find((item) => item.value === cardStatus);
  const isComplete = order.status === 'ready' || order.status === 'delivered';

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
      onPress={() => router.push({ pathname: appRoutes.orderDetail, params: { orderId: order.id } })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleBlock}>
          <AppText variant="caption" tone="muted" weight="bold">
            #{order.id.slice(0, 6).toUpperCase()}
          </AppText>
          <AppText variant="h2" weight="bold" numberOfLines={1}>
            {order.customerName}
          </AppText>
        </View>
        <AppText variant="h2" weight="bold">
          ${money(order).toFixed(2)}
        </AppText>
      </View>

      <View style={styles.metaGrid}>
        <View style={styles.metaRow}>
          <AppIcon name={order.phone ? 'Phone' : 'ClipboardList'} size={20} color={theme.colors.textMuted} />
          <AppText variant="caption" tone="muted" weight="medium" numberOfLines={1} style={styles.metaText}>
            {contact}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <AppIcon name="Package" size={20} color={theme.colors.textMuted} />
          <AppText variant="caption" tone="muted" weight="medium" numberOfLines={1} style={styles.metaText}>
            {productName} x {order.quantity}
          </AppText>
        </View>
        <View style={styles.metaRow}>
          <AppIcon name="CreditCard" size={20} color={theme.colors.textMuted} />
          <AppText variant="caption" tone="muted" weight="medium" numberOfLines={1} style={styles.metaText}>
            {order.cardCode}
          </AppText>
        </View>
      </View>

      <View style={styles.badgeRow}>
        <AppBadge label={statusOpt?.label ?? order.status.replace(/_/g, ' ')} tone={isComplete ? 'success' : 'role'} role="sales" />
        <AppBadge label={order.paymentStatus} tone={order.paymentStatus === 'paid' ? 'success' : 'pending'} />
        {cardStatus !== 'active' && cardStatusOpt ? <AppBadge label={cardStatusOpt.label} tone="warning" /> : null}
        {order.cardDesign === 'custom' || order.designArtworkUrl ? <AppBadge label="Custom artwork" tone="role" role="sales" /> : null}
        {order.nfcEnabled !== false ? (
          <AppBadge label={order.nfcTargetUrl ? 'Custom NFC' : 'NFC profile'} tone="info" />
        ) : null}
      </View>
    </Pressable>
  );
}

export default function SalesOrdersScreen() {
  const { user } = useAuth();
  const { orders, isLoading, refresh } = useOrders('sales', user?.id ?? '');

  useEffect(() => {
    refresh();
  }, [refresh]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Manage Orders"
        subtitle="Sales"
        role="sales"
        actionIcon="Plus"
        onActionPress={() => router.push(appRoutes.sales.newOrder)}
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {isLoading ? (
          <AppLoadingState title="Loading orders..." role="sales" />
        ) : orders.length === 0 ? (
          <AppEmptyState
            title="No orders yet"
            description="Create the first customer order from this sales account."
            iconName="ClipboardList"
            role="sales"
          />
        ) : (
          orders.map((order) => <OrderCard key={order.id} order={order} />)
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
  scroll: {
    paddingHorizontal: theme.spacing.md,
    paddingBottom: 120,
    gap: theme.spacing.sm,
  },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
    ...theme.shadows.card,
  },
  cardPressed: {
    opacity: 0.84,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: theme.spacing.md,
  },
  cardTitleBlock: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  metaGrid: {
    gap: theme.spacing.xs,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  metaText: {
    flex: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
  },
});
