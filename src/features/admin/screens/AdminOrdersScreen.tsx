import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { orderCardStatusOptions, orderStatusOptions, paymentStatusColors } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { updateOrderStatus } from '@/src/services/firestoreService';
import { getAuthErrorMessage } from '@/src/services/authService';
import { Order, OrderStatus } from '@/src/types/models';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;

const STATUS_FLOW: OrderStatus[] = ['new','design','printing','nfc_writing','nfc_verification','ready','delivered'];

export default function AdminOrdersScreen() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  async function load() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')));
      console.debug('[AdminOrdersScreen] API orders snapshot', { count: snap.size });
      const nextOrders = snap.docs.map(d => ({ id: d.id, ...d.data() } as Order));
      console.debug('[AdminOrdersScreen] parsed orders', {
        count: nextOrders.length,
        sample: nextOrders[0]
          ? {
              id: nextOrders[0].id,
              status: nextOrders[0].status,
              cardStatus: nextOrders[0].cardStatus,
              paymentStatus: nextOrders[0].paymentStatus,
            }
          : null,
      });
      setOrders(nextOrders);
    } catch (err) {
      console.debug('[AdminOrdersScreen] load failed', err);
    } finally { setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function advanceStatus(order: Order) {
    const idx = STATUS_FLOW.indexOf(order.status);
    if (idx < 0 || idx >= STATUS_FLOW.length - 1) return;
    const next = STATUS_FLOW[idx + 1];
    Alert.alert(
      'Advance order?',
      `Move ${order.customerName} to ${next}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Advance',
          onPress: async () => {
            try {
              await updateOrderStatus(order.id, next);
              setOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: next } : o));
            } catch (err) {
              Alert.alert('Update failed', getAuthErrorMessage(err));
            }
          },
        },
      ]
    );
  }

  const filtered = orders.filter(o => {
    const matchSearch = o.customerName?.toLowerCase().includes(search.toLowerCase()) || o.cardCode?.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all'
      || (filterStatus === 'frozen' || filterStatus === 'closed'
        ? (o.cardStatus ?? 'active') === filterStatus
        : o.status === filterStatus);
    return matchSearch && matchStatus;
  });
  console.debug('[AdminOrdersScreen] filter/render state', {
    total: orders.length,
    filtered: filtered.length,
    filterStatus,
    search,
    firstVisible: filtered[0]
      ? {
          id: filtered[0].id,
          status: filtered[0].status,
          cardStatus: filtered[0].cardStatus,
        }
      : null,
  });

  const statusTabs = ['all', 'new', 'printing', 'nfc_writing', 'ready', 'frozen', 'closed', 'delivered'];

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>Orders</AppText>
        <AppText style={styles.headerCount}>{orders.length} total</AppText>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <AppIcon name="ClipboardList" size={16} color="#888" />
        <TextInput style={styles.searchInput} placeholder="Search customer or card code…" placeholderTextColor="#aaa" value={search} onChangeText={setSearch} />
      </View>

      {/* Status filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterRow}>
          {statusTabs.map(s => {
            const opt = orderStatusOptions.find(o => o.value === s);
            return (
              <Pressable key={s} style={[styles.filterPill, filterStatus === s && { backgroundColor: opt?.color ?? NAVY, borderColor: opt?.color ?? NAVY }]} onPress={() => setFilterStatus(s)}>
                <AppText style={[styles.filterText, filterStatus === s && { color: '#fff' }]}>{s === 'all' ? 'All' : opt?.label ?? s}</AppText>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? <AppText style={styles.empty}>Loading…</AppText>
          : filtered.length === 0 ? <AppText style={styles.empty}>No orders found.</AppText>
          : filtered.map(order => {
            const statusOpt = orderStatusOptions.find(o => o.value === order.status);
            const cardStatus = order.cardStatus ?? 'active';
            const cardStatusOpt = orderCardStatusOptions.find(o => o.value === cardStatus);
            const payColor = paymentStatusColors[order.paymentStatus] ?? '#999';
            const canAdvance = order.status !== 'delivered' && cardStatus === 'active';
            return (
              <Pressable
                key={order.id}
                style={({ pressed }) => [styles.card, pressed && styles.cardPressed]}
                onPress={() => router.push({ pathname: '/order-detail/[orderId]', params: { orderId: order.id } })}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardLeft}>
                    <AppText style={styles.cardId}>#{order.id.slice(0,8).toUpperCase()}</AppText>
                    <AppText style={styles.cardName}>{order.customerName}</AppText>
                    <AppText style={styles.cardMeta}>{order.productType?.replace('_',' ')} × {order.quantity} · {order.cardCode}</AppText>
                    {order.priority === 'urgent' && <View style={styles.urgentBadge}><AppText style={styles.urgentText}>URGENT</AppText></View>}
                  </View>
                  <View style={styles.cardRight}>
                    <View style={[styles.badge, { backgroundColor: (statusOpt?.color ?? '#999') + '22' }]}>
                      <AppText style={[styles.badgeText, { color: statusOpt?.color ?? '#999' }]}>{statusOpt?.label ?? order.status}</AppText>
                    </View>
                    <View style={[styles.badge, { backgroundColor: payColor + '22' }]}>
                      <AppText style={[styles.badgeText, { color: payColor }]}>{order.paymentStatus?.toUpperCase()}</AppText>
                    </View>
                    {cardStatus !== 'active' && cardStatusOpt ? (
                      <View style={[styles.badge, { backgroundColor: cardStatusOpt.color + '22' }]}>
                        <AppText style={[styles.badgeText, { color: cardStatusOpt.color }]}>{cardStatusOpt.label.toUpperCase()}</AppText>
                      </View>
                    ) : null}
                  </View>
                </View>
                {canAdvance ? (
                  <Pressable style={styles.advanceBtn} onPress={() => advanceStatus(order)}>
                    <AppText style={styles.advanceBtnText}>Advance → {orderStatusOptions.find(o => o.value === STATUS_FLOW[STATUS_FLOW.indexOf(order.status)+1])?.label ?? '—'}</AppText>
                  </Pressable>
                ) : cardStatus !== 'active' ? (
                  <View style={styles.lockedStrip}>
                    <AppText style={styles.lockedText}>{cardStatusOpt?.label ?? cardStatus} card. Open detail to manage it.</AppText>
                  </View>
                ) : null}
              </Pressable>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: adminTheme.background },
  header: { backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  headerCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', margin: 12, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  filterScroll: { paddingLeft: 12, marginBottom: 4 },
  filterRow: { flexDirection: 'row', gap: 8, paddingRight: 12, paddingBottom: 8 },
  filterPill: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#ddd', backgroundColor: '#fff' },
  filterText: { fontSize: 12, fontWeight: '600', color: '#555' },
  list: { padding: 12, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardPressed: { opacity: 0.88, transform: [{ scale: 0.995 }] },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  cardLeft: { flex: 1, gap: 3 },
  cardId: { fontSize: 11, fontWeight: '700', color: NAVY },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardMeta: { fontSize: 12, color: '#888' },
  urgentBadge: { alignSelf: 'flex-start', backgroundColor: '#FFE5E5', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  urgentText: { fontSize: 10, fontWeight: '700', color: '#E74C3C' },
  cardRight: { alignItems: 'flex-end', gap: 5 },
  badge: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  badgeText: { fontSize: 10, fontWeight: '700' },
  advanceBtn: { backgroundColor: NAVY + '11', borderRadius: 10, paddingVertical: 8, alignItems: 'center' },
  advanceBtnText: { fontSize: 12, fontWeight: '700', color: NAVY },
  lockedStrip: { backgroundColor: '#EEF2FF', borderRadius: 10, paddingVertical: 8, paddingHorizontal: 10 },
  lockedText: { fontSize: 12, fontWeight: '700', color: NAVY, textAlign: 'center' },
});

