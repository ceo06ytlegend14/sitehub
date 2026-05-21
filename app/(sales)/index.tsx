import React, { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { Body, H1, H2, Caption, colors } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseService } from '@/services/firebaseService';
import { SalesOrder } from '@/types/salesPrinter';

export default function SalesDashboardScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const unsub = FirebaseService.subscribeSalesOrders(user.id, (items) => {
      setOrders(items);
      setLoading(false);
    });
    return unsub;
  }, [user]);

  const todayRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.price || 0), 0), [orders]);
  const pendingCommission = useMemo(() => orders.filter((o) => !o.commissionUnlocked).reduce((sum, o) => sum + (o.commissionAmount || 0), 0), [orders]);

  return (
    <View style={styles.screen}>
      <H1>Hi {user?.name || 'Sales Rep'}</H1>
      <View style={styles.row}>
        <View style={styles.card}><Caption muted>Today Revenue</Caption><H2>${todayRevenue.toFixed(2)}</H2></View>
        <View style={styles.card}><Caption muted>Pending Commission</Caption><H2>${pendingCommission.toFixed(2)}</H2></View>
      </View>
      <Pressable style={styles.button} onPress={() => router.push({ pathname: '/(sales)/new-order' })}>
        <Body style={styles.buttonText}>New Order</Body>
      </Pressable>
      <H2>Pipeline</H2>
      {loading ? <ActivityIndicator color={colors.primary} /> : (
        <FlatList
          data={orders}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.itemCard}>
              <Body>{item.orderNumber} • {item.customerName}</Body>
              <Caption muted>{item.productType} • {item.status} • ${item.price.toFixed(2)}</Caption>
            </View>
          )}
          ListEmptyComponent={<Caption muted>No orders yet.</Caption>}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 12 },
  row: { flexDirection: 'row', gap: 10 },
  card: { flex: 1, backgroundColor: '#fff4f8', borderColor: '#f7d4e4', borderWidth: 1, borderRadius: 14, padding: 12 },
  button: { backgroundColor: '#e91e63', borderRadius: 14, alignItems: 'center', justifyContent: 'center', height: 48 },
  buttonText: { color: '#fff', fontWeight: '600' },
  itemCard: { borderRadius: 12, borderWidth: 1, borderColor: '#f0d7e3', padding: 10, backgroundColor: '#fff' },
});
