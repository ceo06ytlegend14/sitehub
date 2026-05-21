import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Caption, H2 } from '@/design-system';
import { FirebaseService } from '@/services/firebaseService';
import { PrinterJob } from '@/types/salesPrinter';

export default function PrinterQueueScreen() {
  const [jobs, setJobs] = useState<PrinterJob[]>([]);
  const [tab, setTab] = useState<'all' | 'pending' | 'programming'>('all');

  useEffect(() => FirebaseService.subscribePrinterJobs(setJobs), []);

  const filtered = useMemo(() => (tab === 'all' ? jobs : jobs.filter((j) => j.stage === tab)), [jobs, tab]);
  const queueCount = jobs.filter((j) => j.stage !== 'ready').length;
  const readyCount = jobs.filter((j) => j.stage === 'ready').length;

  return (
    <View style={styles.screen}>
      <H2>Printer Job Queue</H2>
      <View style={styles.row}>
        <View style={styles.stat}><Caption muted>Jobs in Queue</Caption><Body>{queueCount}</Body></View>
        <View style={styles.stat}><Caption muted>Ready Count</Caption><Body>{readyCount}</Body></View>
      </View>
      <View style={styles.row}>
        {(['all', 'pending', 'programming'] as const).map((item) => (
          <Pressable key={item} style={[styles.tab, tab === item && styles.tabActive]} onPress={() => setTab(item)}><Body>{item}</Body></Pressable>
        ))}
      </View>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Pressable style={styles.card} onPress={() => router.push({ pathname: '/(printer)/nfc/[jobId]', params: { jobId: item.id } })}>
            <Body>{item.orderNumber} • {item.customerName}</Body>
            <Caption muted>{item.productType} • {item.stage} • wage ${item.wage} • {item.priority}</Caption>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  row: { flexDirection: 'row', gap: 8 },
  stat: { flex: 1, borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, padding: 10, backgroundColor: '#fff4f8' },
  tab: { flex: 1, height: 38, borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  tabActive: { borderColor: '#e91e63', backgroundColor: '#fff1f7' },
  card: { borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, padding: 10, marginBottom: 10 },
});
