import { ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  ImageBackground,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon, AppIconName } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { AuthGate } from '@/src/components/AuthGate';
import {
  cardDesignOptions,
  orderCardStatusOptions,
  orderStatusOptions,
  paymentMethodOptions,
  paymentStatusColors,
  paymentStatusOptions,
  priorityOptions,
  productTypeOptions,
} from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import {
  closeOrderCard,
  freezeOrderCard,
  getOrder,
  reopenOrderCard,
  unfreezeOrderCard,
  updateOrderDetails,
} from '@/src/services/firestoreService';
import { getAuthErrorMessage } from '@/src/services/authService';
import { CardDesign, Order, PaymentStatus } from '@/src/types/models';

const salesTheme = theme.roles.sales;
const PINK = salesTheme.primary;
const MUTED = theme.colors.textMuted;
const BORDER = theme.colors.border;
const SURFACE = theme.colors.surface;

type EditableForm = {
  customerName: string;
  phone: string;
  telegram: string;
  whatsapp: string;
  email: string;
  company: string;
  jobTitle: string;
  deliveryAddress: string;
  productType: string;
  quantity: string;
  cardDesign: CardDesign;
  nfcEnabled: boolean;
  nfcTargetUrl: string;
  qrPrinted: boolean;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  depositAmount: string;
  dueDate: string;
  priority: 'standard' | 'urgent';
  notes: string;
  freezeReason: string;
};

function formFromOrder(order: Order): EditableForm {
  return {
    customerName: order.customerName ?? '',
    phone: order.phone ?? '',
    telegram: order.telegram ?? '',
    whatsapp: order.whatsapp ?? '',
    email: order.email ?? '',
    company: order.company ?? '',
    jobTitle: order.jobTitle ?? '',
    deliveryAddress: order.deliveryAddress ?? '',
    productType: order.productType || productTypeOptions[0].value,
    quantity: String(order.quantity || 1),
    cardDesign: order.cardDesign ?? 'classic_black',
    nfcEnabled: order.nfcEnabled !== false,
    nfcTargetUrl: order.nfcTargetUrl ?? '',
    qrPrinted: order.qrPrinted === true,
    paymentStatus: order.paymentStatus ?? 'unpaid',
    paymentMethod: order.paymentMethod ?? paymentMethodOptions[0].value,
    depositAmount: order.depositAmount !== undefined ? String(order.depositAmount) : '',
    dueDate: order.dueDate ?? '',
    priority: order.priority ?? 'standard',
    notes: order.notes ?? '',
    freezeReason: order.freezeReason ?? '',
  };
}

function formatDate(value?: string) {
  if (!value) return 'Not set';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

function getProduct(orderOrForm: Pick<Order, 'productType' | 'quantity'> | EditableForm) {
  const productType = 'productType' in orderOrForm ? orderOrForm.productType : productTypeOptions[0].value;
  return productTypeOptions.find((item) => item.value === productType) ?? productTypeOptions[0];
}

function getOrderTotal(orderOrForm: Pick<Order, 'productType' | 'quantity'> | EditableForm) {
  const product = getProduct(orderOrForm);
  const quantity = typeof orderOrForm.quantity === 'string'
    ? Math.max(1, Number.parseInt(orderOrForm.quantity, 10) || 1)
    : orderOrForm.quantity;
  return product.price * quantity;
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'url';
  multiline?: boolean;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" tone="muted" weight="bold" style={styles.label}>{label}</AppText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#C097AD"
        keyboardType={keyboardType}
        multiline={multiline}
        style={[styles.input, multiline && styles.textArea]}
      />
    </View>
  );
}

function PillGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { label: string; value: T; color?: string; price?: number }[];
  onChange: (value: T) => void;
}) {
  return (
    <View style={styles.field}>
      <AppText variant="caption" tone="muted" weight="bold" style={styles.label}>{label}</AppText>
      <View style={styles.pillRow}>
        {options.map((option) => {
          const selected = value === option.value;
          return (
            <Pressable
              key={option.value}
              style={[
                styles.pill,
                selected && {
                  backgroundColor: option.color ?? PINK,
                  borderColor: option.color ?? PINK,
                },
              ]}
              onPress={() => onChange(option.value)}
            >
              <AppText variant="caption" weight="bold" style={[styles.pillText, selected && styles.pillTextSelected]}>
                {option.label}{option.price ? ` $${option.price}` : ''}
              </AppText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function ToggleRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <Pressable style={styles.toggleRow} onPress={() => onChange(!value)}>
      <AppText variant="body" weight="semibold" style={styles.toggleLabel}>{label}</AppText>
      <View style={[styles.switchTrack, value && styles.switchTrackOn]}>
        <View style={[styles.switchThumb, value && styles.switchThumbOn]} />
      </View>
    </Pressable>
  );
}

function Section({ title, icon, children }: { title: string; icon: AppIconName; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionIcon}>
          <AppIcon name={icon} color={PINK} />
        </View>
        <AppText variant="h2" weight="bold" style={styles.sectionTitle}>{title}</AppText>
      </View>
      {children}
    </View>
  );
}

function DetailContent() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{ orderId?: string }>();
  const orderId = typeof params.orderId === 'string' ? params.orderId : '';
  const [order, setOrder] = useState<Order | null>(null);
  const [form, setForm] = useState<EditableForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      setMessage('Missing order ID.');
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      const next = await getOrder(orderId);
      setOrder(next);
      setForm(next ? formFromOrder(next) : null);
      if (!next) setMessage('Order not found.');
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  useEffect(() => {
    load();
  }, [load]);

  const product = form ? getProduct(form) : productTypeOptions[0];
  const total = form ? getOrderTotal(form) : 0;
  const cardStatus = order?.cardStatus ?? 'active';
  const cardStatusOpt = orderCardStatusOptions.find((item) => item.value === cardStatus) ?? orderCardStatusOptions[0];
  const workflowOpt = orderStatusOptions.find((item) => item.value === order?.status);
  const payColor = form ? paymentStatusColors[form.paymentStatus] : '#999';

  const setField = <K extends keyof EditableForm>(key: K, value: EditableForm[K]) => {
    setForm((current) => (current ? { ...current, [key]: value } : current));
  };

  async function handleSave() {
    if (!order || !form) return;
    if (!form.customerName.trim()) {
      Alert.alert('Required', 'Customer name is required.');
      return;
    }
    if (!form.phone.trim() && !form.telegram.trim()) {
      Alert.alert('Required', 'Add at least one contact: phone or Telegram.');
      return;
    }

    const quantity = Number.parseInt(form.quantity, 10);
    const depositAmount = form.depositAmount.trim() ? Number(form.depositAmount) : 0;

    setSaving(true);
    setMessage(null);
    try {
      await updateOrderDetails(order.id, {
        customerName: form.customerName,
        phone: form.phone,
        telegram: form.telegram,
        whatsapp: form.whatsapp,
        email: form.email,
        company: form.company,
        jobTitle: form.jobTitle,
        deliveryAddress: form.deliveryAddress,
        productType: form.productType,
        quantity,
        cardDesign: form.cardDesign,
        nfcEnabled: form.nfcEnabled,
        nfcTargetUrl: form.nfcTargetUrl,
        qrPrinted: form.qrPrinted,
        paymentStatus: form.paymentStatus,
        paymentMethod: form.paymentMethod,
        depositAmount,
        dueDate: form.dueDate,
        priority: form.priority,
        notes: form.notes,
      }, user?.id);
      setMessage('Order updated.');
      await load();
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  async function handleFreezeToggle() {
    if (!order || !form) return;
    const frozen = cardStatus === 'frozen';
    setSaving(true);
    setMessage(null);
    try {
      if (frozen) {
        await unfreezeOrderCard(order.id, user?.id);
        setMessage('Card unfrozen.');
      } else {
        await freezeOrderCard(order.id, form.freezeReason, user?.id);
        setMessage('Card frozen.');
      }
      await load();
    } catch (error) {
      setMessage(getAuthErrorMessage(error));
    } finally {
      setSaving(false);
    }
  }

  function handleCloseToggle() {
    if (!order) return;
    const closed = cardStatus === 'closed';
    Alert.alert(
      closed ? 'Reopen card?' : 'Close card?',
      closed
        ? 'This will move the card back to active management.'
        : 'This hides the card from the active pipeline. You can reopen it later.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: closed ? 'Reopen' : 'Close',
          style: closed ? 'default' : 'destructive',
          onPress: async () => {
            setSaving(true);
            setMessage(null);
            try {
              if (closed) {
                await reopenOrderCard(order.id, user?.id);
                setMessage('Card reopened.');
              } else {
                await closeOrderCard(order.id, user?.id);
                setMessage('Card closed.');
              }
              await load();
            } catch (error) {
              setMessage(getAuthErrorMessage(error));
            } finally {
              setSaving(false);
            }
          },
        },
      ]
    );
  }

  const summaryRows = useMemo(() => {
    if (!order || !form) return [];
    return [
      ['Workflow', workflowOpt?.label ?? order.status],
      ['Card', cardStatusOpt.label],
      ['Product', `${product.label} x ${form.quantity || 1}`],
      ['Total', `$${total}`],
      ['Card code', order.cardCode || 'Pending'],
      ['Created', formatDate(order.createdAt)],
      ['Updated', formatDate(order.updatedAt)],
    ] as const;
  }, [cardStatusOpt.label, form, order, product.label, total, workflowOpt?.label]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator color={PINK} />
          <AppText style={styles.muted}>Loading order...</AppText>
        </View>
      </SafeAreaView>
    );
  }

  if (!order || !form) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <AppIcon name="ChevronLeft" size={22} color="#fff" />
          </Pressable>
          <View style={styles.headerText}>
            <AppText variant="h2" tone="inverse" weight="bold" style={styles.headerTitle}>Order Detail</AppText>
            <AppText variant="caption" tone="inverse" weight="semibold" style={styles.headerSub}>Unavailable</AppText>
          </View>
        </View>
        <View style={styles.center}>
          <AppText variant="body" weight="semibold" style={styles.errorText}>{message ?? 'Order not found.'}</AppText>
          <Pressable style={styles.secondaryButton} onPress={load}>
            <AppIcon name="RotateCcw" size={20} color={PINK} />
            <AppText variant="body" weight="bold" style={styles.secondaryButtonText}>Retry</AppText>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronLeft" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerText}>
          <AppText variant="h2" tone="inverse" weight="bold" style={styles.headerTitle}>{order.customerName || 'Order Detail'}</AppText>
          <AppText variant="caption" tone="inverse" weight="semibold" style={styles.headerSub}>#{order.id.slice(0, 8).toUpperCase()} / {order.cardCode || 'No card code'}</AppText>
        </View>
        <View style={[styles.headerBadge, { backgroundColor: cardStatusOpt.color }]}>
          <AppText variant="caption" tone="inverse" weight="bold" style={styles.headerBadgeText}>{cardStatusOpt.label}</AppText>
        </View>
      </View>

      <KeyboardAvoidingView style={styles.keyboard} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          {message ? <AppText style={[styles.inlineMessage, message.includes('denied') && styles.inlineError]}>{message}</AppText> : null}

          {order.designArtworkUrl ? (
            <ImageBackground source={{ uri: order.designArtworkUrl }} imageStyle={styles.bankArtwork} style={styles.bankCard}>
              <View style={styles.bankOverlay}>
                <View style={styles.bankTop}>
                  <AppText variant="body" tone="inverse" weight="bold" style={styles.bankProduct}>{product.label}</AppText>
                  <AppIcon name="Nfc" size={22} color="#fff" />
                </View>
                <AppText variant="h1" tone="inverse" weight="bold" style={styles.bankCode}>{order.cardCode || 'BC-0000'}</AppText>
                <View style={styles.bankBottom}>
                  <AppText variant="body" tone="inverse" weight="bold" style={styles.bankName}>{form.customerName || 'Customer'}</AppText>
                  <AppText variant="caption" tone="inverse" weight="bold" style={styles.bankQty}>x{form.quantity || 1}</AppText>
                </View>
              </View>
            </ImageBackground>
          ) : (
            <View style={[styles.bankCard, styles.bankBlank]}>
              <View style={styles.bankTop}>
                <AppText variant="body" tone="inverse" weight="bold" style={styles.bankProduct}>{product.label}</AppText>
                <AppIcon name="CreditCard" size={24} color="#fff" />
              </View>
              <AppText variant="h1" tone="inverse" weight="bold" style={styles.bankCode}>{order.cardCode || 'BC-0000'}</AppText>
              <View style={styles.bankBottom}>
                <AppText variant="body" tone="inverse" weight="bold" style={styles.bankName}>{form.customerName || 'Customer'}</AppText>
                <AppText variant="caption" tone="inverse" weight="bold" style={styles.bankQty}>{form.cardDesign.replace(/_/g, ' ')}</AppText>
              </View>
            </View>
          )}

          <View style={styles.quickGrid}>
            <View style={styles.quickItem}>
              <AppIcon name="BadgeCheck" color={workflowOpt?.color ?? PINK} />
              <View style={styles.quickText}>
                <AppText variant="caption" tone="muted" weight="semibold">Workflow</AppText>
                <AppText variant="body" weight="bold">{workflowOpt?.label ?? order.status}</AppText>
              </View>
            </View>
            <View style={styles.quickItem}>
              <AppIcon name="CalendarDays" color={PINK} />
              <View style={styles.quickText}>
                <AppText variant="caption" tone="muted" weight="semibold">Due date</AppText>
                <AppText variant="body" weight="bold">{form.dueDate || 'Not set'}</AppText>
              </View>
            </View>
            <View style={styles.quickItem}>
              <AppIcon name="CircleDollarSign" color={payColor} />
              <View style={styles.quickText}>
                <AppText variant="caption" tone="muted" weight="semibold">Total</AppText>
                <AppText variant="body" weight="bold">${total}</AppText>
              </View>
            </View>
          </View>

          <Section title="Summary" icon="ClipboardList">
            <View style={styles.summaryGrid}>
              {summaryRows.map(([label, value]) => (
                <View key={label} style={styles.summaryRow}>
                  <AppText variant="caption" tone="muted" weight="semibold" style={styles.summaryLabel}>{label}</AppText>
                  <AppText variant="body" weight="bold" style={[styles.summaryValue, label === 'Card' && { color: cardStatusOpt.color }]}>{value}</AppText>
                </View>
              ))}
            </View>
          </Section>

          <Section title="Customer" icon="UserRound">
            <Field label="Customer name" value={form.customerName} onChangeText={(value) => setField('customerName', value)} />
            <View style={styles.twoCol}>
              <Field label="Phone" value={form.phone} onChangeText={(value) => setField('phone', value)} keyboardType="phone-pad" />
              <Field label="Telegram" value={form.telegram} onChangeText={(value) => setField('telegram', value)} />
            </View>
            <View style={styles.twoCol}>
              <Field label="WhatsApp" value={form.whatsapp} onChangeText={(value) => setField('whatsapp', value)} keyboardType="phone-pad" />
              <Field label="Email" value={form.email} onChangeText={(value) => setField('email', value)} keyboardType="email-address" />
            </View>
            <View style={styles.twoCol}>
              <Field label="Company" value={form.company} onChangeText={(value) => setField('company', value)} />
              <Field label="Job title" value={form.jobTitle} onChangeText={(value) => setField('jobTitle', value)} />
            </View>
            <Field label="Delivery address" value={form.deliveryAddress} onChangeText={(value) => setField('deliveryAddress', value)} multiline />
          </Section>

          <Section title="Product" icon="CreditCard">
            <PillGroup
              label="Product type"
              value={form.productType}
              options={productTypeOptions.map((item) => ({ label: item.label, value: item.value, price: item.price }))}
              onChange={(value) => setField('productType', value)}
            />
            <View style={styles.twoCol}>
              <Field label="Quantity" value={form.quantity} onChangeText={(value) => setField('quantity', value.replace(/[^\d]/g, ''))} keyboardType="numeric" />
              <Field label="Due date" value={form.dueDate} onChangeText={(value) => setField('dueDate', value)} placeholder="YYYY-MM-DD" />
            </View>
            <PillGroup
              label="Card design"
              value={form.cardDesign}
              options={cardDesignOptions}
              onChange={(value) => setField('cardDesign', value)}
            />
            <PillGroup
              label="Priority"
              value={form.priority}
              options={priorityOptions.map((item) => ({ ...item }))}
              onChange={(value) => setField('priority', value)}
            />
          </Section>

          <Section title="Payment" icon="CircleDollarSign">
            <PillGroup
              label="Payment status"
              value={form.paymentStatus}
              options={paymentStatusOptions.map((item) => ({ ...item, color: paymentStatusColors[item.value] }))}
              onChange={(value) => setField('paymentStatus', value)}
            />
            <PillGroup
              label="Payment method"
              value={form.paymentMethod || paymentMethodOptions[0].value}
              options={paymentMethodOptions.map((item) => ({ ...item }))}
              onChange={(value) => setField('paymentMethod', value)}
            />
            <View style={styles.twoCol}>
              <Field label="Deposit" value={form.depositAmount} onChangeText={(value) => setField('depositAmount', value.replace(/[^\d.]/g, ''))} keyboardType="numeric" />
              <View style={styles.totalBox}>
                <AppText variant="caption" tone="muted" weight="bold" style={styles.totalLabel}>Total</AppText>
                <AppText variant="h2" weight="bold" style={[styles.totalValue, { color: payColor }]}>${total}</AppText>
              </View>
            </View>
          </Section>

          <Section title="NFC and artwork" icon="Nfc">
            <ToggleRow label="NFC write" value={form.nfcEnabled} onChange={(value) => setField('nfcEnabled', value)} />
            <ToggleRow label="QR printed" value={form.qrPrinted} onChange={(value) => setField('qrPrinted', value)} />
            <Field label="NFC target URL" value={form.nfcTargetUrl} onChangeText={(value) => setField('nfcTargetUrl', value)} keyboardType="url" placeholder={order.profileUrl} />
            {order.designArtworkUrl ? (
              <View style={styles.artworkRow}>
                <AppIcon name="Image" size={20} color={PINK} />
                <AppText variant="caption" weight="bold" style={styles.artworkText}>{order.designArtworkFileName || 'Custom artwork uploaded'}</AppText>
              </View>
            ) : null}
          </Section>

          <Section title="Notes and card controls" icon="ShieldCheck">
            <Field label="Notes" value={form.notes} onChangeText={(value) => setField('notes', value)} multiline />
            <Field label="Freeze reason" value={form.freezeReason} onChangeText={(value) => setField('freezeReason', value)} placeholder="Reason shown to admin and sales" />
            <View style={styles.actionRow}>
              <Pressable
                style={[styles.actionButton, cardStatus === 'frozen' ? styles.actionButtonGreen : styles.actionButtonBlue]}
                onPress={handleFreezeToggle}
                disabled={saving || cardStatus === 'closed'}
              >
                <AppIcon name={cardStatus === 'frozen' ? 'RotateCcw' : 'Snowflake'} size={20} color="#fff" />
                <AppText variant="body" tone="inverse" weight="bold" style={styles.actionButtonText}>{cardStatus === 'frozen' ? 'Unfreeze' : 'Freeze'}</AppText>
              </Pressable>
              <Pressable
                style={[styles.actionButton, cardStatus === 'closed' ? styles.actionButtonGreen : styles.actionButtonDanger]}
                onPress={handleCloseToggle}
                disabled={saving}
              >
                <AppIcon name={cardStatus === 'closed' ? 'ArchiveRestore' : 'Archive'} size={20} color="#fff" />
                <AppText variant="body" tone="inverse" weight="bold" style={styles.actionButtonText}>{cardStatus === 'closed' ? 'Reopen' : 'Close card'}</AppText>
              </Pressable>
            </View>
          </Section>
        </ScrollView>

        <View style={styles.footer}>
          <Pressable style={styles.secondaryButton} onPress={load} disabled={saving}>
            <AppIcon name="RotateCcw" size={20} color={PINK} />
            <AppText variant="body" weight="bold" style={styles.secondaryButtonText}>Reset</AppText>
          </Pressable>
          <Pressable style={[styles.saveButton, saving && styles.disabledButton]} onPress={handleSave} disabled={saving}>
            {saving ? <ActivityIndicator color="#fff" /> : <AppIcon name="BadgeCheck" size={20} color="#fff" />}
            <AppText variant="body" tone="inverse" weight="bold" style={styles.saveButtonText}>{saving ? 'Saving...' : 'Save changes'}</AppText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export function OrderDetailScreen() {
  return (
    <AuthGate allowedRoles={['sales', 'admin', 'super_admin']}>
      <DetailContent />
    </AuthGate>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F7F8FA' },
  keyboard: { flex: 1 },
  header: {
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 10,
    paddingBottom: 16,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.24)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: { flex: 1 },
  headerTitle: { maxWidth: '100%' },
  headerSub: { opacity: 0.82, marginTop: 3, color: '#fff' },
  headerBadge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 6 },
  headerBadgeText: { textTransform: 'uppercase' },
  scroll: { padding: 16, paddingBottom: 130, gap: 12 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  muted: { color: MUTED },
  errorText: { color: theme.colors.danger, textAlign: 'center' },
  inlineMessage: {
    backgroundColor: '#E8F8F1',
    color: '#11845B',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  inlineError: { backgroundColor: '#FFEAEA', color: theme.colors.danger },
  bankCard: {
    minHeight: 190,
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: '#161824',
    padding: 20,
    justifyContent: 'space-between',
    shadowColor: '#7A0D47',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 18,
    elevation: 5,
  },
  bankBlank: { backgroundColor: '#161824' },
  bankArtwork: { borderRadius: 18 },
  bankOverlay: {
    flex: 1,
    justifyContent: 'space-between',
    margin: -20,
    padding: 20,
    backgroundColor: 'rgba(0,0,0,0.34)',
  },
  bankTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  bankProduct: { textTransform: 'uppercase' },
  bankCode: { letterSpacing: 0 },
  bankBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  bankName: { flex: 1 },
  bankQty: { opacity: 0.86, textTransform: 'uppercase' },
  quickGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  quickItem: {
    flexGrow: 1,
    flexBasis: 112,
    minHeight: 64,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8D8E1',
    backgroundColor: SURFACE,
    paddingHorizontal: 10,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quickText: { flex: 1, gap: 2 },
  section: {
    backgroundColor: SURFACE,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E8D8E1',
    padding: 14,
    gap: 12,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#FCE4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { flex: 1 },
  summaryGrid: { gap: 9 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  summaryLabel: { minWidth: 88 },
  summaryValue: { flex: 1, textAlign: 'right' },
  field: { flex: 1, gap: 6 },
  label: { textTransform: 'uppercase' },
  input: {
    minHeight: 46,
    borderWidth: 1.5,
    borderColor: BORDER,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    ...theme.typography.variants.body,
    backgroundColor: SURFACE,
  },
  textArea: { minHeight: 92, textAlignVertical: 'top' },
  twoCol: { flexDirection: 'row', gap: 10 },
  pillRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    minHeight: 36,
    borderRadius: 18,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: BORDER,
    backgroundColor: '#FFF7FB',
  },
  pillText: { color: theme.colors.textMuted },
  pillTextSelected: { color: '#fff' },
  toggleRow: {
    minHeight: 52,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: BORDER,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FAFBFC',
  },
  toggleLabel: { color: theme.colors.textPrimary },
  switchTrack: { width: 48, height: 26, borderRadius: 13, padding: 3, backgroundColor: '#D7CDD3' },
  switchTrackOn: { backgroundColor: PINK },
  switchThumb: { width: 20, height: 20, borderRadius: 10, backgroundColor: '#fff' },
  switchThumbOn: { transform: [{ translateX: 22 }] },
  totalBox: {
    flex: 1,
    minHeight: 69,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: BORDER,
    paddingHorizontal: 12,
    paddingVertical: 9,
    justifyContent: 'center',
    backgroundColor: '#FAFBFC',
  },
  totalLabel: { textTransform: 'uppercase' },
  totalValue: { marginTop: 3 },
  artworkRow: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: '#FCE4F3',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
  },
  artworkText: { color: PINK },
  actionRow: { flexDirection: 'row', gap: 10 },
  actionButton: {
    flex: 1,
    minHeight: 48,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  actionButtonBlue: { backgroundColor: '#2563eb' },
  actionButtonGreen: { backgroundColor: '#2BC48A' },
  actionButtonDanger: { backgroundColor: '#E74C3C' },
  actionButtonText: {},
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    gap: 10,
    padding: 16,
    paddingBottom: 18,
    backgroundColor: '#F7F8FA',
    borderTopWidth: 1,
    borderTopColor: theme.colors.border,
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: PINK,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  secondaryButtonText: { color: PINK },
  saveButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 16,
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  disabledButton: { opacity: 0.65 },
  saveButtonText: {},
});
