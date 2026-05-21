import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { Body, Caption, H2 } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseService } from '@/services/firebaseService';
import { PayoutSummary } from '@/types/salesPrinter';

export default function MyPayoutsScreen() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PayoutSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (!user) return;
      const data = await FirebaseService.getSalesPayoutSummary(user.id);
      setSummary(data);
      setLoading(false);
    })();
  }, [user]);

  if (loading) return <View style={styles.center}><ActivityIndicator /></View>;

  return (
    <View style={styles.screen}>
      <H2>My Payouts</H2>
      <View style={styles.card}><Caption muted>Total Commission</Caption><Body>${summary?.totalCommission.toFixed(2)}</Body></View>
      <View style={styles.card}><Caption muted>Pending Manager Approval</Caption><Body>${summary?.pendingApproval.toFixed(2)}</Body></View>
      <View style={styles.card}><Caption muted>Paid Out</Caption><Body>${summary?.paidOut.toFixed(2)}</Body></View>
      <H2>Recent Unlocked</H2>
      <FlatList
        data={summary?.recentUnlockedOrders || []}
        keyExtractor={(item) => item.orderId}
        renderItem={({ item }) => <View style={styles.card}><Body>{item.customerName}</Body><Caption muted>${item.commissionAmount.toFixed(2)}</Caption></View>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  card: { borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, padding: 10 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
