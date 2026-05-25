import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { productTypeOptions, paymentMethodOptions } from '@/src/constants/options';
import { useAuth } from '@/src/hooks/useAuth';
import { createOrder } from '@/src/services/firestoreService';
import { getAuthErrorMessage } from '@/src/services/authService';

const PINK = '#E91E8C';
const PINK_BG = '#FFF0F8';

type ProductValue = typeof productTypeOptions[number]['value'];
type PaymentValue = typeof paymentMethodOptions[number]['value'];
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';

const PRIORITY_OPTIONS = [
  { label: 'Low',    value: 'low'    as Priority, color: '#6E8A95' },
  { label: 'Normal', value: 'normal' as Priority, color: '#00A4A6' },
  { label: 'High',   value: 'high'   as Priority, color: '#FFB343' },
  { label: 'Urgent', value: 'urgent' as Priority, color: '#E74C3C' },
];

const PAYMENT_STATUS_OPTIONS = [
  { label: 'Unpaid',  value: 'unpaid'  as PaymentStatus, color: '#E74C3C' },
  { label: 'Partial', value: 'partial' as PaymentStatus, color: '#FFB343' },
  { label: 'Paid',    value: 'paid'    as PaymentStatus, color: '#2BC48A' },
];

// Card gradients for each product type
const CARD_GRADIENTS: Record<string, [string, string]> = {
  wood_card:  ['#8B5E3C', '#5C3D1E'],
  metal_card: ['#6B7280', '#374151'],
  pvc_card:   ['#1E3A5F', '#0F1F3D'],
};

// ─── Bank Card Component ──────────────────────────────────────────────────────
function BankCard({ product, selected, onPress }: {
  product: typeof productTypeOptions[number];
  selected: boolean;
  onPress: () => void;
}) {
  const [g1, g2] = CARD_GRADIENTS[product.value] ?? ['#333', '#111'];
  return (
    <Pressable onPress={onPress} style={[card.wrap, selected && card.wrapSelected]}>
      <LinearGradient colors={[g1, g2]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={card.gradient}>
        {/* Chip */}
        <View style={card.chip}>
          <View style={card.chipLine} />
          <View style={card.chipLine} />
        </View>
        {/* NFC symbol */}
        <AppText style={card.nfc}>))))</AppText>
        {/* Product name */}
        <AppText style={card.name}>{product.label}</AppText>
        <AppText style={card.price}>${product.price}</AppText>
        {/* Dots */}
        <View style={card.dots}>
          {[0,1,2,3].map(i => <View key={i} style={card.dot} />)}
          <AppText style={card.dotsText}>SITEHUB</AppText>
        </View>
      </LinearGradient>
      {selected && (
        <View style={card.checkBadge}>
          <AppIcon name="ShieldCheck" size={14} color="#fff" />
        </View>
      )}
    </Pressable>
  );
}

const card = StyleSheet.create({
  wrap: { flex: 1, borderRadius: 16, overflow: 'visible', borderWidth: 2, borderColor: 'transparent' },
  wrapSelected: { borderColor: PINK },
  gradient: { borderRadius: 14, padding: 14, height: 120, justifyContent: 'space-between' },
  chip: { width: 28, height: 20, backgroundColor: '#FFD700', borderRadius: 4, justifyContent: 'space-around', padding: 3 },
  chipLine: { height: 2, backgroundColor: '#B8860B', borderRadius: 1 },
  nfc: { position: 'absolute', top: 12, right: 12, color: 'rgba(255,255,255,0.5)', fontSize: 12, letterSpacing: -2 },
  name: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0.5, marginTop: 4 },
  price: { color: 'rgba(255,255,255,0.9)', fontSize: 18, fontWeight: '700' },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  dot: { width: 5, height: 5, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.5)' },
  dotsText: { color: 'rgba(255,255,255,0.6)', fontSize: 8, fontWeight: '700', marginLeft: 4, letterSpacing: 1 },
  checkBadge: { position: 'absolute', top: -6, right: -6, width: 22, height: 22, borderRadius: 11, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center' },
});

// ─── Helpers ──────────────────────────────────────────────────────────────────
function Field({ label, required, hint, children }: { label: string; required?: boolean; hint?: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 5 }}>
      <AppText style={styles.fieldLabel}>{label}{required ? <AppText style={{ color: '#E74C3C' }}> *</AppText> : null}</AppText>
      {children}
      {hint ? <AppText style={styles.fieldHint}>{hint}</AppText> : null}
    </View>
  );
}

function PillPicker<T extends string>({ options, value, onChange }: {
  options: { label: string; value: T; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map(opt => (
        <Pressable key={opt.value}
          style={[styles.pill, value === opt.value && { backgroundColor: opt.color ?? PINK, borderColor: opt.color ?? PINK }]}
          onPress={() => onChange(opt.value)}>
          <AppText style={[styles.pillText, value === opt.value && { color: '#fff' }]}>{opt.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

// ─── Step indicator ───────────────────────────────────────────────────────────
function StepIndicator({ step, total }: { step: number; total: number }) {
  const labels = ['Customer', 'Product', 'Payment'];
  return (
    <View style={styles.stepWrap}>
      {labels.map((label, i) => {
        const n = i + 1;
        const done = n < step;
        const active = n === step;
        return (
          <View key={label} style={styles.stepItem}>
            <View style={[styles.stepCircle, done && styles.stepDone, active && styles.stepActive]}>
              <AppText style={[styles.stepNum, (done || active) && { color: done ? '#2BC48A' : '#fff' }]}>
                {done ? '✓' : String(n)}
              </AppText>
            </View>
            <AppText style={[styles.stepLabel, active && styles.stepLabelActive]}>{label}</AppText>
            {i < total - 1 && <View style={[styles.stepLine, done && styles.stepLineDone]} />}
          </View>
        );
      })}
    </View>
  );
}

// ─── Success screen ───────────────────────────────────────────────────────────
function SuccessScreen({ orderId, onNewOrder, onViewOrders }: {
  orderId: string;
  onNewOrder: () => void;
  onViewOrders: () => void;
}) {
  return (
    <SafeAreaView style={[styles.safe, { justifyContent: 'center', alignItems: 'center', padding: 32 }]}>
      <View style={styles.successIcon}>
        <AppIcon name="ShieldCheck" size={48} color="#2BC48A" />
      </View>
      <AppText style={styles.successTitle}>Order Created!</AppText>
      <AppText style={styles.successSub}>#{orderId.slice(0, 8).toUpperCase()} has been pushed to the printer queue.</AppText>
      <View style={{ gap: 12, width: '100%', marginTop: 32 }}>
        <Pressable style={styles.submitBtn} onPress={onViewOrders}>
          <AppIcon name="ClipboardList" size={18} color="#fff" />
          <AppText style={styles.submitBtnText}>View My Orders</AppText>
        </Pressable>
        <Pressable style={styles.draftBtn} onPress={onNewOrder}>
          <AppText style={styles.draftBtnText}>+ Create Another Order</AppText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

// ─── Main screen ─────────────────────────────────────────────────────────────
export function NewOrderScreen() {
  const { user } = useAuth();
  const [step, setStep] = useState(1);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);

  // Step 1
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Step 2
  const [product, setProduct] = useState<ProductValue>('wood_card');
  const [quantity, setQuantity] = useState('1');
  const [priority, setPriority] = useState<Priority>('normal');
  const [nfcWrite, setNfcWrite] = useState(true);
  const [qrPrinted, setQrPrinted] = useState(false);

  // Step 3
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentValue>('online');
  const [deposit, setDeposit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedProduct = productTypeOptions.find(p => p.value === product)!;
  const qty = Math.max(1, parseInt(quantity) || 1);
  const total = selectedProduct.price * qty;

  function resetForm() {
    setStep(1); setCreatedOrderId(null);
    setCustomerName(''); setPhone(''); setTelegram(''); setEmail('');
    setCompany(''); setJobTitle(''); setProduct('wood_card'); setQuantity('1');
    setPriority('normal'); setNfcWrite(true); setQrPrinted(false);
    setPaymentStatus('unpaid'); setPaymentMethod('online');
    setDeposit(''); setDueDate(''); setDeliveryAddress(''); setNotes('');
  }

  function validate() {
    if (step === 1) {
      if (!customerName.trim()) { Alert.alert('Required', 'Customer name is required.'); return false; }
      if (!phone.trim() && !telegram.trim()) { Alert.alert('Required', 'Phone or Telegram is required.'); return false; }
    }
    return true;
  }

  async function handleSubmit() {
    if (!user || user.isGuest) { Alert.alert('Sign in required', 'Please sign in as sales staff.'); return; }
    setSaving(true);
    try {
      const orderId = await createOrder({
        customerName: customerName.trim(),
        phone: phone.trim(),
        telegram: telegram.trim() || undefined,
        email: email.trim() || undefined,
        company: company.trim() || undefined,
        jobTitle: jobTitle.trim() || undefined,
        deliveryAddress: deliveryAddress.trim() || undefined,
        productType: product,
        quantity: qty,
        cardDesign: 'classic_black',
        paymentStatus,
        paymentMethod,
        priority: priority === 'urgent' ? 'urgent' : 'standard',
        notes: notes.trim() || undefined,
        assignedSalesman: user.id,
        createdBy: user.id,
      });
      setCreatedOrderId(orderId);
    } catch (err) {
      Alert.alert('Failed', getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  // Show success screen
  if (createdOrderId) {
    return (
      <SuccessScreen
        orderId={createdOrderId}
        onNewOrder={resetForm}
        onViewOrders={() => router.replace('/sales/orders')}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => step > 1 ? setStep(s => s - 1) : router.back()} style={styles.backBtn} hitSlop={12}>
          <AppText style={styles.backBtnText}>‹</AppText>
        </Pressable>
        <AppText style={styles.headerTitle}>New Order</AppText>
        <AppText style={styles.stepCounter}>{step}/3</AppText>
      </View>

      <StepIndicator step={step} total={3} />

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">

        {step === 1 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="User" size={18} color={PINK} />
              <AppText style={styles.sectionTitle}>Customer Information</AppText>
            </View>
            <Field label="Customer Name" required>
              <TextInput style={styles.input} value={customerName} onChangeText={setCustomerName} placeholder="Full name of client" placeholderTextColor="#ccc" autoCapitalize="words" />
            </Field>
            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Phone" required>
                  <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="012 345 678" placeholderTextColor="#ccc" keyboardType="phone-pad" />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Telegram">
                  <TextInput style={styles.input} value={telegram} onChangeText={setTelegram} placeholder="@username" placeholderTextColor="#ccc" autoCapitalize="none" />
                </Field>
              </View>
            </View>
            <Field label="Email">
              <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="client@example.com" placeholderTextColor="#ccc" keyboardType="email-address" autoCapitalize="none" />
            </Field>
            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Company">
                  <TextInput style={styles.input} value={company} onChangeText={setCompany} placeholder="Acme Corp" placeholderTextColor="#ccc" />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Job Title">
                  <TextInput style={styles.input} value={jobTitle} onChangeText={setJobTitle} placeholder="Manager" placeholderTextColor="#ccc" />
                </Field>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="CreditCard" size={18} color={PINK} />
              <AppText style={styles.sectionTitle}>Product Details</AppText>
            </View>
            <Field label="Card Type" required>
              <View style={styles.cardGrid}>
                {productTypeOptions.map(opt => (
                  <BankCard key={opt.value} product={opt} selected={product === opt.value} onPress={() => setProduct(opt.value)} />
                ))}
              </View>
            </Field>
            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Quantity" required>
                  <View style={styles.qtyRow}>
                    <Pressable style={styles.qtyBtn} onPress={() => setQuantity(q => String(Math.max(1, (parseInt(q)||1)-1)))}>
                      <AppText style={styles.qtyBtnText}>−</AppText>
                    </Pressable>
                    <TextInput style={styles.qtyInput} value={quantity} onChangeText={setQuantity} keyboardType="number-pad" textAlign="center" />
                    <Pressable style={styles.qtyBtn} onPress={() => setQuantity(q => String((parseInt(q)||1)+1))}>
                      <AppText style={styles.qtyBtnText}>+</AppText>
                    </Pressable>
                  </View>
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Total">
                  <View style={styles.totalBox}>
                    <AppText style={styles.totalAmount}>${total}</AppText>
                  </View>
                </Field>
              </View>
            </View>
            <Field label="Priority" required>
              <PillPicker options={PRIORITY_OPTIONS} value={priority} onChange={setPriority} />
            </Field>
            <View style={styles.toggleRow}>
              <View style={styles.toggleItem}>
                <AppIcon name="Nfc" size={16} color={PINK} />
                <AppText style={styles.toggleLabel}>NFC Write</AppText>
                <Switch value={nfcWrite} onValueChange={setNfcWrite} trackColor={{ false: '#ddd', true: PINK }} thumbColor="#fff" />
              </View>
              <View style={styles.toggleItem}>
                <AppIcon name="QrCode" size={16} color={PINK} />
                <AppText style={styles.toggleLabel}>QR Printed</AppText>
                <Switch value={qrPrinted} onValueChange={setQrPrinted} trackColor={{ false: '#ddd', true: PINK }} thumbColor="#fff" />
              </View>
            </View>
          </View>
        )}

        {step === 3 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <AppIcon name="Wallet" size={18} color={PINK} />
              <AppText style={styles.sectionTitle}>Payment & Delivery</AppText>
            </View>
            <Field label="Payment Status" required>
              <PillPicker options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} />
            </Field>
            <Field label="Payment Method">
              <PillPicker options={paymentMethodOptions.map(o => ({ ...o }))} value={paymentMethod} onChange={setPaymentMethod} />
            </Field>
            <View style={styles.row}>
              <View style={styles.half}>
                <Field label="Deposit ($)">
                  <TextInput style={styles.input} value={deposit} onChangeText={setDeposit} placeholder="0.00" placeholderTextColor="#ccc" keyboardType="decimal-pad" />
                </Field>
              </View>
              <View style={styles.half}>
                <Field label="Due Date">
                  <TextInput style={styles.input} value={dueDate} onChangeText={setDueDate} placeholder="YYYY-MM-DD" placeholderTextColor="#ccc" />
                </Field>
              </View>
            </View>
            <Field label="Delivery Address">
              <TextInput style={styles.inputMulti} value={deliveryAddress} onChangeText={setDeliveryAddress} placeholder="Street, Building, Floor..." placeholderTextColor="#ccc" multiline numberOfLines={2} />
            </Field>
            <Field label="Notes">
              <TextInput style={styles.inputMulti} value={notes} onChangeText={setNotes} placeholder="Special instructions..." placeholderTextColor="#ccc" multiline numberOfLines={3} />
            </Field>
            {/* Summary */}
            <View style={styles.summaryCard}>
              <AppText style={styles.summaryTitle}>Order Summary</AppText>
              {[
                ['Customer', customerName],
                ['Contact', phone || telegram],
                ['Product', `${selectedProduct.label} × ${qty}`],
                ['Priority', priority],
                ['Payment', paymentStatus],
                ['Total', `$${total}`],
              ].map(([k, v]) => (
                <View key={k} style={styles.summaryRow}>
                  <AppText style={styles.summaryKey}>{k}</AppText>
                  <AppText style={[styles.summaryVal, k === 'Total' && { color: PINK, fontWeight: '700' }]}>{v}</AppText>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {step < 3 ? (
          <Pressable style={styles.submitBtn} onPress={() => { if (validate()) setStep(s => s + 1); }}>
            <AppText style={styles.submitBtnText}>Continue →</AppText>
          </Pressable>
        ) : (
          <View style={styles.footerRow}>
            <Pressable style={styles.draftBtn} onPress={() => router.back()}>
              <AppText style={styles.draftBtnText}>Cancel</AppText>
            </Pressable>
            <Pressable style={[styles.submitBtn, { flex: 2 }, saving && { opacity: 0.6 }]} disabled={saving} onPress={handleSubmit}>
              <AppIcon name="ShieldCheck" size={18} color="#fff" />
              <AppText style={styles.submitBtnText}>{saving ? 'Submitting…' : 'Submit Order'}</AppText>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: PINK_BG },
  header: { backgroundColor: PINK, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14 },
  backBtn: { width: 40, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  backBtnText: { color: '#fff', fontSize: 24, fontWeight: '700', lineHeight: 28 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  stepCounter: { color: 'rgba(255,255,255,0.8)', fontSize: 14, fontWeight: '600' },
  // Step indicator
  stepWrap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 20, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F0C0DC' },
  stepItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  stepCircle: { width: 26, height: 26, borderRadius: 13, borderWidth: 2, borderColor: '#F0C0DC', alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  stepActive: { borderColor: PINK, backgroundColor: PINK },
  stepDone: { borderColor: '#2BC48A', backgroundColor: '#EDFAF4' },
  stepNum: { fontSize: 11, fontWeight: '700', color: '#ccc' },
  stepLabel: { fontSize: 11, color: '#aaa', fontWeight: '500' },
  stepLabelActive: { color: PINK, fontWeight: '700' },
  stepLine: { width: 24, height: 2, backgroundColor: '#F0C0DC', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#2BC48A' },
  // Content
  scroll: { padding: 16, paddingBottom: 120, gap: 16 },
  section: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 14, shadowColor: PINK, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingBottom: 10, borderBottomWidth: 1, borderBottomColor: '#F5E0EE' },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#1A0A12' },
  fieldLabel: { fontSize: 11, fontWeight: '600', color: '#888', textTransform: 'uppercase', letterSpacing: 0.5 },
  fieldHint: { fontSize: 11, color: PINK },
  input: { backgroundColor: '#FFF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#F0C0DC', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#1A0A12' },
  inputMulti: { backgroundColor: '#FFF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#F0C0DC', paddingHorizontal: 14, paddingTop: 12, minHeight: 80, fontSize: 15, color: '#1A0A12', textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  pill: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, borderColor: '#F0C0DC', backgroundColor: '#fff' },
  pillText: { fontSize: 13, fontWeight: '600', color: '#555' },
  cardGrid: { flexDirection: 'row', gap: 10 },
  qtyRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: PINK, alignItems: 'center', justifyContent: 'center' },
  qtyBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  qtyInput: { flex: 1, backgroundColor: '#FFF8FC', borderRadius: 12, borderWidth: 1, borderColor: '#F0C0DC', height: 48, fontSize: 18, fontWeight: '700', color: '#1A0A12' },
  totalBox: { backgroundColor: '#FFF0F8', borderRadius: 12, borderWidth: 1, borderColor: '#F0C0DC', height: 48, alignItems: 'center', justifyContent: 'center' },
  totalAmount: { fontSize: 20, fontWeight: '700', color: PINK },
  toggleRow: { flexDirection: 'row', gap: 10 },
  toggleItem: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: '#FFF8FC', borderRadius: 12, padding: 12, borderWidth: 1, borderColor: '#F0C0DC' },
  toggleLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#555' },
  summaryCard: { backgroundColor: '#FFF0F8', borderRadius: 14, padding: 14, gap: 8, borderWidth: 1, borderColor: '#F0C0DC' },
  summaryTitle: { fontSize: 13, fontWeight: '700', color: '#1A0A12', marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  summaryKey: { fontSize: 12, color: '#888', textTransform: 'capitalize' },
  summaryVal: { fontSize: 12, fontWeight: '600', color: '#1A0A12' },
  footer: { padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#F0C0DC' },
  footerRow: { flexDirection: 'row', gap: 10 },
  submitBtn: { backgroundColor: PINK, borderRadius: 16, height: 54, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  draftBtn: { flex: 1, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: PINK, backgroundColor: '#fff' },
  draftBtnText: { color: PINK, fontSize: 15, fontWeight: '700' },
  // Success
  successIcon: { width: 96, height: 96, borderRadius: 48, backgroundColor: '#EDFAF4', alignItems: 'center', justifyContent: 'center', marginBottom: 16 },
  successTitle: { fontSize: 26, fontWeight: '700', color: '#1A0A12', marginBottom: 8 },
  successSub: { fontSize: 14, color: '#888', textAlign: 'center', lineHeight: 22 },
});
