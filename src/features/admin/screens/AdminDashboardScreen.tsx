import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/src/services/firebaseClient';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useRoleFlags } from '@/src/hooks/useRoleFlags';

const adminTheme = theme.roles.admin;
const NAVY = adminTheme.primary;
const NAVY_SOFT = adminTheme.background;

const MENU = [
  { title: 'Users',     desc: 'Staff accounts & roles',      icon: 'User' as const,           color: '#10b981', route: '/admin/users' },
  { title: 'Orders',    desc: 'All orders & status',         icon: 'ClipboardList' as const,  color: '#3b82f6', route: '/admin/orders' },
  { title: 'NFC Logs',  desc: 'Chip write & verify logs',    icon: 'Nfc' as const,            color: '#7c3aed', route: '/admin/nfc-logs' },
  { title: 'Salary',    desc: 'Wages & commission',          icon: 'BadgeDollarSign' as const, color: '#f59e0b', route: '/admin/salary' },
  { title: 'QA Videos', desc: 'Review proof recordings',     icon: 'FileVideo' as const,      color: '#ef4444', route: '/admin/qa-videos' },
  { title: 'Reports',   desc: 'Revenue & performance',       icon: 'Wallet' as const,         color: '#06b6d4', route: '/admin/reports' },
  { title: 'Products',  desc: 'Cards, prices & stock',       icon: 'Package' as const,        color: '#8b5cf6', route: '/admin/products' },
  { title: 'Settings',  desc: 'Rates, branches & config',    icon: 'Settings' as const,       color: '#64748b', route: '/admin/settings' },
];

export default function AdminDashboardScreen() {
  const { user, signOutUser } = useAuth();
  const { isAdmin } = useRoleFlags();
  const [stats, setStats] = useState({ orders: 0, revenue: 0, pending: 0, todayOrders: 0 });

  useEffect(() => {
    async function load() {
      try {
        const snap = await getDocs(collection(db, 'orders'));
        const orders = snap.docs.map(d => d.data());
        const today = new Date(); today.setHours(0,0,0,0);
        setStats({
          orders: orders.length,
          revenue: orders.filter(o => o.paymentStatus === 'paid').reduce((s, o) => s + (o.quantity ?? 1) * 49, 0),
          pending: orders.filter(o => ['printing','nfc_writing','nfc_verification'].includes(o.status)).length,
          todayOrders: orders.filter(o => o.createdAt?.toDate?.() >= today).length,
        });
      } catch {}
    }
    load();
  }, []);

  async function handleSignOut() {
    if (__DEV__) {
      console.debug('[admin/logout] sign-out pressed', { email: user?.email, role: user?.role });
    }
    await signOutUser();
    if (__DEV__) {
      console.debug('[admin/logout] auth state cleared; navigating to login');
    }
    router.replace('/auth/login');
  }

  if (!isAdmin) return <Redirect href="/auth/login" />;

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header with profile + logout */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <AppText style={styles.headerSub}>ADMIN PANEL</AppText>
          <AppText style={styles.headerTitle}>Dashboard</AppText>
          <AppText style={styles.headerEmail}>{user?.email}</AppText>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.avatar}>
            <AppText style={styles.avatarText}>{(user?.displayName ?? 'A')[0].toUpperCase()}</AppText>
          </View>
          <Pressable
            accessibilityLabel="Sign out"
            accessibilityRole="button"
            style={styles.logoutBtn}
            onPress={handleSignOut}
            hitSlop={8}
          >
            <AppIcon name="LogOut" size={18} color="rgba(255,255,255,0.8)" />
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Stats grid */}
        <View style={styles.statsGrid}>
          {[
            { label: 'Total Orders', value: stats.orders,      color: '#3b82f6' },
            { label: 'Revenue ($)',  value: `$${stats.revenue}`,color: '#10b981' },
            { label: 'In Progress',  value: stats.pending,     color: '#f59e0b' },
            { label: 'Today',        value: stats.todayOrders, color: '#7c3aed' },
          ].map(s => (
            <View key={s.label} style={styles.statCard}>
              <AppText style={[styles.statNum, { color: s.color }]}>{s.value}</AppText>
              <AppText style={styles.statLabel}>{s.label}</AppText>
            </View>
          ))}
        </View>

        {/* Menu */}
        <AppText style={styles.sectionTitle}>Management</AppText>
        <View style={styles.menuGrid}>
          {MENU.map(item => (
            <Pressable key={item.title} style={styles.menuCard} onPress={() => router.push(item.route as any)}>
              <View style={[styles.menuIcon, { backgroundColor: item.color + '18' }]}>
                <AppIcon name={item.icon} size={24} color={item.color} />
              </View>
              <AppText style={styles.menuTitle}>{item.title}</AppText>
              <AppText style={styles.menuDesc}>{item.desc}</AppText>
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: NAVY_SOFT },
  header: { backgroundColor: NAVY, flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16 },
  headerLeft: { flex: 1, gap: 2 },
  headerSub: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  headerTitle: { color: '#fff', fontSize: 26, fontWeight: '700' },
  headerEmail: { color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 },
  headerRight: { alignItems: 'center', gap: 8 },
  avatar: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#3b82f6', alignItems: 'center', justifyContent: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  logoutBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.15)', alignItems: 'center', justifyContent: 'center' },
  scroll: { padding: 16, paddingBottom: 40, gap: 16 },
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  statCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 14, gap: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  statNum: { fontSize: 26, fontWeight: '700' },
  statLabel: { fontSize: 12, color: '#888' },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: adminTheme.text },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  menuCard: { width: '47%', backgroundColor: '#fff', borderRadius: 18, padding: 16, gap: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  menuIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  menuTitle: { fontSize: 15, fontWeight: '700', color: adminTheme.text },
  menuDesc: { fontSize: 11, color: '#888', lineHeight: 15 },
});

