import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { createOrder } from '@/src/services/firestoreService';

export function NewOrderScreen() {
  const { user } = useAuth();
  const [customerName, setCustomerName] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!user) return;
    const value = Number(amount);
    if (!customerName.trim() || !item.trim() || Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid form', 'Please complete all fields with valid data.');
      return;
    }

    setIsSaving(true);
    try {
      await createOrder({
        customerName: customerName.trim(),
        item: item.trim(),
        amount: value,
        createdBy: user.id,
      });
      setCustomerName('');
      setItem('');
      setAmount('');
      Alert.alert('Submitted', 'Order and printer job were created.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to submit order.';
      Alert.alert('Submit failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="h1">New Order Intake</AppText>
      <AppText variant="body" tone="muted">
        Quick order entry for sales staff.
      </AppText>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Customer name" value={customerName} onChangeText={setCustomerName} />
          <AppInput label="Product / Item" value={item} onChangeText={setItem} placeholder="Bio Metal Card" />
          <AppInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="89.00" />
          <AppButton label="Create Order" loading={isSaving} onPress={handleSave} />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.sm,
  },
});

