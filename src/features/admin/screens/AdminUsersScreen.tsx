import { useEffect, useState } from 'react';
import {
  Alert, Modal, Pressable, ScrollView,
  StyleSheet, TextInput, View,
} from 'react-native';
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs, doc, updateDoc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { UserRole } from '@/src/types/models';
import { useAuth } from '@/src/hooks/useAuth';
import { createManagedUser, getAuthErrorMessage } from '@/src/services/authService';
import { normalizeRole } from '@/src/utils/authFlow';
import { getRoleLabel } from '@/src/utils/roleCapabilities';

// ─── Palette ─────────────────────────────────────────────────────────────────
const adminTheme = theme.roles.admin;
const BLUE = adminTheme.accent;

const ROLE_OPTIONS: { label: string; value: UserRole; color: string }[] = [
  { label: 'Sales',    value: 'sales',    color: '#E91E8C' },
  { label: 'Printer',  value: 'printer',  color: '#00BCD4' },
  { label: 'Admin',    value: 'admin',    color: '#7c3aed' },
  { label: 'Super Admin', value: 'super_admin', color: '#111827' },
  { label: 'Customer', value: 'customer', color: '#10b981' },
];

interface StaffUser {
  id: string;
  email: string;
  displayName: string;
  role: UserRole;
  phone?: string;
  branch?: string;
  isActive: boolean;
  createdAt?: string;
}

// ─── Role badge ───────────────────────────────────────────────────────────────
function RoleBadge({ role }: { role: UserRole }) {
  const opt = ROLE_OPTIONS.find(r => r.value === role);
  return (
    <View style={[badge.wrap, { backgroundColor: (opt?.color ?? '#999') + '22' }]}>
      <AppText style={[badge.text, { color: opt?.color ?? '#999' }]}>{getRoleLabel(role).toUpperCase()}</AppText>
    </View>
  );
}
const badge = StyleSheet.create({
  wrap: { borderRadius: 20, paddingHorizontal: 8, paddingVertical: 3 },
  text: { fontSize: 10, fontWeight: '700' },
});

// ─── Main screen ─────────────────────────────────────────────────────────────
export default function AdminUsersScreen() {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === 'super_admin';
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form state
  const [form, setForm] = useState({
    displayName: '',
    email: '',
    password: '',
    role: 'sales' as UserRole,
    phone: '',
    branch: '',
  });

  async function loadUsers() {
    setLoading(true);
    try {
      const snap = await getDocs(query(collection(db, 'users'), orderBy('createdAt', 'desc')));
      const list: StaffUser[] = snap.docs.map(d => {
        const data = d.data();
        return {
          id: d.id,
          email: data.email ?? '',
          displayName: data.displayName ?? '',
          role: normalizeRole(data.role),
          phone: data.phone,
          branch: data.branch,
          isActive: data.isActive !== false,
          createdAt: data.createdAt?.toDate?.()?.toLocaleDateString() ?? '',
        };
      });
      setUsers(list);
    } catch {
      Alert.alert('Error', 'Could not load users. Check Firestore rules.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadUsers(); }, []);

  async function handleCreate() {
    const normalizedEmail = form.email.trim().toLowerCase();
    if (!form.displayName.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) || form.password.length < 6) {
      Alert.alert('Required', 'Name, valid email, and password (6+ chars) are required.');
      return;
    }
    if (users.some(u => u.email.toLowerCase() === normalizedEmail)) {
      Alert.alert('Duplicate', 'That email is already registered.');
      return;
    }
    if (form.role === 'super_admin' && !isSuperAdmin) {
      Alert.alert('Super admin required', 'Only a super admin can create another super admin account.');
      return;
    }
    setSaving(true);
    try {
      await createManagedUser({
        email: normalizedEmail,
        password: form.password,
        displayName: form.displayName,
        role: form.role,
        phone: form.phone,
        branch: form.branch,
        createdBy: currentUser?.id ?? '',
      });

      Alert.alert('Account created', `${form.displayName} (${form.role}) can now log in with ${form.email}. Share the temporary password securely.`);
      setShowModal(false);
      setForm({ displayName: '', email: '', password: '', role: 'sales', phone: '', branch: '' });
      loadUsers();
    } catch (err: any) {
      Alert.alert('Failed', getAuthErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(user: StaffUser) {
    if (user.id === currentUser?.id) {
      Alert.alert('Not allowed', 'You cannot disable your own account.');
      return;
    }
    if (user.role === 'super_admin' && !isSuperAdmin) {
      Alert.alert('Super admin required', 'Only a super admin can disable a super admin account.');
      return;
    }
    try {
      await updateDoc(doc(db, 'users', user.id), {
        isActive: !user.isActive,
        updatedBy: currentUser?.id ?? '',
        updatedAt: serverTimestamp(),
      });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, isActive: !u.isActive } : u));
    } catch {
      Alert.alert('Error', 'Could not update user.');
    }
  }

  const filtered = users.filter(u =>
    u.displayName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const counts = {
    total: users.length,
    sales: users.filter(u => u.role === 'sales').length,
    printer: users.filter(u => u.role === 'printer').length,
    admin: users.filter(u => u.role === 'admin').length,
    superAdmin: users.filter(u => u.role === 'super_admin').length,
  };
  const assignableRoles = isSuperAdmin
    ? ROLE_OPTIONS
    : ROLE_OPTIONS.filter(option => option.value !== 'super_admin');

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <AppIcon name="ChevronRight" size={22} color="#fff" style={{ transform: [{ rotate: '180deg' }] }} />
        </Pressable>
        <AppText style={styles.headerTitle}>User Management</AppText>
        <Pressable style={styles.addBtn} onPress={() => setShowModal(true)}>
          <AppIcon name="User" size={20} color="#fff" />
          <AppText style={styles.addBtnText}>+ Add</AppText>
        </Pressable>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        {[
          { label: 'Total', value: counts.total, color: BLUE },
          { label: 'Sales', value: counts.sales, color: '#E91E8C' },
          { label: 'Printer', value: counts.printer, color: '#00BCD4' },
          { label: 'Admin', value: counts.admin, color: '#7c3aed' },
          { label: 'Super', value: counts.superAdmin, color: '#111827' },
        ].map(s => (
          <View key={s.label} style={styles.statCard}>
            <AppText style={[styles.statNum, { color: s.color }]}>{s.value}</AppText>
            <AppText style={styles.statLabel}>{s.label}</AppText>
          </View>
        ))}
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <AppIcon name="User" size={16} color={theme.colors.textMuted} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by name, email, role…"
          placeholderTextColor={theme.colors.textMuted}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      {/* User list */}
      <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
        {loading ? (
          <AppText style={styles.emptyText}>Loading users…</AppText>
        ) : filtered.length === 0 ? (
          <AppText style={styles.emptyText}>No users found.</AppText>
        ) : (
          filtered.map(u => (
            <View key={u.id} style={[styles.userCard, !u.isActive && styles.userCardInactive]}>
              <View style={styles.userLeft}>
                <View style={[styles.userAvatar, { backgroundColor: ROLE_OPTIONS.find(r => r.value === u.role)?.color ?? '#999' }]}>
                  <AppText style={styles.userAvatarText}>{(u.displayName || u.email)[0].toUpperCase()}</AppText>
                </View>
                <View style={styles.userInfo}>
                  <AppText style={styles.userName}>{u.displayName || '—'}</AppText>
                  <AppText style={styles.userEmail}>{u.email}</AppText>
                  {u.phone ? <AppText style={styles.userMeta}>{u.phone}</AppText> : null}
                  {u.branch ? <AppText style={styles.userMeta}>{u.branch}</AppText> : null}
                  <AppText style={styles.userDate}>{u.createdAt}</AppText>
                </View>
              </View>
              <View style={styles.userRight}>
                <RoleBadge role={u.role} />
                <Pressable
                  style={[styles.statusBtn, { backgroundColor: u.isActive ? '#EDFAF4' : '#FFE5E5' }]}
                  onPress={() => handleToggleActive(u)}
                >
                  <AppText style={[styles.statusBtnText, { color: u.isActive ? '#2BC48A' : '#E74C3C' }]}>
                    {u.isActive ? 'Active' : 'Inactive'}
                  </AppText>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Create Account Modal */}
      <Modal visible={showModal} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <AppText style={styles.modalTitle}>Create Account</AppText>
            <Pressable onPress={() => setShowModal(false)}>
              <AppText style={styles.modalCancel}>Cancel</AppText>
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.modalBody}>
            <AppText style={styles.fieldLabel}>Display Name *</AppText>
            <TextInput style={styles.input} value={form.displayName} onChangeText={v => setForm(f => ({ ...f, displayName: v }))}
              placeholder="e.g. Phorn Penh" placeholderTextColor="#ccc" autoCapitalize="words" />

            <AppText style={styles.fieldLabel}>Email *</AppText>
            <TextInput style={styles.input} value={form.email} onChangeText={v => setForm(f => ({ ...f, email: v }))}
              placeholder="user@company.com" placeholderTextColor="#ccc" keyboardType="email-address" autoCapitalize="none" />

            <AppText style={styles.fieldLabel}>Password * (min 6 chars)</AppText>
            <TextInput style={styles.input} value={form.password} onChangeText={v => setForm(f => ({ ...f, password: v }))}
              placeholder="Set a password" placeholderTextColor="#ccc" secureTextEntry />

            <AppText style={styles.fieldLabel}>Phone</AppText>
            <TextInput style={styles.input} value={form.phone} onChangeText={v => setForm(f => ({ ...f, phone: v }))}
              placeholder="+855 12 345 678" placeholderTextColor="#ccc" keyboardType="phone-pad" />

            <AppText style={styles.fieldLabel}>Branch / Workshop</AppText>
            <TextInput style={styles.input} value={form.branch} onChangeText={v => setForm(f => ({ ...f, branch: v }))}
              placeholder="e.g. Phnom Penh HQ" placeholderTextColor="#ccc" />

            <AppText style={styles.fieldLabel}>Role *</AppText>
            <View style={styles.roleGrid}>
              {assignableRoles.map(opt => (
                <Pressable
                  key={opt.value}
                  style={[styles.roleOption, form.role === opt.value && { backgroundColor: opt.color, borderColor: opt.color }]}
                  onPress={() => setForm(f => ({ ...f, role: opt.value }))}
                >
                  <AppText style={[styles.roleOptionText, form.role === opt.value && { color: '#fff' }]}>
                    {opt.label}
                  </AppText>
                </Pressable>
              ))}
            </View>

            {/* Preview */}
            <View style={styles.previewCard}>
              <AppText style={styles.previewTitle}>Account Preview</AppText>
              <AppText style={styles.previewRow}>Name: <AppText style={styles.previewVal}>{form.displayName || '—'}</AppText></AppText>
              <AppText style={styles.previewRow}>Email: <AppText style={styles.previewVal}>{form.email || '—'}</AppText></AppText>
              <AppText style={styles.previewRow}>Role: <AppText style={[styles.previewVal, { color: ROLE_OPTIONS.find(r => r.value === form.role)?.color }]}>{getRoleLabel(form.role)}</AppText></AppText>
              <AppText style={styles.previewNote}>
                After creation, this person can log in immediately with the email and password above.
              </AppText>
            </View>

            <Pressable
              style={[styles.createBtn, saving && { opacity: 0.6 }]}
              disabled={saving}
              onPress={handleCreate}
            >
              <AppText style={styles.createBtnText}>{saving ? 'Creating…' : 'Create Account'}</AppText>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: adminTheme.background },
  header: { backgroundColor: BLUE, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingVertical: 14, gap: 12 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { flex: 1, color: '#fff', fontSize: 18, fontWeight: '700' },
  addBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 12, paddingVertical: 7 },
  addBtnText: { color: '#fff', fontSize: 14, fontWeight: '700' },
  statsRow: { flexDirection: 'row', padding: 12, gap: 8 },
  statCard: { flex: 1, backgroundColor: '#fff', borderRadius: 12, padding: 10, alignItems: 'center', gap: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 6, elevation: 2 },
  statNum: { fontSize: 22, fontWeight: '700' },
  statLabel: { fontSize: 11, color: '#888' },
  searchWrap: { flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: '#fff', marginHorizontal: 12, marginBottom: 8, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 1 },
  searchInput: { flex: 1, fontSize: 14, color: theme.colors.textPrimary },
  list: { padding: 12, paddingBottom: 100, gap: 10 },
  emptyText: { textAlign: 'center', color: '#aaa', marginTop: 40, fontSize: 15 },
  userCard: { backgroundColor: '#fff', borderRadius: 16, padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  userCardInactive: { opacity: 0.5 },
  userLeft: { flexDirection: 'row', gap: 12, flex: 1 },
  userAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  userAvatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  userInfo: { flex: 1, gap: 2 },
  userName: { fontSize: 15, fontWeight: '700', color: '#1A1A2E' },
  userEmail: { fontSize: 12, color: '#888' },
  userMeta: { fontSize: 11, color: '#aaa' },
  userDate: { fontSize: 10, color: '#ccc', marginTop: 2 },
  userRight: { alignItems: 'flex-end', gap: 6 },
  statusBtn: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  statusBtnText: { fontSize: 11, fontWeight: '700' },
  // Modal
  modalSafe: { flex: 1, backgroundColor: '#fff' },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalTitle: { fontSize: 18, fontWeight: '700', color: '#1A1A2E' },
  modalCancel: { fontSize: 16, color: BLUE, fontWeight: '600' },
  modalBody: { padding: 16, gap: 6, paddingBottom: 60 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: '#555', marginTop: 10 },
  input: { backgroundColor: '#F8F9FF', borderRadius: 12, borderWidth: 1, borderColor: '#E0E4FF', paddingHorizontal: 14, height: 48, fontSize: 15, color: '#1A1A2E', marginTop: 4 },
  roleGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginTop: 6 },
  roleOption: { paddingHorizontal: 18, paddingVertical: 10, borderRadius: 12, borderWidth: 2, borderColor: '#E0E4FF', backgroundColor: '#F8F9FF' },
  roleOptionText: { fontSize: 14, fontWeight: '600', color: '#555' },
  previewCard: { backgroundColor: '#F8F9FF', borderRadius: 14, padding: 14, marginTop: 16, gap: 4, borderWidth: 1, borderColor: '#E0E4FF' },
  previewTitle: { fontSize: 13, fontWeight: '700', color: '#1A1A2E', marginBottom: 4 },
  previewRow: { fontSize: 13, color: '#888' },
  previewVal: { fontWeight: '700', color: '#1A1A2E' },
  previewNote: { fontSize: 11, color: '#aaa', marginTop: 6, lineHeight: 16 },
  createBtn: { backgroundColor: BLUE, borderRadius: 16, height: 54, alignItems: 'center', justifyContent: 'center', marginTop: 20 },
  createBtnText: { color: '#fff', fontSize: 17, fontWeight: '700' },
});

