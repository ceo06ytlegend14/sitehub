import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, getDocs, orderBy, query, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;

interface SalaryRecord {
  id: string;
  printerName: string;
  printerId: string;
  period: string;
  totalCards: number;
  failedCards: number;
  total: number;
  status: 'paid' | 'unpaid' | string;
}

interface Payout {
  id: string;
  userId: string;
  periodLabel: string;
  amount: number;
  status: 'paid' | 'unpaid' | string;
}

interface UserMap {
  [uid: string]: string;
}

function StatusBadge({ status }: { status: string }) {
  const isPaid = status === 'paid';
  return (
    <View style={[badge.wrap, { backgroundColor: isPaid ? '#EDFAF4' : '#FFF3E0' }]}>
      <AppText style={[badge.text, { color: isPaid ? '#2BC48A' : '#f59e0b' }]}>
        {status.toUpperCase()}
      </AppText>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, fontWeight: '700' },
});

export default function SalaryScreen() {
  const [tab, setTab] = useState<'printers' | 'salesmen'>('printers');
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [userMap, setUserMap] = useState<UserMap>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        // Load users for name mapping
        const usersSnap = await getDocs(collection(db, 'users'));
        const map: UserMap = {};
        usersSnap.docs.forEach(d => {
          const data = d.data();
          map[d.id] = data.displayName || data.email || d.id;
        });
        setUserMap(map);

        // Load salary records (printers)
        const salarySnap = await getDocs(
          query(collection(db, 'salary_records'), orderBy('period', 'desc'))
        );
        setSalaryRecords(salarySnap.docs.map(d => ({ id: d.id, ...d.data() } as SalaryRecord)));

        // Load payouts (salesmen)
        const payoutsSnap = await getDocs(
          query(collection(db, 'payouts'), orderBy('periodLabel', 'desc'))
        );
        setPayouts(payoutsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Payout)));
      } catch {
        // silent — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function approveSalary(record: SalaryRecord) {
    try {
      await updateDoc(doc(db, 'salary_records', record.id), {
        status: 'paid',
        approvedAt: serverTimestamp(),
      });
      setSalaryRecords(prev =>
        prev.map(r => r.id === record.id ? { ...r, status: 'paid' } : r)
      );
    } catch {
      Alert.alert('Error', 'Could not approve salary record.');
    }
  }

  async function approvePayout(payout: Payout) {
    try {
      await updateDoc(doc(db, 'payouts', payout.id), {
        status: 'paid',
        approvedAt: serverTimestamp(),
      });
      setPayouts(prev =>
        prev.map(p => p.id === payout.id ? { ...p, status: 'paid' } : p)
      );
    } catch {
      Alert.alert('Error', 'Could not approve payout.');
    }
  }

  const totalPrinterUnpaid = salaryRecords
    .filter(r => r.status !== 'paid')
    .reduce((s, r) => s + (r.total ?? 0), 0);

  const totalSalesUnpaid = payouts
    .filter(p => p.status !== 'paid')
    .reduce((s, p) => s + (p.amount ?? 0), 0);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronLeft" size={22} color="#fff" />
        </Pressable>
        <AppText style={styles.headerTitle}>Salary & Commission</AppText>
      </View>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryCard}>
          <AppText style={[styles.summaryNum, { color: '#f59e0b' }]}>${totalPrinterUnpaid.toFixed(0)}</AppText>
          <AppText style={styles.summaryLabel}>Printer Unpaid</AppText>
        </View>
        <View style={styles.summaryCard}>
          <AppText style={[styles.summaryNum, { color: '#7c3aed' }]}>${totalSalesUnpaid.toFixed(0)}</AppText>
          <AppText style={styles.summaryLabel}>Sales Unpaid</AppText>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {(['printers', 'salesmen'] as const).map(t => (
          <Pressable
            key={t}
            style={[styles.tab, tab === t && styles.tabActive]}
            onPress={() => setTab(t)}
          >
            <AppText style={[styles.tabText, tab === t && styles.tabTextActive]}>
              {t === 'printers' ? '🖨 Printers' : '💼 Salesmen'}
            </AppText>
          </Pressable>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.empty}>Loading…</AppText>
        ) : tab === 'printers' ? (
          salaryRecords.length === 0 ? (
            <AppText style={styles.empty}>No salary records found.</AppText>
          ) : (
            salaryRecords.map(record => (
              <View key={record.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <AppText style={styles.cardName}>{record.printerName || userMap[record.printerId] || '—'}</AppText>
                    <AppText style={styles.cardMeta}>Period: {record.period}</AppText>
                    <AppText style={styles.cardMeta}>
                      Cards: {record.totalCards ?? 0} total · {record.failedCards ?? 0} failed
                    </AppText>
                  </View>
                  <View style={styles.cardRight}>
                    <AppText style={styles.cardAmount}>${(record.total ?? 0).toFixed(2)}</AppText>
                    <StatusBadge status={record.status ?? 'unpaid'} />
                  </View>
                </View>
                {record.status !== 'paid' && (
                  <Pressable
                    style={styles.approveBtn}
                    onPress={() => approveSalary(record)}
                  >
                    <AppText style={styles.approveBtnText}>✓ Approve & Mark Paid</AppText>
                  </Pressable>
                )}
              </View>
            ))
          )
        ) : (
          payouts.length === 0 ? (
            <AppText style={styles.empty}>No payout records found.</AppText>
          ) : (
            payouts.map(payout => (
              <View key={payout.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <View style={styles.cardLeft}>
                    <AppText style={styles.cardName}>{userMap[payout.userId] || payout.userId}</AppText>
                    <AppText style={styles.cardMeta}>Period: {payout.periodLabel}</AppText>
                  </View>
                  <View style={styles.cardRight}>
                    <AppText style={styles.cardAmount}>${(payout.amount ?? 0).toFixed(2)}</AppText>
                    <StatusBadge status={payout.status ?? 'unpaid'} />
                  </View>
                </View>
                {payout.status !== 'paid' && (
                  <Pressable
                    style={styles.approveBtn}
                    onPress={() => approvePayout(payout)}
                  >
                    <AppText style={styles.approveBtnText}>✓ Approve & Mark Paid</AppText>
                  </Pressable>
                )}
              </View>
            ))
          )
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
  summaryRow: { flexDirection: 'row', padding: 12, gap: 10 },
  summaryCard: { flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 14, alignItems: 'center', gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  summaryNum: { fontSize: 24, fontWeight: '700' },
  summaryLabel: { fontSize: 12, color: '#888' },
  tabRow: { flexDirection: 'row', marginHorizontal: 12, marginBottom: 8, backgroundColor: '#fff', borderRadius: 14, padding: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  tab: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  tabActive: { backgroundColor: NAVY },
  tabText: { fontSize: 14, fontWeight: '600', color: '#888' },
  tabTextActive: { color: '#fff' },
  list: { padding: 12, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardLeft: { flex: 1, gap: 3 },
  cardName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  cardMeta: { fontSize: 12, color: '#888' },
  cardRight: { alignItems: 'flex-end', gap: 6 },
  cardAmount: { fontSize: 18, fontWeight: '700', color: NAVY },
  approveBtn: { backgroundColor: '#EDFAF4', borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#2BC48A' },
});

