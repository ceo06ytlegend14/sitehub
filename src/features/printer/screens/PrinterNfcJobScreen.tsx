import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { getOrder, saveNfcWrite, updateNfcStatus, updatePrinterJob } from '@/src/services/firestoreService';
import { Order } from '@/src/types/models';

const printerTheme = theme.roles.printer;
const TEAL = printerTheme.primary;
const TEAL_DARK = printerTheme.primaryDark;

// ─── Step bar ─────────────────────────────────────────────────────────────────
function StepBar({ current }: { current: 1 | 2 | 3 }) {
  const steps = ['Print', 'Encode', 'QA Video'];
  return (
    <View style={sb.row}>
      {steps.map((label, i) => {
        const done = i + 1 < current;
        const active = i + 1 === current;
        return (
          <View key={label} style={sb.item}>
            <View style={[sb.dot, done && sb.dotDone, active && sb.dotActive]}>
              <AppText style={[sb.dotNum, (done || active) && sb.dotNumActive]}>
                {done ? 'OK' : String(i + 1)}
              </AppText>
            </View>
            <AppText style={[sb.label, active && sb.labelActive]}>{label}</AppText>
            {i < 2 && <View style={[sb.line, done && sb.lineDone]} />}
          </View>
        );
      })}
    </View>
  );
}
const sb = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 0, paddingVertical: 12 },
  item: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 28, height: 28, borderRadius: 14, borderWidth: 2, borderColor: 'rgba(255,255,255,0.4)', alignItems: 'center', justifyContent: 'center' },
  dotActive: { borderColor: '#fff', backgroundColor: '#fff' },
  dotDone: { borderColor: '#7FFFD4', backgroundColor: '#7FFFD4' },
  dotNum: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.6)' },
  dotNumActive: { color: TEAL },
  label: { fontSize: 11, color: 'rgba(255,255,255,0.7)', fontWeight: '500' },
  labelActive: { color: '#fff', fontWeight: '700' },
  line: { width: 24, height: 2, backgroundColor: 'rgba(255,255,255,0.25)', marginHorizontal: 4 },
  lineDone: { backgroundColor: '#7FFFD4' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function NfcProgrammingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user } = useAuth();
  const { jobs } = usePrinterJobs();
  const job = jobs.find(j => j.id === jobId) ?? null;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [written, setWritten] = useState(false);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    if (job?.orderId) getOrder(job.orderId).then(setOrder);
  }, [job?.orderId]);

  // Guard — no jobId means someone hit the route directly
  if (!jobId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.replace('/printer/queue')} style={styles.backBtn} hitSlop={12}>
            <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <View style={styles.headerInfo}>
            <AppText style={styles.headerTitle}>NFC Encode</AppText>
          </View>
        </View>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 }}>
          <AppIcon name="Nfc" size={48} color="#ccc" />
          <AppText style={{ fontSize: 18, fontWeight: '700', color: printerTheme.text, textAlign: 'center' }}>No job selected</AppText>
          <AppText style={{ fontSize: 14, color: printerTheme.muted, textAlign: 'center' }}>Go to the queue and tap a job to start NFC programming.</AppText>
          <Pressable style={[styles.writeBtn, { marginTop: 8 }]} onPress={() => router.replace('/printer/queue')}>
            <AppText style={styles.writeBtnText}>Back to Queue</AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  async function handleWrite() {
    if (!user || !job || !order) return;
    setLoading(true);
    try {
      await updateNfcStatus(order.cardCode, 'writing', user.id);
      if (job.stage === 'queued') {
        await updatePrinterJob(job.id, 'printing', undefined, user.id);
      }
      if (job.stage === 'queued' || job.stage === 'printing') {
        await updatePrinterJob(job.id, 'nfc_writing', undefined, user.id);
      }

      await saveNfcWrite({
        chipUID: order.cardCode,
        profileUrl: order.profileUrl,
        orderId: order.id,
        cardCode: order.cardCode,
        writtenBy: user.id,
      });

      await updateNfcStatus(order.cardCode, 'written', user.id);
      setWritten(true);

      setTimeout(async () => {
        try {
          await updateNfcStatus(order.cardCode, 'verified', user.id);
          await updatePrinterJob(job.id, 'nfc_verification', undefined, user.id);
          setVerified(true);
        } catch (err) {
          Alert.alert('Verification failed', (err as Error).message);
        }
      }, 1500);

    } catch (err) {
      if (order?.cardCode) {
        await updateNfcStatus(order.cardCode, 'failed', user.id);
      }
      Alert.alert('Write failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Teal header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
          </Pressable>
          <View style={styles.headerInfo}>
            <AppText style={styles.headerSub}>Job #{String(job?.queueNumber ?? '').slice(-4)}</AppText>
            <AppText style={styles.headerTitle}>NFC Encode</AppText>
          </View>
        </View>
        <StepBar current={2} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Payload card */}
        {order && (
          <View style={styles.payloadCard}>
            <View style={styles.payloadHeader}>
              <AppIcon name="Nfc" size={18} color={TEAL} />
              <AppText style={styles.payloadLabel}>PAYLOAD TO WRITE</AppText>
            </View>
            <AppText style={styles.payloadUrl}>{order.profileUrl}</AppText>
            <AppText style={styles.payloadSub}>Card: {order.cardCode}, read-only after write</AppText>
          </View>
        )}

        {/* NFC tap zone */}
        <View style={[styles.tapZone, written && styles.tapZoneDone]}>
          <AppIcon name="Nfc" size={64} color={verified ? '#2BC48A' : written ? TEAL : '#ccc'} />
          <AppText style={[styles.tapTitle, written && { color: verified ? '#2BC48A' : TEAL }]}>
            {verified ? 'Verified' : written ? 'Written, verifying...' : 'Tap blank NFC card to phone'}
          </AppText>
          {!written && <AppText style={styles.tapSub}>Reader detecting...</AppText>}
          {written && !verified && <AppText style={styles.tapSub}>Reading back chip...</AppText>}
        </View>

        {/* Steps hint */}
        <View style={styles.stepsCard}>
          {['Tap card', 'Show URL', 'Confirm'].map((s, i) => (
            <View key={s} style={styles.stepRow}>
              <View style={styles.stepNum}><AppText style={styles.stepNumText}>{i + 1}</AppText></View>
              <AppText style={styles.stepText}>{s}</AppText>
            </View>
          ))}
        </View>

        {/* Warning */}
        <View style={styles.warningCard}>
          <AppIcon name="ShieldCheck" size={16} color="#FFB343" />
          <AppText style={styles.warningText}>Once locked, chip cannot be rewritten.</AppText>
        </View>

        {/* Write button */}
        <Pressable
          style={[styles.writeBtn, (loading || written) && styles.writeBtnDisabled]}
          disabled={loading || written}
          onPress={handleWrite}
        >
          <AppIcon name="Nfc" size={20} color="#fff" />
          <AppText style={styles.writeBtnText}>
            {verified ? 'Chip Locked' : loading ? 'Writing...' : 'Write & Lock Chip'}
          </AppText>
        </Pressable>

        {/* Go to QA */}
        {verified && (
          <Pressable style={styles.qaBtn}
            onPress={() => router.push({ pathname: '/printer/qa/[jobId]', params: { jobId: job!.id } })}>
            <AppText style={styles.qaBtnText}>Continue to QA Video</AppText>
          </Pressable>
        )}

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: printerTheme.background },
  header: { backgroundColor: TEAL, paddingHorizontal: 20, paddingTop: 8, paddingBottom: 4, borderBottomLeftRadius: 28, borderBottomRightRadius: 28 },
  headerTop: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 4 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerInfo: { gap: 1 },
  headerSub: { color: 'rgba(255,255,255,0.75)', fontSize: 12 },
  headerTitle: { color: theme.colors.textInverse, fontSize: 22, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 120, gap: 14 },
  payloadCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 16, gap: 6, borderLeftWidth: 4, borderLeftColor: TEAL },
  payloadHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  payloadLabel: { fontSize: 10, fontWeight: '700', color: TEAL, textTransform: 'uppercase', letterSpacing: 0.8 },
  payloadUrl: { fontSize: 15, fontWeight: '700', color: TEAL_DARK },
  payloadSub: { fontSize: 11, color: theme.colors.textMuted },
  tapZone: { height: 200, borderRadius: 24, borderWidth: 2, borderColor: printerTheme.soft, borderStyle: 'dashed', alignItems: 'center', justifyContent: 'center', gap: 10, backgroundColor: theme.colors.surface },
  tapZoneDone: { borderStyle: 'solid', borderColor: '#2BC48A', backgroundColor: '#F0FFF8' },
  tapTitle: { fontSize: 16, fontWeight: '700', color: theme.colors.textMuted, textAlign: 'center' },
  tapSub: { fontSize: 12, color: theme.colors.textMuted },
  stepsCard: { backgroundColor: theme.colors.surface, borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-around' },
  stepRow: { alignItems: 'center', gap: 6 },
  stepNum: { width: 26, height: 26, borderRadius: 13, backgroundColor: TEAL, alignItems: 'center', justifyContent: 'center' },
  stepNumText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  stepText: { fontSize: 11, color: printerTheme.text, fontWeight: '500' },
  warningCard: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8E1', borderRadius: 12, padding: 12 },
  warningText: { fontSize: 12, color: '#B8860B', fontWeight: '500', flex: 1 },
  writeBtn: { backgroundColor: TEAL, borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  writeBtnDisabled: { opacity: 0.5 },
  writeBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  qaBtn: { backgroundColor: '#2BC48A', borderRadius: 16, height: 50, alignItems: 'center', justifyContent: 'center' },
  qaBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
