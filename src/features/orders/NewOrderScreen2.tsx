import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { cardDesignOptions, paymentMethodOptions, productTypeOptions } from '@/src/constants/options';
import { useAuth } from '@/src/hooks/useAuth';
import { createOrder } from '@/src/services/firestoreService';
import { getAuthErrorMessage } from '@/src/services/authService';
import { uploadOrderArtwork } from '@/src/services/orderArtworkService';
import { CardDesign } from '@/src/types/models';

import { theme } from '@/src/constants/theme';

const salesTheme = theme.roles.sales;
const PINK = salesTheme.primary;
const PINK_DARK = salesTheme.primaryDark;
const INK = '#1A0A12';

type ProductValue = typeof productTypeOptions[number]['value'];
type PaymentValue = typeof paymentMethodOptions[number]['value'];
type Priority = 'low' | 'normal' | 'high' | 'urgent';
type PaymentStatus = 'unpaid' | 'partial' | 'paid';
type SubmitMessage = { type: 'error' | 'success'; text: string } | null;

type ArtworkAsset = {
  uri: string;
  fileName?: string | null;
  mimeType?: string | null;
};

type ProductCardTheme = {
  colors: readonly [string, string];
  accent: string;
  text: string;
  muted: string;
};

const PRODUCT_CARD_THEMES: Record<ProductValue, ProductCardTheme> = {
  wood_card: {
    colors: ['#3B2416', '#A46B38'],
    accent: '#F2C37B',
    text: '#FFF7E8',
    muted: 'rgba(255,247,232,0.72)',
  },
  metal_card: {
    colors: ['#111827', '#64748B'],
    accent: '#DDE6EF',
    text: '#F8FAFC',
    muted: 'rgba(248,250,252,0.72)',
  },
  pvc_card: {
    colors: ['#0F766E', salesTheme.primary],
    accent: '#B8FFF2',
    text: '#FFFFFF',
    muted: 'rgba(255,255,255,0.76)',
  },
};

const PRIORITY_OPTIONS: { label: string; value: Priority; color: string }[] = [
  { label: 'Low', value: 'low', color: '#6E8A95' },
  { label: 'Normal', value: 'normal', color: '#00A4A6' },
  { label: 'High', value: 'high', color: '#FFB343' },
  { label: 'Urgent', value: 'urgent', color: '#E74C3C' },
];

const PAYMENT_STATUS_OPTIONS: { label: string; value: PaymentStatus; color: string }[] = [
  { label: 'Unpaid', value: 'unpaid', color: '#E74C3C' },
  { label: 'Partial', value: 'partial', color: '#FFB343' },
  { label: 'Paid', value: 'paid', color: '#2BC48A' },
];

function SectionHeader({
  icon,
  title,
}: {
  icon: React.ComponentProps<typeof AppIcon>['name'];
  title: string;
}) {
  return (
    <View style={sh.row}>
      <AppIcon name={icon} size={18} color={PINK} />
      <AppText style={sh.title}>{title}</AppText>
    </View>
  );
}

const sh = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0C0DC',
    marginBottom: 14,
  },
  title: { fontSize: 16, fontWeight: '700', color: INK },
});

function PillPicker<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { label: string; value: T; color?: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={pp.row}>
      {options.map((opt) => (
        <Pressable
          key={opt.value}
          style={[
            pp.pill,
            value === opt.value && {
              backgroundColor: opt.color ?? PINK,
              borderColor: opt.color ?? PINK,
            },
          ]}
          onPress={() => onChange(opt.value)}
        >
          <AppText style={[pp.text, value === opt.value && { color: '#fff' }]}>{opt.label}</AppText>
        </Pressable>
      ))}
    </View>
  );
}

const pp = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#F0C0DC',
    backgroundColor: '#fff',
  },
  text: { fontSize: 13, fontWeight: '600', color: '#555' },
});

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <View style={f.wrap}>
      <AppText style={f.label}>
        {label}
        {required ? <AppText style={f.req}> *</AppText> : null}
      </AppText>
      {children}
    </View>
  );
}

const f = StyleSheet.create({
  wrap: { gap: 6 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#666',
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  req: { color: '#E74C3C' },
});

function ToggleControl({
  value,
  onChange,
}: {
  value: boolean;
  onChange: (next: boolean) => void;
}) {
  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      onPress={() => onChange(!value)}
      style={[styles.toggleTrack, value && styles.toggleTrackActive]}
    >
      <View style={[styles.toggleThumb, value && styles.toggleThumbActive]} />
    </Pressable>
  );
}

const inputStyle: object = {
  width: '100%',
  minWidth: 0,
  backgroundColor: '#fff',
  borderRadius: 12,
  borderWidth: 1,
  borderColor: '#F0C0DC',
  paddingHorizontal: 14,
  height: 48,
  fontSize: 15,
  color: INK,
};

const multilineStyle: object = {
  ...inputStyle,
  minHeight: 80,
  height: undefined,
  paddingTop: 12,
  paddingBottom: 12,
  textAlignVertical: 'top',
};

function isValidUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === 'https:' || parsed.protocol === 'http:';
  } catch {
    return false;
  }
}

function moneyValue(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

async function withTimeout<T>(work: Promise<T>, timeoutMs: number, message: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => reject(new Error(message)), timeoutMs);
  });

  try {
    return await Promise.race([work, timeoutPromise]);
  } finally {
    if (timeout) clearTimeout(timeout);
  }
}

function formatProductLabel(value: string) {
  const option = productTypeOptions.find((item) => item.value === value);
  return option?.label ?? value.replace(/_/g, ' ');
}

function ProductBankCard({
  option,
  selected,
  cardWidthStyle,
  onPress,
}: {
  option: typeof productTypeOptions[number];
  selected: boolean;
  cardWidthStyle: object;
  onPress: () => void;
}) {
  const palette = PRODUCT_CARD_THEMES[option.value];

  return (
    <Pressable
      onPress={onPress}
      style={[styles.productCardShell, cardWidthStyle, selected && styles.productCardShellActive]}
    >
      <LinearGradient
        colors={palette.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bankCard}
      >
        <View style={styles.bankCardTop}>
          <View style={[styles.chip, { borderColor: palette.accent }]}>
            <View style={[styles.chipLine, { backgroundColor: palette.accent }]} />
            <View style={[styles.chipLine, { backgroundColor: palette.accent }]} />
          </View>
          <AppIcon name="Nfc" size={20} color={palette.accent} />
        </View>
        <View style={styles.bankCardMid}>
          <AppText style={[styles.bankCardBrand, { color: palette.muted }]}>BIOCLOUD CARD</AppText>
          <AppText style={[styles.bankCardName, { color: palette.text }]}>{option.label}</AppText>
        </View>
        <View style={styles.bankCardBottom}>
          <View>
            <AppText style={[styles.bankCardMeta, { color: palette.muted }]}>NFC + QR READY</AppText>
            <AppText style={[styles.bankCardMeta, { color: palette.muted }]}>CUSTOM ARTWORK</AppText>
          </View>
          <AppText style={[styles.bankCardPrice, { color: palette.text }]}>${option.price}</AppText>
        </View>
      </LinearGradient>
      {selected ? (
        <View style={styles.selectedCheck}>
          <AppIcon name="ShieldCheck" size={14} color="#fff" />
        </View>
      ) : null}
    </Pressable>
  );
}

function CardPreview({
  product,
  customerName,
  company,
  cardDesign,
  artwork,
  nfcWrite,
  qrPrinted,
}: {
  product: ProductValue;
  customerName: string;
  company: string;
  cardDesign: CardDesign;
  artwork: ArtworkAsset | null;
  nfcWrite: boolean;
  qrPrinted: boolean;
}) {
  const palette = PRODUCT_CARD_THEMES[product];
  const designLabel = cardDesignOptions.find((item) => item.value === cardDesign)?.label ?? 'Classic Black';

  return (
    <View style={styles.previewWrap}>
      <View style={styles.previewHeader}>
        <View>
          <AppText style={styles.previewTitle}>Card preview</AppText>
          <AppText style={styles.previewSubtitle}>{formatProductLabel(product)} / {designLabel}</AppText>
        </View>
        <View style={styles.previewBadge}>
          <AppIcon name="CreditCard" size={14} color={PINK} />
          <AppText style={styles.previewBadgeText}>Bank card fit</AppText>
        </View>
      </View>

      <LinearGradient
        colors={palette.colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.previewCard}
      >
        {artwork?.uri ? (
          <Image source={{ uri: artwork.uri }} style={styles.previewImage} resizeMode="cover" />
        ) : null}
        <View style={styles.previewOverlay} />
        <View style={styles.previewTop}>
          <View style={[styles.previewChip, { borderColor: palette.accent }]}>
            <View style={[styles.previewChipLine, { backgroundColor: palette.accent }]} />
            <View style={[styles.previewChipLine, { backgroundColor: palette.accent }]} />
          </View>
          <View style={styles.previewFeatureRow}>
            {qrPrinted ? (
              <View style={styles.previewFeature}>
                <AppIcon name="QrCode" size={13} color="#fff" />
              </View>
            ) : null}
            {nfcWrite ? (
              <View style={styles.previewFeature}>
                <AppIcon name="Nfc" size={13} color="#fff" />
              </View>
            ) : null}
          </View>
        </View>
        <View style={styles.previewBottom}>
          <View style={styles.previewIdentity}>
            <AppText style={styles.previewName} numberOfLines={1}>
              {(customerName.trim() || 'Customer Name').toUpperCase()}
            </AppText>
            <AppText style={styles.previewCompany} numberOfLines={1}>
              {company.trim() || 'Company / Brand'}
            </AppText>
          </View>
          <AppText style={styles.previewNetwork}>NFC</AppText>
        </View>
      </LinearGradient>
    </View>
  );
}

export function NewOrderScreen() {
  const { user } = useAuth();
  const { width } = useWindowDimensions();
  const [step, setStep] = useState(1);
  const totalSteps = 3;
  const isNarrow = width < 460;
  const productCardWidthStyle =
    width >= 720 ? styles.productCardThird : width >= 520 ? styles.productCardHalf : styles.productCardFull;

  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  const [product, setProduct] = useState<ProductValue>('wood_card');
  const [quantity, setQuantity] = useState('1');
  const [priority, setPriority] = useState<Priority>('normal');
  const [cardDesign, setCardDesign] = useState<CardDesign>('classic_black');
  const [qrPrinted, setQrPrinted] = useState(false);
  const [nfcWrite, setNfcWrite] = useState(true);
  const [nfcTargetUrl, setNfcTargetUrl] = useState('');
  const [customArtwork, setCustomArtwork] = useState<ArtworkAsset | null>(null);

  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [paymentMethod, setPaymentMethod] = useState<PaymentValue>('online');
  const [deposit, setDeposit] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [deliveryAddress, setDeliveryAddress] = useState('');
  const [notes, setNotes] = useState('');

  const [saving, setSaving] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<SubmitMessage>(null);

  const selectedProduct = productTypeOptions.find((p) => p.value === product)!;
  const qty = Math.max(1, parseInt(quantity, 10) || 1);
  const total = selectedProduct.price * qty;

  async function pickArtwork() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission needed', 'Allow photo access to attach custom card artwork.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 10],
      quality: 0.85,
    });

    if (result.canceled || !result.assets[0]) return;

    const asset = result.assets[0];
    setCustomArtwork({
      uri: asset.uri,
      fileName: asset.fileName,
      mimeType: asset.mimeType,
    });
    setCardDesign('custom');
  }

  function validate() {
    if (step === 1) {
      if (!customerName.trim()) {
        Alert.alert('Required', 'Customer name is required.');
        return false;
      }
      if (!phone.trim() && !telegram.trim()) {
        Alert.alert('Required', 'Add at least one contact: phone or Telegram.');
        return false;
      }
    }

    if (step === 2) {
      if (qty < 1) {
        Alert.alert('Invalid', 'Quantity must be at least 1.');
        return false;
      }
      if (nfcWrite && !isValidUrl(nfcTargetUrl)) {
        Alert.alert('Invalid NFC URL', 'Enter a valid http or https URL, or leave it blank to use the generated profile URL.');
        return false;
      }
    }

    if (step === 3) {
      const depositAmount = moneyValue(deposit);
      if (depositAmount === null || (depositAmount !== undefined && depositAmount < 0)) {
        Alert.alert('Invalid deposit', 'Deposit amount must be a valid number.');
        return false;
      }
    }

    return true;
  }

  async function handleSubmit() {
    if (saving) return;
    if (!user || user.isGuest) {
      Alert.alert('Sign in required', 'Please sign in as sales staff.');
      return;
    }
    if (!validate()) return;

    setSaving(true);
    setSubmitMessage(null);
    try {
      let artworkUpload: Awaited<ReturnType<typeof uploadOrderArtwork>> | undefined;
      if (customArtwork) {
        artworkUpload = await withTimeout(
          uploadOrderArtwork({
            uri: customArtwork.uri,
            fileName: customArtwork.fileName,
            mimeType: customArtwork.mimeType,
            salesUserId: user.id,
          }),
          20000,
          'Artwork upload is taking too long. Check your connection and try again.'
        );
      }

      const depositAmount = moneyValue(deposit);
      const orderId = await withTimeout(
        createOrder({
          customerName: customerName.trim(),
          phone: phone.trim(),
          telegram: telegram.trim() || undefined,
          email: email.trim() || undefined,
          company: company.trim() || undefined,
          jobTitle: jobTitle.trim() || undefined,
          deliveryAddress: deliveryAddress.trim() || undefined,
          productType: product,
          quantity: qty,
          cardDesign,
          designArtworkUrl: artworkUpload?.url,
          designArtworkPath: artworkUpload?.path,
          designArtworkFileName: customArtwork?.fileName || undefined,
          nfcEnabled: nfcWrite,
          nfcTargetUrl: nfcWrite ? nfcTargetUrl.trim() || undefined : undefined,
          qrPrinted,
          depositAmount: depositAmount ?? undefined,
          dueDate: dueDate.trim() || undefined,
          paymentStatus,
          paymentMethod,
          priority: priority === 'urgent' ? 'urgent' : 'standard',
          notes: notes.trim() || undefined,
          assignedSalesman: user.id,
          createdBy: user.id,
        }),
        20000,
        'Order creation is taking too long. Check Firebase connection/rules and try again.'
      );

      setSubmitMessage({ type: 'success', text: 'Order created and sent to the printer queue.' });
      setSaving(false);
      Alert.alert('Order created', 'The order is now in the printer queue.', [
        { text: 'New Order', onPress: resetForm },
        { text: 'View Order', onPress: () => router.replace({ pathname: '/order-detail/[orderId]', params: { orderId } }) },
      ]);
    } catch (err) {
      const message = getAuthErrorMessage(err);
      setSubmitMessage({ type: 'error', text: message });
      setSaving(false);
    } finally {
      setSaving(false);
    }
  }

  function resetForm() {
    setStep(1);
    setCustomerName('');
    setPhone('');
    setTelegram('');
    setEmail('');
    setCompany('');
    setJobTitle('');
    setProduct('wood_card');
    setQuantity('1');
    setPriority('normal');
    setCardDesign('classic_black');
    setQrPrinted(false);
    setNfcWrite(true);
    setNfcTargetUrl('');
    setCustomArtwork(null);
    setPaymentStatus('unpaid');
    setPaymentMethod('online');
    setDeposit('');
    setDueDate('');
    setDeliveryAddress('');
    setNotes('');
    setSubmitMessage(null);
  }

  function confirmReset() {
    Alert.alert('Reset order?', 'Clear this order and start again.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Reset', style: 'destructive', onPress: resetForm },
    ]);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable
          onPress={() => (step > 1 ? setStep((s) => s - 1) : router.back())}
          style={styles.backBtn}
          hitSlop={12}
        >
          <AppIcon name="ChevronLeft" size={22} color="#fff" />
        </Pressable>
        <View style={styles.headerCopy}>
          <AppText style={styles.headerTitle}>New Order</AppText>
          <AppText style={styles.headerSub}>Create NFC card orders for print queue</AppText>
        </View>
        <AppText style={styles.stepLabel}>Step {step}/{totalSteps}</AppText>
      </View>

      <View style={styles.progressBar}>
        <View style={[styles.progressFill, { width: `${(step / totalSteps) * 100}%` as any }]} />
      </View>

      <View style={styles.stepLabels}>
        {['Customer', 'Product', 'Payment'].map((label, i) => (
          <AppText key={label} style={[styles.stepLabelText, i + 1 === step && styles.stepLabelActive]}>
            {label}
          </AppText>
        ))}
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {step === 1 && (
          <View style={styles.card}>
            <SectionHeader icon="User" title="Customer Information" />
            <View style={styles.fields}>
              <Field label="Customer Name" required>
                <TextInput
                  style={inputStyle}
                  value={customerName}
                  onChangeText={setCustomerName}
                  placeholder="Full name of client"
                  placeholderTextColor="#BFA6B6"
                  autoCapitalize="words"
                />
              </Field>

              <View style={[styles.row, isNarrow && styles.stackRow]}>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Phone">
                    <TextInput
                      style={inputStyle}
                      value={phone}
                      onChangeText={setPhone}
                      placeholder="012 345 678"
                      placeholderTextColor="#BFA6B6"
                      keyboardType="phone-pad"
                    />
                  </Field>
                </View>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Telegram">
                    <TextInput
                      style={inputStyle}
                      value={telegram}
                      onChangeText={setTelegram}
                      placeholder="@username"
                      placeholderTextColor="#BFA6B6"
                      autoCapitalize="none"
                    />
                  </Field>
                </View>
              </View>
              <AppText style={styles.hint}>At least one contact is required.</AppText>

              <Field label="Email">
                <TextInput
                  style={inputStyle}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="client@example.com"
                  placeholderTextColor="#BFA6B6"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </Field>

              <View style={[styles.row, isNarrow && styles.stackRow]}>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Company">
                    <TextInput
                      style={inputStyle}
                      value={company}
                      onChangeText={setCompany}
                      placeholder="Acme Corp"
                      placeholderTextColor="#BFA6B6"
                    />
                  </Field>
                </View>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Job Title">
                    <TextInput
                      style={inputStyle}
                      value={jobTitle}
                      onChangeText={setJobTitle}
                      placeholder="Manager"
                      placeholderTextColor="#BFA6B6"
                    />
                  </Field>
                </View>
              </View>
            </View>
          </View>
        )}

        {step === 2 && (
          <>
            <View style={styles.card}>
              <SectionHeader icon="CreditCard" title="Product Details" />
              <View style={styles.fields}>
                <Field label="Product Type" required>
                  <View style={styles.productGrid}>
                    {productTypeOptions.map((opt) => (
                      <ProductBankCard
                        key={opt.value}
                        option={opt}
                        selected={product === opt.value}
                        cardWidthStyle={productCardWidthStyle}
                        onPress={() => setProduct(opt.value)}
                      />
                    ))}
                  </View>
                </Field>

                <CardPreview
                  product={product}
                  customerName={customerName}
                  company={company}
                  cardDesign={cardDesign}
                  artwork={customArtwork}
                  nfcWrite={nfcWrite}
                  qrPrinted={qrPrinted}
                />

                <Field label="Card Design">
                  <PillPicker options={cardDesignOptions.map((o) => ({ ...o, color: PINK }))} value={cardDesign} onChange={setCardDesign} />
                </Field>

                <View style={styles.uploadBox}>
                  <View style={styles.uploadCopy}>
                    <View style={styles.uploadIcon}>
                      <AppIcon name="Image" size={18} color={PINK} />
                    </View>
                    <View style={styles.uploadTextWrap}>
                      <AppText style={styles.uploadTitle}>Custom artwork</AppText>
                      <AppText style={styles.uploadHint} numberOfLines={2}>
                        {customArtwork?.fileName || 'Upload the customer card face design.'}
                      </AppText>
                    </View>
                  </View>
                  <View style={styles.uploadActions}>
                    {customArtwork ? (
                      <Pressable style={styles.clearArtworkBtn} onPress={() => setCustomArtwork(null)}>
                        <AppText style={styles.clearArtworkText}>Clear</AppText>
                      </Pressable>
                    ) : null}
                    <Pressable style={styles.uploadBtn} onPress={pickArtwork}>
                      <AppIcon name="Upload" size={15} color="#fff" />
                      <AppText style={styles.uploadBtnText}>{customArtwork ? 'Replace' : 'Upload'}</AppText>
                    </Pressable>
                  </View>
                </View>

                <View style={[styles.row, isNarrow && styles.stackRow]}>
                  <View style={[styles.half, isNarrow && styles.full]}>
                    <Field label="Quantity" required>
                      <View style={styles.qtyRow}>
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => setQuantity((q) => String(Math.max(1, (parseInt(q, 10) || 1) - 1)))}
                        >
                          <AppText style={styles.qtyBtnText}>-</AppText>
                        </Pressable>
                        <TextInput
                          style={styles.qtyInput}
                          value={quantity}
                          onChangeText={setQuantity}
                          keyboardType="number-pad"
                          textAlign="center"
                        />
                        <Pressable
                          style={styles.qtyBtn}
                          onPress={() => setQuantity((q) => String((parseInt(q, 10) || 1) + 1))}
                        >
                          <AppText style={styles.qtyBtnText}>+</AppText>
                        </Pressable>
                      </View>
                    </Field>
                  </View>
                  <View style={[styles.half, isNarrow && styles.full]}>
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

                <View style={[styles.toggleRow, isNarrow && styles.stackRow]}>
                  <View style={[styles.toggleItem, isNarrow && styles.full]}>
                    <AppIcon name="QrCode" size={18} color={PINK} />
                    <AppText style={styles.toggleLabel}>QR printed</AppText>
                    <ToggleControl value={qrPrinted} onChange={setQrPrinted} />
                  </View>
                  <View style={[styles.toggleItem, isNarrow && styles.full]}>
                    <AppIcon name="Nfc" size={18} color={PINK} />
                    <AppText style={styles.toggleLabel}>NFC write</AppText>
                    <ToggleControl value={nfcWrite} onChange={setNfcWrite} />
                  </View>
                </View>

                {nfcWrite ? (
                  <Field label="Custom NFC URL">
                    <TextInput
                      style={inputStyle}
                      value={nfcTargetUrl}
                      onChangeText={setNfcTargetUrl}
                      placeholder="Optional: https://example.com/profile"
                      placeholderTextColor="#BFA6B6"
                      autoCapitalize="none"
                      keyboardType="url"
                    />
                  </Field>
                ) : null}
              </View>
            </View>
          </>
        )}

        {step === 3 && (
          <View style={styles.card}>
            <SectionHeader icon="Wallet" title="Payment & Delivery" />
            <View style={styles.fields}>
              <Field label="Payment Status" required>
                <PillPicker options={PAYMENT_STATUS_OPTIONS} value={paymentStatus} onChange={setPaymentStatus} />
              </Field>

              <Field label="Payment Method">
                <PillPicker
                  options={paymentMethodOptions.map((o) => ({ ...o, color: o.color }))}
                  value={paymentMethod}
                  onChange={setPaymentMethod}
                />
              </Field>

              <View style={[styles.row, isNarrow && styles.stackRow]}>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Deposit Amount">
                    <View style={styles.prefixInput}>
                      <AppText style={styles.prefix}>$</AppText>
                      <TextInput
                        style={[inputStyle, styles.inlineInput]}
                        value={deposit}
                        onChangeText={setDeposit}
                        placeholder="0.00"
                        placeholderTextColor="#BFA6B6"
                        keyboardType="decimal-pad"
                      />
                    </View>
                  </Field>
                </View>
                <View style={[styles.half, isNarrow && styles.full]}>
                  <Field label="Due Date">
                    <TextInput
                      style={inputStyle}
                      value={dueDate}
                      onChangeText={setDueDate}
                      placeholder="YYYY-MM-DD"
                      placeholderTextColor="#BFA6B6"
                    />
                  </Field>
                </View>
              </View>

              <Field label="Delivery Address">
                <TextInput
                  style={multilineStyle}
                  value={deliveryAddress}
                  onChangeText={setDeliveryAddress}
                  placeholder="Street, building, floor..."
                  placeholderTextColor="#BFA6B6"
                  multiline
                  numberOfLines={2}
                />
              </Field>

              <Field label="Notes">
                <TextInput
                  style={multilineStyle}
                  value={notes}
                  onChangeText={setNotes}
                  placeholder="Special instructions, finish requirements..."
                  placeholderTextColor="#BFA6B6"
                  multiline
                  numberOfLines={3}
                />
              </Field>

              <View style={styles.summaryCard}>
                <AppText style={styles.summaryTitle}>Order Summary</AppText>
                {[
                  ['Customer', customerName || 'Not set'],
                  ['Contact', phone || telegram || 'Not set'],
                  ['Product', `${selectedProduct.label} x ${qty}`],
                  ['Design', cardDesignOptions.find((item) => item.value === cardDesign)?.label ?? cardDesign],
                  ['NFC', nfcWrite ? (nfcTargetUrl.trim() ? 'Custom URL' : 'Generated profile URL') : 'Disabled'],
                  ['Payment', paymentStatus],
                  ['Total', `$${total}`],
                ].map(([k, v]) => (
                  <View key={k} style={styles.summaryRow}>
                    <AppText style={styles.summaryKey}>{k}</AppText>
                    <AppText style={[styles.summaryVal, k === 'Total' && styles.summaryTotal]} numberOfLines={2}>
                      {v}
                    </AppText>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        {submitMessage ? (
          <View style={[styles.submitMessage, submitMessage.type === 'error' ? styles.submitMessageError : styles.submitMessageSuccess]}>
            <AppText style={[styles.submitMessageText, submitMessage.type === 'error' ? styles.submitMessageErrorText : styles.submitMessageSuccessText]}>
              {submitMessage.text}
            </AppText>
          </View>
        ) : null}
        {step < totalSteps ? (
          <Pressable
            style={styles.continueBtn}
            onPress={() => {
              if (validate()) setStep((s) => s + 1);
            }}
          >
            <AppText style={styles.continueBtnText}>Continue</AppText>
            <AppIcon name="ChevronRight" size={19} color="#fff" />
          </Pressable>
        ) : (
          <View style={[styles.footerRow, isNarrow && styles.footerStack]}>
            <Pressable style={[styles.resetBtn, isNarrow && styles.full]} onPress={confirmReset}>
              <AppIcon name="RotateCcw" size={17} color={PINK} />
              <AppText style={styles.resetBtnText}>Reset</AppText>
            </Pressable>
            <Pressable
              style={[styles.submitBtn, saving && styles.disabled, isNarrow && styles.full]}
              disabled={saving}
              onPress={handleSubmit}
            >
              <AppIcon name="ShieldCheck" size={18} color="#fff" />
              <AppText style={styles.submitBtnText}>{saving ? 'Submitting...' : 'Submit Order'}</AppText>
            </Pressable>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: salesTheme.background },
  header: {
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backBtn: {
    width: 42,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCopy: { flex: 1 },
  headerTitle: { color: '#fff', fontSize: 18, fontWeight: '700' },
  headerSub: { color: 'rgba(255,255,255,0.78)', fontSize: 11, fontWeight: '600', marginTop: 2 },
  stepLabel: { color: 'rgba(255,255,255,0.88)', fontSize: 13, fontWeight: '700' },
  progressBar: { height: 4, backgroundColor: '#F7B8DC' },
  progressFill: { height: 4, backgroundColor: PINK_DARK },
  stepLabels: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#FCE4F3',
  },
  stepLabelText: { fontSize: 11, color: '#B5166D', fontWeight: '600' },
  stepLabelActive: { fontWeight: '800', color: PINK },
  scroll: { padding: 16, paddingBottom: 120, gap: 16 },
  card: {
    width: '92%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  fields: { gap: 14 },
  row: { flexDirection: 'column', gap: 10 },
  stackRow: { flexDirection: 'column' },
  half: { width: '100%', minWidth: 0 },
  full: { width: '100%' },
  hint: { fontSize: 11, color: PINK, marginTop: -8, fontWeight: '600' },
  productGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  productCardShell: {
    position: 'relative',
    borderRadius: 16,
    padding: 2,
    backgroundColor: 'transparent',
  },
  productCardFull: { width: '100%' },
  productCardHalf: { width: '48.8%' },
  productCardThird: { width: '32%' },
  productCardShellActive: {
    backgroundColor: PINK,
    shadowColor: PINK,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 5,
  },
  bankCard: {
    aspectRatio: 1.586,
    borderRadius: 14,
    padding: 14,
    overflow: 'hidden',
    justifyContent: 'space-between',
  },
  bankCardTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  chip: {
    width: 34,
    height: 25,
    borderRadius: 7,
    borderWidth: 1.2,
    padding: 5,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.12)',
  },
  chipLine: { height: 1, opacity: 0.85 },
  bankCardMid: { gap: 4 },
  bankCardBrand: { fontSize: 9, fontWeight: '800', letterSpacing: 0 },
  bankCardName: { fontSize: 16, lineHeight: 20, fontWeight: '800' },
  bankCardBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 10 },
  bankCardMeta: { fontSize: 8.5, lineHeight: 12, fontWeight: '800', letterSpacing: 0 },
  bankCardPrice: { fontSize: 20, lineHeight: 24, fontWeight: '800' },
  selectedCheck: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewWrap: {
    backgroundColor: '#FFF8FC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0C0DC',
    padding: 12,
    gap: 10,
  },
  previewHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, alignItems: 'center' },
  previewTitle: { fontSize: 14, fontWeight: '800', color: INK },
  previewSubtitle: { fontSize: 11, color: '#886279', fontWeight: '600', marginTop: 2 },
  previewBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#FCE4F3',
    borderRadius: 20,
    paddingHorizontal: 9,
    paddingVertical: 5,
  },
  previewBadgeText: { color: PINK, fontSize: 10, fontWeight: '800' },
  previewCard: {
    aspectRatio: 1.586,
    borderRadius: 18,
    overflow: 'hidden',
    padding: 18,
    justifyContent: 'space-between',
  },
  previewImage: { ...StyleSheet.absoluteFillObject },
  previewOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.28)' },
  previewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  previewChip: {
    width: 46,
    height: 34,
    borderRadius: 9,
    borderWidth: 1.5,
    padding: 7,
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255,255,255,0.14)',
  },
  previewChipLine: { height: 1.2, opacity: 0.9 },
  previewFeatureRow: { flexDirection: 'row', gap: 6 },
  previewFeature: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewBottom: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', gap: 14 },
  previewIdentity: { flex: 1 },
  previewName: { color: '#fff', fontSize: 17, lineHeight: 22, fontWeight: '800' },
  previewCompany: { color: 'rgba(255,255,255,0.72)', fontSize: 11, fontWeight: '700', marginTop: 2 },
  previewNetwork: { color: '#fff', fontSize: 18, fontWeight: '900' },
  uploadBox: {
    borderWidth: 1,
    borderColor: '#F0C0DC',
    backgroundColor: '#FFF8FC',
    borderRadius: 14,
    padding: 12,
    gap: 12,
  },
  uploadCopy: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  uploadIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#FCE4F3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadTextWrap: { flex: 1, gap: 2 },
  uploadTitle: { fontSize: 14, fontWeight: '800', color: INK },
  uploadHint: { fontSize: 12, color: '#886279', lineHeight: 17 },
  uploadActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 8, flexWrap: 'wrap' },
  uploadBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: PINK,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  uploadBtnText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  clearArtworkBtn: {
    minHeight: 38,
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#F0C0DC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  clearArtworkText: { color: PINK, fontSize: 13, fontWeight: '800' },
  qtyRow: { width: '100%', flexDirection: 'row', alignItems: 'center', gap: 8 },
  qtyBtn: {
    width: 42,
    height: 42,
    flexShrink: 0,
    borderRadius: 21,
    backgroundColor: PINK,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: { color: '#fff', fontSize: 20, fontWeight: '700', lineHeight: 24 },
  qtyInput: {
    flex: 1,
    minWidth: 0,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0C0DC',
    height: 48,
    fontSize: 18,
    fontWeight: '700',
    color: INK,
  },
  totalBox: {
    backgroundColor: salesTheme.background,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0C0DC',
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  totalAmount: { fontSize: 20, fontWeight: '700', color: PINK },
  toggleRow: { flexDirection: 'column', gap: 12 },
  toggleTrack: {
    width: 50,
    height: 30,
    flexShrink: 0,
    borderRadius: 15,
    padding: 3,
    backgroundColor: '#D8CDD4',
    justifyContent: 'center',
  },
  toggleTrackActive: {
    backgroundColor: PINK,
  },
  toggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.14,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleThumbActive: {
    transform: [{ translateX: 20 }],
  },
  toggleItem: {
    flex: 1,
    flexBasis: 0,
    minWidth: 0,
    width: '100%',
    minHeight: 54,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: salesTheme.background,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0C0DC',
  },
  toggleLabel: { flex: 1, fontSize: 13, fontWeight: '600', color: '#555' },
  prefixInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#F0C0DC',
    paddingLeft: 12,
    height: 48,
  },
  prefix: { fontSize: 16, fontWeight: '700', color: '#555' },
  inlineInput: { flex: 1, borderWidth: 0, backgroundColor: 'transparent' },
  summaryCard: {
    backgroundColor: salesTheme.background,
    borderRadius: 14,
    padding: 14,
    gap: 8,
    borderWidth: 1,
    borderColor: '#F0C0DC',
  },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: INK, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
  summaryKey: { fontSize: 12, color: '#888', flexShrink: 0 },
  summaryVal: { flex: 1, fontSize: 12, fontWeight: '600', color: INK, textAlign: 'right' },
  summaryTotal: { color: PINK, fontWeight: '800' },
  footer: {
    padding: 16,
    paddingBottom: 28,
    backgroundColor: salesTheme.background,
    borderTopWidth: 1,
    borderTopColor: '#F0C0DC',
  },
  submitMessage: {
    width: '92%',
    maxWidth: 720,
    alignSelf: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 9,
    marginBottom: 10,
  },
  submitMessageError: {
    backgroundColor: '#FFE8E6',
    borderColor: '#F5B9B2',
  },
  submitMessageSuccess: {
    backgroundColor: '#E9F9F2',
    borderColor: '#BDEBD7',
  },
  submitMessageText: {
    fontSize: 12,
    lineHeight: 17,
    fontWeight: '700',
  },
  submitMessageErrorText: {
    color: '#C0392B',
  },
  submitMessageSuccessText: {
    color: '#167B51',
  },
  footerRow: { width: '92%', maxWidth: 720, alignSelf: 'center', flexDirection: 'row', gap: 10 },
  footerStack: { flexDirection: 'column' },
  continueBtn: {
    width: '92%',
    maxWidth: 720,
    alignSelf: 'center',
    backgroundColor: PINK,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
  resetBtn: {
    flex: 1,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    borderWidth: 1.5,
    borderColor: PINK,
    backgroundColor: '#fff',
  },
  resetBtnText: { color: PINK, fontSize: 15, fontWeight: '700' },
  submitBtn: {
    flex: 2,
    backgroundColor: PINK,
    borderRadius: 16,
    height: 54,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  disabled: { opacity: 0.6 },
});
