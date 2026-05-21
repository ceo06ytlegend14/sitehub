import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Body, Caption, H2 } from '@/design-system';
import { FirebaseService } from '@/services/firebaseService';
import { PrinterJob } from '@/types/salesPrinter';

export default function WagesScreen() {
  const [jobs, setJobs] = useState<PrinterJob[]>([]);
  useEffect(() => FirebaseService.subscribePrinterJobs(setJobs), []);

  const completed = jobs.filter((j) => j.stage === 'ready');
  const total = useMemo(() => completed.reduce((sum, j) => sum + (j.wage || 0), 0), [completed]);

  return (
    <View style={styles.screen}>
      <H2>Wages</H2>
      <View style={styles.card}><Caption muted>Total Earned</Caption><Body>${total.toFixed(2)}</Body></View>
      <FlatList
        data={completed}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <View style={styles.card}><Body>{item.orderNumber} • {item.customerName}</Body><Caption muted>${item.wage.toFixed(2)}</Caption></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  card: { borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, padding: 10, marginBottom: 10 },
});
