import { useEffect, useState } from 'react';
import { Alert, Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, orderBy, query, updateDoc, doc } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;

interface PrinterJob {
  id: string;
  queueNumber: number;
  orderId: string;
  qaVideoUrl: string;
  salaryStatus: 'pending' | 'approved' | 'rejected' | string;
  printerId?: string;
  printerName?: string;
  createdAt?: any;
}

function SalaryStatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    approved: { bg: '#EDFAF4', text: '#2BC48A' },
    rejected: { bg: '#FFE5E5', text: '#E74C3C' },
    pending:  { bg: '#FFFBEB', text: '#f59e0b' },
  };
  const colors = map[status] ?? { bg: '#f3f4f6', text: '#888' };
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

export default function QaVideosScreen() {
  const [jobs, setJobs] = useState<PrinterJob[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(
          query(collection(db, 'printer_jobs'), orderBy('createdAt', 'desc'))
        );
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as PrinterJob));
        // Filter to only jobs with a QA video URL
        setJobs(all.filter(j => j.qaVideoUrl));
      } catch {
        // silent — show empty state
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatus(job: PrinterJob, status: 'approved' | 'rejected') {
    try {
      await updateDoc(doc(db, 'printer_jobs', job.id), { salaryStatus: status });
      setJobs(prev => prev.map(j => j.id === job.id ? { ...j, salaryStatus: status } : j));
    } catch {
      Alert.alert('Error', 'Could not update status.');
    }
  }

  async function openVideo(url: string) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        Alert.alert('Cannot open URL', url);
      }
    } catch {
      Alert.alert('Error', 'Could not open video link.');
    }
  }

  function formatDate(ts: any): string {
    if (!ts) return '—';
    try {
      const d = ts.toDate ? ts.toDate() : new Date(ts);
      return d.toLocaleDateString();
    } catch {
      return '—';
    }
  }

  const pendingCount = jobs.filter(j => j.salaryStatus === 'pending' || !j.salaryStatus).length;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>QA Videos</AppText>
        {pendingCount > 0 && (
          <View style={styles.pendingBadge}>
            <AppText style={styles.pendingBadgeText}>{pendingCount} pending</AppText>
          </View>
        )}
      </View>

      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.empty}>Loading QA videos…</AppText>
        ) : jobs.length === 0 ? (
          <View style={styles.emptyState}>
            <AppIcon name="FileVideo" size={48} color="#ccc" />
            <AppText style={styles.emptyTitle}>No QA Videos Yet</AppText>
            <AppText style={styles.emptyDesc}>
              QA videos will appear here once printers upload proof recordings.
            </AppText>
          </View>
        ) : (
          jobs.map(job => (
            <View key={job.id} style={styles.card}>
              <View style={styles.cardTop}>
                <View style={styles.cardLeft}>
                  <AppText style={styles.queueNum}>Queue #{job.queueNumber ?? '—'}</AppText>
                  <AppText style={styles.orderId}>
                    Order: {job.orderId ? job.orderId.slice(0, 8).toUpperCase() : '—'}
                  </AppText>
                  {job.printerName && (
                    <AppText style={styles.meta}>Printer: {job.printerName}</AppText>
                  )}
                  <AppText style={styles.meta}>{formatDate(job.createdAt)}</AppText>
                </View>
                <SalaryStatusBadge status={job.salaryStatus ?? 'pending'} />
              </View>

              {/* Video link */}
              <Pressable
                style={styles.videoLink}
                onPress={() => openVideo(job.qaVideoUrl)}
              >
                <AppIcon name="FileVideo" size={16} color="#3b82f6" />
                <AppText style={styles.videoLinkText} numberOfLines={1}>
                  {job.qaVideoUrl.length > 50
                    ? job.qaVideoUrl.slice(0, 50) + '…'
                    : job.qaVideoUrl}
                </AppText>
              </Pressable>

              {/* Action buttons */}
              {(job.salaryStatus === 'pending' || !job.salaryStatus) && (
                <View style={styles.actionRow}>
                  <Pressable
                    style={[styles.actionBtn, styles.approveBtn]}
                    onPress={() => updateStatus(job, 'approved')}
                  >
                    <AppText style={styles.approveBtnText}>✓ Approve</AppText>
                  </Pressable>
                  <Pressable
                    style={[styles.actionBtn, styles.rejectBtn]}
                    onPress={() => updateStatus(job, 'rejected')}
                  >
                    <AppText style={styles.rejectBtnText}>✕ Reject</AppText>
                  </Pressable>
                </View>
              )}
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
  pendingBadge: { backgroundColor: '#f59e0b', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 4 },
  pendingBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  list: { padding: 12, paddingBottom: 40, gap: 12 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  emptyState: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#555' },
  emptyDesc: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingHorizontal: 40, lineHeight: 20 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 },
  cardLeft: { flex: 1, gap: 3 },
  queueNum: { fontSize: 15, fontWeight: '700', color: NAVY },
  orderId: { fontSize: 12, color: '#555', fontWeight: '600' },
  meta: { fontSize: 11, color: '#888' },
  videoLink: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#EEF2FF', borderRadius: 10, paddingHorizontal: 12, paddingVertical: 8 },
  videoLinkText: { flex: 1, fontSize: 12, color: '#3b82f6', fontWeight: '600' },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionBtn: { flex: 1, borderRadius: 10, paddingVertical: 9, alignItems: 'center' },
  approveBtn: { backgroundColor: '#EDFAF4' },
  approveBtnText: { fontSize: 13, fontWeight: '700', color: '#2BC48A' },
  rejectBtn: { backgroundColor: '#FFE5E5' },
  rejectBtnText: { fontSize: 13, fontWeight: '700', color: '#E74C3C' },
});

