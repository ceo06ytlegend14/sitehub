import { useEffect, useState } from 'react';
import {
  Alert, KeyboardAvoidingView, Platform,
  Pressable, ScrollView, StyleSheet, TextInput, View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { getAuthErrorMessage } from '@/src/services/authService';
import { getDashboardRoute } from '@/src/utils/authFlow';

const ENABLE_DEMO = process.env.EXPO_PUBLIC_ENABLE_DEMO_ACCOUNTS === 'true';
const brand = theme.roles.printer;

const DEMO_ACCOUNTS = [
  { label: 'Sales',    email: 'sales@demo.com',   password: 'demo1234', color: theme.roles.sales.primary },
  { label: 'Printer',  email: 'printer@demo.com',  password: 'demo1234', color: theme.roles.printer.primary },
  { label: 'Admin',    email: 'admin@demo.com',    password: 'demo1234', color: theme.roles.admin.accent },
  { label: 'Sales 2',  email: 'sales2@demo.com',   password: 'demo1234', color: theme.roles.sales.primary },
];

let demoIndex = 0;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const { user, isLoading, signIn, signInAsGuest } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardRoute(user));
    }
  }, [isLoading, user]);

  function fillDemo() {
    const acc = DEMO_ACCOUNTS[demoIndex % DEMO_ACCOUNTS.length];
    setEmail(acc.email);
    setPassword(acc.password);
    demoIndex = (demoIndex + 1) % DEMO_ACCOUNTS.length;
  }

  async function signInDemoAccount(acc: (typeof DEMO_ACCOUNTS)[number]) {
    if (busy) return;
    setEmail(acc.email);
    setPassword(acc.password);
    setIsSubmitting(true);
    try {
      const signedInUser = await signIn({ email: acc.email, password: acc.password });
      router.replace(getDashboardRoute(signedInUser));
    } catch (error) {
      Alert.alert('Demo sign in failed', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleLogin() {
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }
    setIsSubmitting(true);
    try {
      const signedInUser = await signIn({ email: normalizedEmail, password });
      router.replace(getDashboardRoute(signedInUser));
    } catch (error) {
      Alert.alert('Sign in failed', getAuthErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuest() {
    setIsGuestLoading(true);
    try {
      await signInAsGuest();
      router.replace('/(tabs)');
    } catch (error) {
      Alert.alert('Error', getAuthErrorMessage(error));
    } finally {
      setIsGuestLoading(false);
    }
  }

  const busy = isSubmitting || isGuestLoading || isLoading;

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          bounces={false}
        >
          <LinearGradient
            colors={[brand.primary, brand.primaryDark]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.headerHero}
          >
            <View style={styles.circleAccent} />
            <View style={styles.logoWrap}>
              <AppIcon name="Nfc" size={28} color="#fff" />
              <AppText style={styles.logoText}>SITEHUB</AppText>
              <AppText style={styles.logoSub}>NFC Smart Card Platform</AppText>
            </View>
          </LinearGradient>

          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Welcome back</AppText>
            <AppText style={styles.cardSub}>Sign in to your account</AppText>

            <View style={styles.fieldWrap}>
              <AppText style={styles.fieldLabel}>Email</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="User" size={18} color={brand.muted} style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@company.com"
                  placeholderTextColor={brand.muted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!busy}
                />
              </View>
            </View>

            <View style={styles.fieldWrap}>
              <AppText style={styles.fieldLabel}>Password</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="ShieldCheck" size={18} color={brand.muted} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor={brand.muted}
                  secureTextEntry={!showPassword}
                  editable={!busy}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                  <AppIcon name={showPassword ? 'EyeOff' : 'Eye'} size={18} color={brand.muted} />
                </Pressable>
              </View>
            </View>

            <Pressable
              style={[styles.signInBtn, busy && styles.btnDisabled]}
              onPress={handleLogin}
              disabled={busy}
            >
              {isSubmitting ? (
                <AppText style={styles.signInBtnText}>Signing in…</AppText>
              ) : (
                <>
                  <AppIcon name="LogOut" size={18} color="#fff" />
                  <AppText style={styles.signInBtnText}>Sign In</AppText>
                </>
              )}
            </Pressable>

            <Pressable
              style={[styles.guestBtn, busy && styles.btnDisabled]}
              onPress={handleGuest}
              disabled={busy}
            >
              <AppText style={styles.guestBtnText}>
                {isGuestLoading ? 'Loading…' : 'Continue as Guest'}
              </AppText>
            </Pressable>
          </View>

          {ENABLE_DEMO && (
            <View style={styles.demoWrap}>
              <AppText style={styles.demoTitle}>Quick Demo Access</AppText>
              <View style={styles.demoGrid}>
                {DEMO_ACCOUNTS.map((acc) => (
                  <Pressable
                    key={acc.email}
                    style={[styles.demoChip, { backgroundColor: acc.color + '14' }]}
                    onPress={() => signInDemoAccount(acc)}
                    disabled={busy}
                  >
                    <AppText style={[styles.demoChipText, { color: acc.color }]}>{acc.label}</AppText>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.demoCycleBtn} onPress={fillDemo} disabled={busy}>
                <AppIcon name="ChevronRight" size={14} color={brand.muted} />
                <AppText style={styles.demoCycleText}>Cycle demo accounts</AppText>
              </Pressable>
            </View>
          )}

          <View style={styles.registerRow}>
            <AppText style={styles.registerText}>New here?</AppText>
            <Pressable onPress={() => router.push('/auth/register')} disabled={busy}>
              <AppText style={styles.registerLink}>Create an account</AppText>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: brand.background },
  kav: { flex: 1 },
  scrollView: { flex: 1 },
  scroll: { flexGrow: 1, paddingBottom: 48, gap: 20 },
  headerHero: {
    overflow: 'hidden',
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 28,
    borderBottomLeftRadius: theme.radius.xl,
    borderBottomRightRadius: theme.radius.xl,
  },
  circleAccent: {
    position: 'absolute',
    top: 24,
    right: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(6,182,212,0.22)',
  },
  logoWrap: { alignItems: 'center', gap: 6 },
  logoText: { fontSize: 26, fontWeight: '700', color: '#fff', letterSpacing: 0 },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.82)' },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: 24,
    gap: 16,
    marginHorizontal: 24,
    ...theme.shadows.card,
  },
  cardTitle: { fontSize: 22, fontWeight: '700', color: brand.text },
  cardSub: { fontSize: 14, color: brand.muted, marginTop: -8 },
  fieldWrap: { gap: 6 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: brand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0,
  },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: brand.soft,
    borderRadius: theme.radius.md,
    paddingHorizontal: 14,
    height: 52,
  },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: brand.text },
  eyeBtn: { padding: 4 },
  signInBtn: {
    backgroundColor: brand.primary,
    borderRadius: theme.radius.md,
    height: 52,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 4,
  },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  guestBtn: {
    borderRadius: theme.radius.md,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: brand.soft,
  },
  guestBtnText: { color: brand.primaryDark, fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  demoWrap: { gap: 10, paddingHorizontal: 24 },
  demoTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: brand.muted,
    textTransform: 'uppercase',
    letterSpacing: 0,
    textAlign: 'center',
  },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  demoChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: theme.radius.pill,
    minWidth: '46%',
    maxWidth: '100%',
    alignItems: 'center',
  },
  demoChipText: { fontSize: 13, fontWeight: '600' },
  demoCycleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  demoCycleText: { fontSize: 12, color: brand.muted },
  registerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 24,
  },
  registerText: { fontSize: 14, color: brand.muted },
  registerLink: { fontSize: 14, fontWeight: '700', color: brand.primary },
});
