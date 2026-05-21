import { useMemo, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useOrders } from '@/src/hooks/useOrders';
import { usePrinterJobs } from '@/src/hooks/usePrinterJobs';
import { useRoleFlags } from '@/src/hooks/useRoleFlags';
import { updatePrinterJob } from '@/src/services/firestoreService';

export function OrdersQueueScreen() {
  const { user } = useAuth();
  const { role, isSales, isPrinter, isCustomer } = useRoleFlags();
  const { orders, submitOrder } = useOrders(role, user?.id ?? '');
  const jobs = usePrinterJobs();

  const [customerName, setCustomerName] = useState('');
  const [item, setItem] = useState('');
  const [amount, setAmount] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmitOrder() {
    if (!user) return;
    if (!customerName.trim() || !item.trim() || !amount.trim()) {
      Alert.alert('Missing details', 'Please complete customer, item, and amount.');
      return;
    }

    const value = Number(amount);
    if (Number.isNaN(value) || value <= 0) {
      Alert.alert('Invalid amount', 'Please enter a valid positive amount.');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitOrder({
        customerName: customerName.trim(),
        item: item.trim(),
        amount: value,
        createdBy: user.id,
      });
      setCustomerName('');
      setItem('');
      setAmount('');
      Alert.alert('Order created', 'The printer queue has been updated.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Could not create order.';
      Alert.alert('Create failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  const activeJobs = useMemo(() => jobs.filter((job) => job.stage !== 'done'), [jobs]);

  return (
    <ScreenContainer>
      <View style={styles.titleBlock}>
        <AppText variant="h1">{isPrinter ? 'Printer Queue' : 'Orders'}</AppText>
        <AppText variant="body" tone="muted">
          {isSales
            ? 'Capture new orders and monitor status.'
            : isPrinter
              ? 'Manage queue, NFC programming, and QA pipeline.'
              : 'Customer order visibility for your card workflow.'}
        </AppText>
      </View>

      {isSales ? (
        <AppCard>
          <View style={styles.form}>
            <AppText variant="h2">New Order Intake</AppText>
            <AppInput label="Customer name" value={customerName} onChangeText={setCustomerName} />
            <AppInput label="Item" value={item} onChangeText={setItem} placeholder="Premium NFC Card" />
            <AppInput label="Amount" value={amount} onChangeText={setAmount} keyboardType="decimal-pad" placeholder="89.00" />
            <AppButton label="Submit Order" loading={isSubmitting} onPress={handleSubmitOrder} />
          </View>
        </AppCard>
      ) : null}

      {isPrinter ? (
        <>
          {activeJobs.length === 0 ? (
            <AppCard>
              <AppText variant="h2">Queue is clear</AppText>
              <AppText variant="body" tone="muted">
                No active printer jobs right now.
              </AppText>
            </AppCard>
          ) : (
            activeJobs.map((job) => (
              <AppCard key={job.id}>
                <View style={styles.jobHeader}>
                  <AppText variant="h2">Queue #{String(job.queueNumber).slice(-4)}</AppText>
                  <AppText variant="caption" tone="muted">
                    {job.stage}
                  </AppText>
                </View>
                <AppText variant="caption" tone="muted">
                  Order ID: {job.orderId}
                </AppText>
                <View style={styles.actions}>
                  <AppButton
                    label="NFC Stage"
                    fullWidth={false}
                    style={styles.actionButton}
                    onPress={() => updatePrinterJob(job.id, 'nfc_programming')}
                  />
                  <AppButton
                    label="QA Stage"
                    variant="secondary"
                    fullWidth={false}
                    style={styles.actionButton}
                    onPress={() => updatePrinterJob(job.id, 'qa_capture')}
                  />
                </View>
              </AppCard>
            ))
          )}
        </>
      ) : null}

      {isCustomer ? (
        <AppCard>
          <AppText variant="h2">Customer Queue View</AppText>
          <AppText variant="body" tone="muted">
            Your linked card request appears here once sales submits the order.
          </AppText>
          <AppText variant="caption" tone="muted" style={styles.customerHint}>
            Tip: activate your card from Home before checking queue.
          </AppText>
        </AppCard>
      ) : null}

      {!isPrinter
        ? orders.map((order) => (
            <AppCard key={order.id}>
              <AppText variant="h2">{order.customerName}</AppText>
              <AppText variant="body" tone="muted">
                {order.item}
              </AppText>
              <View style={styles.jobHeader}>
                <AppText variant="caption">RM {order.amount.toFixed(2)}</AppText>
                <AppText variant="caption" tone="muted">
                  {order.status}
                </AppText>
              </View>
            </AppCard>
          ))
        : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  titleBlock: {
    gap: theme.spacing.xs,
  },
  form: {
    gap: theme.spacing.sm,
  },
  jobHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: theme.spacing.xs,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    minHeight: 48,
  },
  customerHint: {
    marginTop: theme.spacing.sm,
  },
});

