import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppBadge } from '@/src/components/AppBadge';
import { AppSearchBar } from '@/src/components/AppSearchBar';
import { AppEmptyState, AppLoadingState } from '@/src/components/AppState';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { appRoutes } from '@/src/constants/navigation';
import { orderCardStatusOptions, orderStatusOptions, productTypeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { useSearchQuery } from '@/src/hooks/useSearchQuery';
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

type OrderFilterKey = 'all' | 'pending' | 'active' | 'done';

const ORDER_FILTERS: { key: OrderFilterKey; label: string; statuses?: Order['status'][] }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending', statuses: ['new', 'design'] },
  { key: 'active', label: 'Active', statuses: ['printing', 'nfc_writing', 'nfc_verification'] },
  { key: 'done', label: 'Done', statuses: ['ready', 'delivered'] },
];

function includesLoose(haystack: string, needle: string) {
  return haystack.toLowerCase().includes(needle.toLowerCase());
}

function orderMatchesQuery(order: Order, query: string) {
  if (!query) return true;
  const q = query.trim().toLowerCase();
  const statusLabel = orderStatusOptions.find((o) => o.value === order.status)?.label ?? order.status;

  return (
    includesLoose(order.id, q)
    || includesLoose(order.id.slice(0, 8), q)
    || includesLoose(order.customerName ?? '', q)
    || includesLoose(order.phone ?? '', q)
    || includesLoose(order.cardCode ?? '', q)
    || includesLoose(order.status ?? '', q)
    || includesLoose(statusLabel, q)
  );
}

export default function SalesOrdersScreen() {
  const { user } = useAuth();
  const { orders, isLoading, refresh } = useOrders('sales', user?.id ?? '');
  const { input, setInput, query, submitSearch, clearSearch } = useSearchQuery();
  const [filter, setFilter] = useState<OrderFilterKey>('all');

  useEffect(() => {
    refresh();
  }, [refresh]);

  const filtered = useMemo(() => {
    return orders.filter((order) => {
      const statuses = ORDER_FILTERS.find((f) => f.key === filter)?.statuses;
      const statusOk = !statuses || statuses.includes(order.status);
      return statusOk && orderMatchesQuery(order, query);
    });
  }, [filter, orders, query]);

  return (
    <SafeAreaView style={styles.safe}>
      <AppHeader
        title="Manage Orders"
        subtitle="Sales"
        role="sales"
        actionIcon="Plus"
        onActionPress={() => router.push(appRoutes.sales.newOrder)}
      />

      <AppSearchBar
        value={input}
        onChangeText={setInput}
        onSearch={submitSearch}
        onClear={clearSearch}
        role="sales"
        placeholder="Search by order ID, customer, phone, card code, status…"
      />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.filtersRow}>
          {ORDER_FILTERS.map((opt) => {
            const active = opt.key === filter;
            return (
              <Pressable
                key={opt.key}
                onPress={() => setFilter(opt.key)}
                style={[
                  styles.filterPill,
                  active ? styles.filterPillActive : styles.filterPillIdle,
                ]}
              >
                <AppText style={[styles.filterText, active ? styles.filterTextActive : styles.filterTextIdle]}>
                  {opt.label}
                </AppText>
              </Pressable>
            );
          })}
        </View>

        {isLoading ? (
          <AppLoadingState title="Loading orders..." role="sales" />
        ) : filtered.length === 0 ? (
          <AppEmptyState
            title={query ? 'No matching orders' : 'No orders yet'}
            description={
              query
                ? `No results for "${query}". Try a different keyword or switch filters.`
                : 'Create the first customer order from this sales account.'
            }
            iconName="ClipboardList"
            role="sales"
          />
        ) : (
          filtered.map((order) => <OrderCard key={order.id} order={order} />)
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
  filtersRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.sm,
  },
  filterPill: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: theme.radius.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
  filterPillIdle: {
    backgroundColor: theme.colors.surface,
    borderColor: theme.colors.border,
  },
  filterPillActive: {
    backgroundColor: salesTheme.primary,
    borderColor: salesTheme.primary,
  },
  filterText: {
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
  },
  filterTextIdle: {
    color: theme.colors.textMuted,
  },
  filterTextActive: {
    color: theme.colors.textInverse,
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
