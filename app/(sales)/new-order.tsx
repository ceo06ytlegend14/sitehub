import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { Body, Caption, H2 } from '@/design-system';
import { useAuth } from '@/contexts/AuthContext';
import { FirebaseService } from '@/services/firebaseService';
import { PaymentOption, ProductType } from '@/types/salesPrinter';

export default function NewOrderScreen() {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [contact, setContact] = useState('');
  const [productType, setProductType] = useState<ProductType>('wood_card');
  const [paymentOption, setPaymentOption] = useState<PaymentOption>('online_discount');
  const [price, setPrice] = useState('20');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!user || !customerName.trim() || !contact.trim()) {
      Alert.alert('Missing data', 'Customer name and phone/telegram are required.');
      return;
    }
    setLoading(true);
    try {
      const result = await FirebaseService.createSalesOrder({
        customerName: customerName.trim(),
        contact: contact.trim(),
        productType,
        paymentOption,
        price: Number(price),
        salesRepId: user.id,
        salesRepName: user.name,
      });
      Alert.alert('Order created', `${result.orderNumber} saved and added to printer queue.`);
      router.back();
    } catch (error) {
      Alert.alert('Create failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <H2>New Order Intake</H2>
      <TextInput style={styles.input} placeholder="Customer name" value={customerName} onChangeText={setCustomerName} />
      <TextInput style={styles.input} placeholder="Phone / Telegram" value={contact} onChangeText={setContact} />
      <Caption muted>Product Type</Caption>
      <View style={styles.row}>
        <Pressable style={[styles.choice, productType === 'wood_card' && styles.choiceActive]} onPress={() => setProductType('wood_card')}><Body>Wood Card</Body></Pressable>
        <Pressable style={[styles.choice, productType === 'metal_card' && styles.choiceActive]} onPress={() => setProductType('metal_card')}><Body>Metal Card</Body></Pressable>
      </View>
      <Caption muted>Payment Option</Caption>
      <View style={styles.row}>
        <Pressable style={[styles.choice, paymentOption === 'online_discount' && styles.choiceActive]} onPress={() => setPaymentOption('online_discount')}><Body>Online Discount</Body></Pressable>
        <Pressable style={[styles.choice, paymentOption === 'later_manual' && styles.choiceActive]} onPress={() => setPaymentOption('later_manual')}><Body>Later / Manual</Body></Pressable>
      </View>
      <TextInput style={styles.input} placeholder="Price" value={price} onChangeText={setPrice} keyboardType="numeric" />
      <Pressable style={[styles.button, loading && { opacity: 0.6 }]} disabled={loading} onPress={submit}>
        <Body style={styles.buttonText}>{loading ? 'Saving...' : 'Continue'}</Body>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#fff', padding: 16, gap: 10 },
  input: { borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  row: { flexDirection: 'row', gap: 8 },
  choice: { flex: 1, height: 44, borderWidth: 1, borderColor: '#f0d7e3', borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  choiceActive: { borderColor: '#e91e63', backgroundColor: '#fff1f7' },
  button: { height: 48, borderRadius: 12, backgroundColor: '#e91e63', alignItems: 'center', justifyContent: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600' },
});
