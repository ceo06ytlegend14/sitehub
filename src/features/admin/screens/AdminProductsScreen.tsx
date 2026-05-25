import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Switch, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, doc, getDocs, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;

interface Product {
  id: string;
  name: string;
  emoji: string;
  price: number;
  isActive: boolean;
}

const DEFAULT_PRODUCTS: Product[] = [
  { id: 'wood_card',  name: 'Wood Card',  emoji: '🪵', price: 49, isActive: true },
  { id: 'metal_card', name: 'Metal Card', emoji: '⚙️', price: 89, isActive: true },
  { id: 'pvc_card',   name: 'PVC Card',   emoji: '💳', price: 29, isActive: true },
];

export default function ProductsScreen() {
  const [products, setProducts] = useState<Product[]>(DEFAULT_PRODUCTS);
  const [editPrices, setEditPrices] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDocs(collection(db, 'products'));
        if (snap.docs.length > 0) {
          const loaded: Product[] = snap.docs.map(d => ({
            id: d.id,
            name: d.data().name ?? d.id,
            emoji: d.data().emoji ?? '📦',
            price: d.data().price ?? 0,
            isActive: d.data().isActive !== false,
          }));
          // Merge with defaults to ensure all 3 products exist
          const merged = DEFAULT_PRODUCTS.map(def => {
            const found = loaded.find(l => l.id === def.id);
            return found ?? def;
          });
          setProducts(merged);
        }
        // Initialize edit prices from loaded products
        const prices: Record<string, string> = {};
        DEFAULT_PRODUCTS.forEach(p => {
          const found = snap.docs.find(d => d.id === p.id);
          prices[p.id] = String(found?.data().price ?? p.price);
        });
        setEditPrices(prices);
      } catch {
        // Use defaults
        const prices: Record<string, string> = {};
        DEFAULT_PRODUCTS.forEach(p => { prices[p.id] = String(p.price); });
        setEditPrices(prices);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveProduct(product: Product) {
    const priceStr = editPrices[product.id];
    const price = parseFloat(priceStr);
    if (isNaN(price) || price < 0) {
      Alert.alert('Invalid Price', 'Please enter a valid price.');
      return;
    }
    setSaving(prev => ({ ...prev, [product.id]: true }));
    try {
      await setDoc(
        doc(db, 'products', product.id),
        {
          name: product.name,
          emoji: product.emoji,
          price,
          isActive: product.isActive,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, price } : p)
      );
      Alert.alert('Saved', `${product.name} updated successfully.`);
    } catch {
      Alert.alert('Error', 'Could not save product.');
    } finally {
      setSaving(prev => ({ ...prev, [product.id]: false }));
    }
  }

  async function toggleActive(product: Product) {
    const newActive = !product.isActive;
    try {
      await setDoc(
        doc(db, 'products', product.id),
        { isActive: newActive, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setProducts(prev =>
        prev.map(p => p.id === product.id ? { ...p, isActive: newActive } : p)
      );
    } catch {
      Alert.alert('Error', 'Could not update availability.');
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>Products</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <AppText style={styles.subtitle}>
          Manage card types, prices, and availability.
        </AppText>

        {loading ? (
          <AppText style={styles.empty}>Loading products…</AppText>
        ) : (
          products.map(product => (
            <View key={product.id} style={[styles.card, !product.isActive && styles.cardInactive]}>
              {/* Product header */}
              <View style={styles.productHeader}>
                <View style={styles.emojiWrap}>
                  <AppText style={styles.emoji}>{product.emoji}</AppText>
                </View>
                <View style={styles.productInfo}>
                  <AppText style={styles.productName}>{product.name}</AppText>
                  <AppText style={styles.productId}>{product.id}</AppText>
                </View>
                <View style={styles.toggleWrap}>
                  <AppText style={[styles.toggleLabel, { color: product.isActive ? '#2BC48A' : '#aaa' }]}>
                    {product.isActive ? 'Active' : 'Inactive'}
                  </AppText>
                  <Switch
                    value={product.isActive}
                    onValueChange={() => toggleActive(product)}
                    trackColor={{ false: '#ddd', true: '#2BC48A' }}
                    thumbColor="#fff"
                  />
                </View>
              </View>

              {/* Price editor */}
              <View style={styles.priceRow}>
                <AppText style={styles.priceLabel}>Price (USD)</AppText>
                <View style={styles.priceInputWrap}>
                  <AppText style={styles.dollarSign}>$</AppText>
                  <TextInput
                    style={styles.priceInput}
                    value={editPrices[product.id] ?? String(product.price)}
                    onChangeText={v => setEditPrices(prev => ({ ...prev, [product.id]: v }))}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor="#ccc"
                  />
                </View>
              </View>

              {/* Current price display */}
              <View style={styles.currentPriceRow}>
                <AppText style={styles.currentPriceLabel}>Current saved price:</AppText>
                <AppText style={styles.currentPrice}>${product.price}</AppText>
              </View>

              {/* Save button */}
              <Pressable
                style={[styles.saveBtn, saving[product.id] && styles.saveBtnDisabled]}
                onPress={() => saveProduct(product)}
                disabled={saving[product.id]}
              >
                <AppText style={styles.saveBtnText}>
                  {saving[product.id] ? 'Saving…' : 'Save Changes'}
                </AppText>
              </Pressable>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  header: { backgroundColor: NAVY, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.3)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  scroll: { padding: 16, paddingBottom: 40, gap: 14 },
  subtitle: { fontSize: 13, color: '#888', marginBottom: 4 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  card: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardInactive: { opacity: 0.6 },
  productHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  emojiWrap: { width: 52, height: 52, borderRadius: 16, backgroundColor: adminTheme.soft, alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 28 },
  productInfo: { flex: 1, gap: 2 },
  productName: { fontSize: 17, fontWeight: '700', color: '#1A1A2E' },
  productId: { fontSize: 11, color: '#aaa' },
  toggleWrap: { alignItems: 'center', gap: 4 },
  toggleLabel: { fontSize: 10, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12 },
  priceLabel: { fontSize: 14, fontWeight: '600', color: '#555' },
  priceInputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E4FF', paddingHorizontal: 12, height: 44, gap: 4 },
  dollarSign: { fontSize: 16, fontWeight: '700', color: '#555' },
  priceInput: { fontSize: 18, fontWeight: '700', color: '#1A1A2E', minWidth: 80 },
  currentPriceRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  currentPriceLabel: { fontSize: 12, color: '#aaa' },
  currentPrice: { fontSize: 14, fontWeight: '700', color: NAVY },
  saveBtn: { backgroundColor: NAVY, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});

