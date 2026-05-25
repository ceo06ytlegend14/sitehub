import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const ORDER_STATUS_OPTIONS: { label: string; value: string; color: string }[] = [
  { label: 'New',              value: 'new',              color: '#6E8A95' },
  { label: 'Design',           value: 'design',           color: '#FFB343' },
  { label: 'Printing',         value: 'printing',         color: '#00A4A6' },
  { label: 'NFC Writing',      value: 'nfc_writing',      color: '#7c3aed' },
  { label: 'NFC Verification', value: 'nfc_verification', color: '#2563eb' },
  { label: 'Ready',            value: 'ready',            color: '#2BC48A' },
  { label: 'Delivered',        value: 'delivered',        color: '#173E4A' },
];

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;

interface OrderData {
  id: string;
  status: string;
  paymentStatus: string;
  quantity: number;
  assignedSalesman: string;
  productType: string;
  createdAt: any;
}

interface PrinterJobData {
  id: string;
  printerId: string;
  printerName?: string;
  salaryStatus?: string;
  totalCards?: number;
}

interface SalesmanStat {
  id: string;
  name: string;
  count: number;
  revenue: number;
}

interface PrinterStat {
  id: string;
  name: string;
  cards: number;
}

const PRODUCT_PRICES: Record<string, number> = {
  wood_card: 49,
  metal_card: 89,
  pvc_card: 29,
};

export default function ReportsScreen() {
  const [orders, setOrders] = useState<OrderData[]>([]);
  const [printerJobs, setPrinterJobs] = useState<PrinterJobData[]>([]);
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const [ordersSnap, jobsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc'))),
          getDocs(collection(db, 'printer_jobs')),
          getDocs(collection(db, 'users')),
        ]);

        const map: Record<string, string> = {};
        usersSnap.docs.forEach(d => {
          const data = d.data();
          map[d.id] = data.displayName || data.email || d.id;
        });
        setUserMap(map);

        setOrders(ordersSnap.docs.map(d => ({ id: d.id, ...d.data() } as OrderData)));
        setPrinterJobs(jobsSnap.docs.map(d => ({ id: d.id, ...d.data() } as PrinterJobData)));
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Computed stats
  const totalRevenue = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.quantity ?? 1) * (PRODUCT_PRICES[o.productType] ?? 49), 0);

  const totalCards = printerJobs.reduce((s, j) => s + (j.totalCards ?? 1), 0);

  const commissionPaid = orders
    .filter(o => o.paymentStatus === 'paid')
    .reduce((s, o) => s + (o.quantity ?? 1) * (PRODUCT_PRICES[o.productType] ?? 49) * 0.1, 0);

  // Status breakdown
  type StatusBreakdownItem = { label: string; value: string; color: string; count: number };
  const statusBreakdown: StatusBreakdownItem[] = ORDER_STATUS_OPTIONS.map(opt => ({
    label: opt.label,
    value: opt.value,
    color: opt.color,
    count: orders.filter(o => o.status === opt.value).length,
  }));
  const maxStatusCount = Math.max(...statusBreakdown.map(s => s.count), 1);

  // Top salesmen
  const salesmanMap: Record<string, SalesmanStat> = {};
  orders.forEach(o => {
    const sid = o.assignedSalesman;
    if (!sid) return;
    if (!salesmanMap[sid]) {
      salesmanMap[sid] = { id: sid, name: userMap[sid] || sid, count: 0, revenue: 0 };
    }
    salesmanMap[sid].count += 1;
    if (o.paymentStatus === 'paid') {
      salesmanMap[sid].revenue += (o.quantity ?? 1) * (PRODUCT_PRICES[o.productType] ?? 49);
    }
  });
  const topSalesmen = Object.values(salesmanMap)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Top printers
  const printerMap: Record<string, PrinterStat> = {};
  printerJobs.forEach(j => {
    const pid = j.printerId;
    if (!pid) return;
    if (!printerMap[pid]) {
      printerMap[pid] = { id: pid, name: j.printerName || userMap[pid] || pid, cards: 0 };
    }
    printerMap[pid].cards += j.totalCards ?? 1;
  });
  const topPrinters = Object.values(printerMap)
    .sort((a, b) => b.cards - a.cards)
    .slice(0, 5);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>Reports</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.empty}>Loading reports…</AppText>
        ) : (
          <>
            {/* Summary cards */}
            <AppText style={styles.sectionTitle}>Summary</AppText>
            <View style={styles.statsGrid}>
              {[
                { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: '#10b981', icon: 'Wallet' as const },
                { label: 'Total Orders',  value: orders.length,                       color: '#3b82f6', icon: 'ClipboardList' as const },
                { label: 'Cards Printed', value: totalCards,                          color: '#7c3aed', icon: 'CreditCard' as const },
                { label: 'Commission',    value: `$${commissionPaid.toFixed(0)}`,     color: '#f59e0b', icon: 'BadgeDollarSign' as const },
              ].map(s => (
                <View key={s.label} style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: s.color + '18' }]}>
                    <AppIcon name={s.icon} size={20} color={s.color} />
                  </View>
                  <AppText style={[styles.statNum, { color: s.color }]}>{s.value}</AppText>
                  <AppText style={styles.statLabel}>{s.label}</AppText>
                </View>
              ))}
            </View>

            {/* Order status breakdown */}
            <AppText style={styles.sectionTitle}>Order Status Breakdown</AppText>
            <View style={styles.card}>
              {statusBreakdown.map(s => (
                <View key={s.value} style={styles.barRow}>
                  <AppText style={styles.barLabel}>{s.label}</AppText>
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barFill,
                        {
                          width: `${(s.count / maxStatusCount) * 100}%` as any,
                          backgroundColor: s.color,
                        },
                      ]}
                    />
                  </View>
                  <AppText style={[styles.barCount, { color: s.color }]}>{s.count}</AppText>
                </View>
              ))}
            </View>

            {/* Top salesmen */}
            <AppText style={styles.sectionTitle}>Top Salesmen</AppText>
            <View style={styles.card}>
              {topSalesmen.length === 0 ? (
                <AppText style={styles.emptyInCard}>No sales data yet.</AppText>
              ) : (
                topSalesmen.map((s, i) => (
                  <View key={s.id} style={styles.rankRow}>
                    <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#cd7c2f' }]}>
                      <AppText style={styles.rankNum}>#{i + 1}</AppText>
                    </View>
                    <View style={styles.rankInfo}>
                      <AppText style={styles.rankName}>{s.name}</AppText>
                      <AppText style={styles.rankMeta}>{s.count} orders · ${s.revenue.toLocaleString()} revenue</AppText>
                    </View>
                  </View>
                ))
              )}
            </View>

            {/* Top printers */}
            <AppText style={styles.sectionTitle}>Top Printers</AppText>
            <View style={styles.card}>
              {topPrinters.length === 0 ? (
                <AppText style={styles.emptyInCard}>No printer data yet.</AppText>
              ) : (
                topPrinters.map((p, i) => (
                  <View key={p.id} style={styles.rankRow}>
                    <View style={[styles.rankBadge, { backgroundColor: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : '#cd7c2f' }]}>
                      <AppText style={styles.rankNum}>#{i + 1}</AppText>
                    </View>
                    <View style={styles.rankInfo}>
                      <AppText style={styles.rankName}>{p.name}</AppText>
                      <AppText style={styles.rankMeta}>{p.cards} cards printed</AppText>
                    </View>
                  </View>
                ))
              )}
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40, gap: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: NAVY, marginTop: 4 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 6, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#888' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  barRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  barLabel: { width: 90, fontSize: 11, color: '#555', fontWeight: '600' },
  barTrack: { flex: 1, height: 10, backgroundColor: '#f0f0f0', borderRadius: 5, overflow: 'hidden' },
  barFill: { height: 10, borderRadius: 5, minWidth: 4 },
  barCount: { width: 28, fontSize: 12, fontWeight: '700', textAlign: 'right' },
  rankRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  rankBadge: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  rankNum: { color: '#fff', fontSize: 11, fontWeight: '700' },
  rankInfo: { flex: 1, gap: 2 },
  rankName: { fontSize: 14, fontWeight: '700', color: '#1A1A2E' },
  rankMeta: { fontSize: 11, color: '#888' },
  emptyInCard: { textAlign: 'center', color: '#aaa', fontSize: 13, paddingVertical: 8 },
});

