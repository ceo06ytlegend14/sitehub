import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Body, Caption, H2 } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseService } from '@/services/firebaseService';
import { PrinterJob } from '@/types/salesPrinter';

export default function NfcProgrammingScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<PrinterJob | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return FirebaseService.subscribePrinterJobs((jobs) => {
      const found = jobs.find((j) => j.id === jobId);
      if (found) setJob(found);
    });
  }, [jobId]);

  const writeAndLock = async () => {
    if (!user || !job) return;
    setLoading(true);
    try {
      await FirebaseService.lockJobChip(job.id, user.id);
      Alert.alert('Success', 'Chip locked and cannot be rewritten.');
      router.push({ pathname: '/(printer)/qa/[jobId]', params: { jobId: job.id } });
    } catch (error) {
      Alert.alert('Write error', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <Caption muted>Print → Encode → QA Video</Caption>
      <H2>NFC Programming</H2>
      <Body>Job: {job?.orderNumber || 'Loading...'}</Body>
      <View style={styles.tapArea}><Body>NFC Tap Area</Body></View>
      {job?.nfcLocked && <Caption muted>Chip is already locked.</Caption>}
      <Pressable disabled={loading || !!job?.nfcLocked} style={[styles.button, (loading || job?.nfcLocked) && { opacity: 0.6 }]} onPress={writeAndLock}>
        <Body style={styles.buttonText}>{loading ? 'Writing...' : 'Write & Lock Chip'}</Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  tapArea: { height: 220, borderRadius: 18, borderWidth: 2, borderColor: '#f3c3d8', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff4f8' },
  button: { height: 48, borderRadius: 12, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
