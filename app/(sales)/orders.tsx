import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, View } from 'react-native';
import { Body, Caption, H2 } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseService } from '@/services/firebaseService';
import { SalesOrder } from '@/types/salesPrinter';

export default function SalesOrdersScreen() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<SalesOrder[]>([]);

  useEffect(() => {
    if (!user) return;
    return FirebaseService.subscribeSalesOrders(user.id, setOrders);
  }, [user]);

  return (
    <View style={styles.screen}>
      <H2>Orders</H2>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Body>{item.orderNumber} • {item.customerName}</Body>
            <Caption muted>{item.productType} • {item.paymentOption} • {item.status}</Caption>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16 },
  card: { borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, padding: 10, marginBottom: 10 },
});
