import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;

type VerificationStatus = 'verified' | 'written' | 'failed' | 'writing' | string;

interface NfcCard {
  id: string;
  chipUID: string;
  cardCode: string;
  profileUrl: string;
  verificationStatus: VerificationStatus;
  writtenBy: string;
  writtenAt: any;
  orderId?: string;
}

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  verified: { bg: '#EDFAF4', text: '#2BC48A' },
  written:  { bg: '#EEF2FF', text: '#3b82f6' },
  failed:   { bg: '#FFE5E5', text: '#E74C3C' },
  writing:  { bg: '#FFFBEB', text: '#f59e0b' },
};

function StatusBadge({ status }: { status: VerificationStatus }) {
  const colors = STATUS_COLORS[status] ?? { bg: '#f3f4f6', text: '#888' };
  return (
    <View style={[badge.wrap, { backgroundColor: colors.bg }]}>
      <AppText style={[badge.text, { color: colors.text }]}>{status.toUpperCase()}</AppText>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, fontWeight: '700' },
});

export default function NfcLogsScreen() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(query(collection(db, 'nfc_cards'), orderBy('writtenAt', 'desc')));
        setCards(snap.docs.map(d => ({ id: d.id, ...d.data() } as NfcCard)));
      } catch {
        // silent fail — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = cards.filter(c => {
    const q = search.toLowerCase();
    return (
      c.chipUID?.toLowerCase().includes(q) ||
      c.cardCode?.toLowerCase().includes(q) ||
      c.writtenBy?.toLowerCase().includes(q)
    );
  });

  function formatDate(ts: any): string {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '—';
    }
  }

  function truncate(str: string, max = 36): string {
    if (!str) return '—';
    return str.length > max ? str.slice(0, max) + '…' : str;
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>NFC Logs</AppText>
        <AppText style={styles.headerCount}>{cards.length} chips</AppText>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {(['verified', 'written', 'writing', 'failed'] as const).map(s => {
          const count = cards.filter(c => c.verificationStatus === s).length;
          const colors = STATUS_COLORS[s];
          return (
            <View key={s} style={styles.statCard}>
              <AppText style={[styles.statNum, { color: colors.text }]}>{count}</AppText>
              <AppText style={styles.statLabel}>{s}</AppText>
            </View>
          );
        })}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <AppIcon name="Nfc" size={16} color="#888" />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by card code or chip UID…"
          placeholderTextColor="#aaa"
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.empty}>Loading NFC logs…</AppText>
        ) : filtered.length === 0 ? (
          <AppText style={styles.empty}>No NFC records found.</AppText>
        ) : (
          filtered.map(card => (
            <View key={card.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <AppText style={styles.chipUID}>{card.chipUID || '—'}</AppText>
                  {card.cardCode ? (
                    <AppText style={styles.cardCode}>Card: {card.cardCode}</AppText>
                  ) : null}
                  {card.orderId ? (
                    <AppText style={styles.meta}>Order: {card.orderId.slice(0, 8).toUpperCase()}</AppText>
                  ) : null}
                  <AppText style={styles.meta} numberOfLines={1}>
                    {truncate(card.profileUrl)}
                  </AppText>
                </View>
                <StatusBadge status={card.verificationStatus ?? 'unknown'} />
              </View>
              <View style={styles.cardBottom}>
                <AppText style={styles.metaSmall}>By: {card.writtenBy || '—'}</AppText>
                <AppText style={styles.metaSmall}>{formatDate(card.writtenAt)}</AppText>
              </View>
            </View>
          ))
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
  headerCount: { color: 'rgba(255,255,255,0.7)', fontSize: 13 },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', gap: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statNum: { fontSize: 20, fontWeight: '700' },
  statLabel: { fontSize: 10, color: '#888', textTransform: 'capitalize' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: '#333' },
  list: { padding: 12, paddingBottom: 40, gap: 10 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardLeft: { flex: 1, gap: 3 },
  chipUID: { fontSize: 14, fontWeight: '700', color: NAVY },
  cardCode: { fontSize: 12, color: '#555', fontWeight: '600' },
  meta: { fontSize: 11, color: '#888' },
  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#f0f0f0', paddingTop: 8 },
  metaSmall: { fontSize: 11, color: '#aaa' },
});

