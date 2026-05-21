import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Body, Caption, H2 } from '@/design-system';
import { FirebaseService } from '@/services/firebaseService';
import { useAuth } from '@/contexts/AuthContext';
import { PrinterJob } from '@/types/salesPrinter';

export default function QaVideoCaptureScreen() {
  const { jobId } = useLocalSearchParams<{ jobId: string }>();
  const { user } = useAuth();
  const [job, setJob] = useState<PrinterJob | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    return FirebaseService.subscribePrinterJobs((jobs) => {
      const found = jobs.find((j) => j.id === jobId);
      if (found) setJob(found);
    });
  }, [jobId]);

  const recordAndSave = async () => {
    if (!user || !job) return;
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission required', 'Camera permission is required.');
      return;
    }
    const res = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 30,
      quality: 0.6,
    });
    if (res.canceled || !res.assets?.[0]?.uri) return;

    setSaving(true);
    try {
      await FirebaseService.uploadQaVideo(job.id, job.orderId, res.assets[0].uri, user.id);
      Alert.alert('Saved', 'QA video proof saved and order marked completed.');
    } catch (error) {
      Alert.alert('Upload failed', (error as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.screen}>
      <H2>QA Video Capture</H2>
      <Caption muted>Steps: tap card, show URL, confirm</Caption>
      <View style={styles.frameGuide}><Body>Frame guide for card</Body></View>
      <Pressable style={[styles.button, saving && { opacity: 0.6 }]} disabled={saving} onPress={recordAndSave}>
        <Body style={styles.buttonText}>{saving ? 'Saving...' : 'Record Proof Video'}</Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  frameGuide: { height: 280, borderRadius: 16, borderWidth: 2, borderColor: '#f3c3d8', backgroundColor: '#fff4f8', alignItems: 'center', justifyContent: 'center' },
  button: { height: 56, borderRadius: 28, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center' },
  buttonText: { color: '#fff', fontWeight: '600' },
});
