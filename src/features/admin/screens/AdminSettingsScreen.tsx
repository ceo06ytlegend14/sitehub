import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, TextInput, View } from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const BG = adminTheme.background;
const SETTINGS_DOC = doc(db, 'settings', 'global');

interface GlobalSettings {
  commissionRate: number;
  wagePerCard: number;
  branches: string[];
  appVersion?: string;
  updatedAt?: any;
}

const DEFAULTS: GlobalSettings = {
  commissionRate: 10,
  wagePerCard: 0.5,
  branches: [],
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState<GlobalSettings>(DEFAULTS);
  const [commissionInput, setCommissionInput] = useState('10');
  const [wageInput, setWageInput] = useState('0.50');
  const [newBranch, setNewBranch] = useState('');
  const [savingRates, setSavingRates] = useState(false);
  const [savingBranches, setSavingBranches] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const snap = await getDoc(SETTINGS_DOC);
        if (snap.exists()) {
          const data = snap.data() as GlobalSettings;
          setSettings({ ...DEFAULTS, ...data });
          setCommissionInput(String(data.commissionRate ?? 10));
          setWageInput(String(data.wagePerCard ?? 0.5));
        }
      } catch {
        // Use defaults
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function saveRates() {
    const commission = parseFloat(commissionInput);
    const wage = parseFloat(wageInput);
    if (isNaN(commission) || commission < 0 || commission > 100) {
      Alert.alert('Invalid', 'Commission rate must be between 0 and 100.');
      return;
    }
    if (isNaN(wage) || wage < 0) {
      Alert.alert('Invalid', 'Wage per card must be a positive number.');
      return;
    }
    setSavingRates(true);
    try {
      await setDoc(
        SETTINGS_DOC,
        { commissionRate: commission, wagePerCard: wage, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSettings(prev => ({ ...prev, commissionRate: commission, wagePerCard: wage }));
      Alert.alert('Saved', 'Rates updated successfully.');
    } catch {
      Alert.alert('Error', 'Could not save rates.');
    } finally {
      setSavingRates(false);
    }
  }

  async function addBranch() {
    const name = newBranch.trim();
    if (!name) return;
    if (settings.branches.includes(name)) {
      Alert.alert('Duplicate', 'That branch already exists.');
      return;
    }
    const updated = [...settings.branches, name];
    setSavingBranches(true);
    try {
      await setDoc(
        SETTINGS_DOC,
        { branches: updated, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSettings(prev => ({ ...prev, branches: updated }));
      setNewBranch('');
    } catch {
      Alert.alert('Error', 'Could not add branch.');
    } finally {
      setSavingBranches(false);
    }
  }

  async function removeBranch(branch: string) {
    const updated = settings.branches.filter(b => b !== branch);
    setSavingBranches(true);
    try {
      await setDoc(
        SETTINGS_DOC,
        { branches: updated, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSettings(prev => ({ ...prev, branches: updated }));
    } catch {
      Alert.alert('Error', 'Could not remove branch.');
    } finally {
      setSavingBranches(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronLeft" size={22} color="#fff" />
        </Pressable>
        <AppText style={styles.headerTitle}>Settings</AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.empty}>Loading settings…</AppText>
        ) : (
          <>
            {/* Commission Rate */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#f59e0b18' }]}>
                  <AppIcon name="BadgeDollarSign" size={20} color="#f59e0b" />
                </View>
                <AppText style={styles.sectionTitle}>Commission Rate</AppText>
              </View>
              <AppText style={styles.sectionDesc}>
                Percentage of order value paid to salesmen as commission.
              </AppText>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.input}
                  value={commissionInput}
                  onChangeText={setCommissionInput}
                  keyboardType="decimal-pad"
                  placeholder="10"
                  placeholderTextColor="#ccc"
                />
                <AppText style={styles.inputSuffix}>%</AppText>
              </View>
              <AppText style={styles.currentVal}>
                Current: {settings.commissionRate}% per order
              </AppText>
            </View>

            {/* Wage Rate */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#10b98118' }]}>
                  <AppIcon name="Wallet" size={20} color="#10b981" />
                </View>
                <AppText style={styles.sectionTitle}>Wage Per Card</AppText>
              </View>
              <AppText style={styles.sectionDesc}>
                Amount paid to printers per successfully printed card.
              </AppText>
              <View style={styles.inputRow}>
                <AppText style={styles.inputPrefix}>$</AppText>
                <TextInput
                  style={styles.input}
                  value={wageInput}
                  onChangeText={setWageInput}
                  keyboardType="decimal-pad"
                  placeholder="0.50"
                  placeholderTextColor="#ccc"
                />
              </View>
              <AppText style={styles.currentVal}>
                Current: ${settings.wagePerCard} per card
              </AppText>
            </View>

            {/* Save rates button */}
            <Pressable
              style={[styles.saveBtn, savingRates && styles.saveBtnDisabled]}
              onPress={saveRates}
              disabled={savingRates}
            >
              <AppText style={styles.saveBtnText}>
                {savingRates ? 'Saving…' : 'Save Rates'}
              </AppText>
            </Pressable>

            {/* Branches */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#3b82f618' }]}>
                  <AppIcon name="Home" size={20} color="#3b82f6" />
                </View>
                <AppText style={styles.sectionTitle}>Branches / Workshops</AppText>
              </View>
              <AppText style={styles.sectionDesc}>
                Manage office locations and workshop branches.
              </AppText>

              {/* Branch list */}
              {settings.branches.length === 0 ? (
                <AppText style={styles.noBranches}>No branches added yet.</AppText>
              ) : (
                settings.branches.map(branch => (
                  <View key={branch} style={styles.branchRow}>
                    <AppText style={styles.branchName}>{branch}</AppText>
                    <Pressable
                      style={styles.removeBtn}
                      onPress={() => removeBranch(branch)}
                      hitSlop={8}
                    >
                      <AppText style={styles.removeBtnText}>Remove</AppText>
                    </Pressable>
                  </View>
                ))
              )}

              {/* Add branch */}
              <View style={styles.addBranchRow}>
                <TextInput
                  style={styles.branchInput}
                  value={newBranch}
                  onChangeText={setNewBranch}
                  placeholder="e.g. Phnom Penh HQ"
                  placeholderTextColor="#ccc"
                  onSubmitEditing={addBranch}
                  returnKeyType="done"
                />
                <Pressable
                  style={[styles.addBtn, savingBranches && styles.saveBtnDisabled]}
                  onPress={addBranch}
                  disabled={savingBranches}
                >
                  <AppText style={styles.addBtnText}>+ Add</AppText>
                </Pressable>
              </View>
            </View>

            {/* App Info */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIcon, { backgroundColor: '#7c3aed18' }]}>
                  <AppIcon name="ShieldCheck" size={20} color="#7c3aed" />
                </View>
                <AppText style={styles.sectionTitle}>App Info</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>App Name</AppText>
                <AppText style={styles.infoValue}>SITEHUB</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Version</AppText>
                <AppText style={styles.infoValue}>1.0.0</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Platform</AppText>
                <AppText style={styles.infoValue}>React Native / Expo</AppText>
              </View>
              <View style={styles.infoRow}>
                <AppText style={styles.infoLabel}>Database</AppText>
                <AppText style={styles.infoValue}>Firebase Firestore</AppText>
              </View>
            </View>
          </>
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
  scroll: { padding: 16, paddingBottom: 60, gap: 14 },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  section: { backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 6, elevation: 2 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  sectionIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: NAVY },
  sectionDesc: { fontSize: 12, color: '#888', lineHeight: 18 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  inputPrefix: { fontSize: 18, fontWeight: '700', color: '#555' },
  inputSuffix: { fontSize: 18, fontWeight: '700', color: '#555' },
  input: { flex: 1, backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E4FF', paddingHorizontal: 14, height: 48, fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  currentVal: { fontSize: 12, color: '#aaa' },
  saveBtn: { backgroundColor: NAVY, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  saveBtnDisabled: { opacity: 0.5 },
  saveBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noBranches: { fontSize: 13, color: '#aaa', textAlign: 'center', paddingVertical: 8 },
  branchRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#F8F9FF', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  branchName: { fontSize: 14, fontWeight: '600', color: '#1A1A2E' },
  removeBtn: { backgroundColor: '#FFE5E5', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  removeBtnText: { fontSize: 12, fontWeight: '700', color: '#E74C3C' },
  addBranchRow: { flexDirection: 'row', gap: 10, alignItems: 'center' },
  branchInput: { flex: 1, backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E4FF', paddingHorizontal: 14, height: 44, fontSize: 14, color: '#1A1A2E' },
  addBtn: { backgroundColor: NAVY, borderRadius: 12, paddingHorizontal: 16, height: 44, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4, borderBottomWidth: 1, borderBottomColor: '#f5f5f5' },
  infoLabel: { fontSize: 13, color: '#888' },
  infoValue: { fontSize: 13, fontWeight: '600', color: '#1A1A2E' },
});

