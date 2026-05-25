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

const DEMO_ACCOUNTS = [
  { label: '🛍 Sales',    email: 'sales@demo.com',   password: 'demo1234', color: theme.roles.sales.primary },
  { label: '🖨 Printer',  email: 'printer@demo.com',  password: 'demo1234', color: theme.roles.printer.primary },
  { label: '🔑 Admin',    email: 'admin@demo.com',    password: 'demo1234', color: theme.roles.admin.accent },
  { label: '📋 Sales 2',  email: 'sales2@demo.com',   password: 'demo1234', color: theme.roles.sales.primary },
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
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={['#0B1220', '#0F1F3D', '#0A2A4A']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative circles */}
      <View style={styles.circle1} />
      <View style={styles.circle2} />

      <KeyboardAvoidingView
        style={styles.kav}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo */}
          <View style={styles.logoWrap}>
            <View style={styles.logoIcon}>
              <AppIcon name="Nfc" size={32} color="#fff" />
            </View>
            <AppText style={styles.logoText}>SITEHUB</AppText>
            <AppText style={styles.logoSub}>NFC Smart Card Platform</AppText>
          </View>

          {/* Card */}
          <View style={styles.card}>
            <AppText style={styles.cardTitle}>Welcome back</AppText>
            <AppText style={styles.cardSub}>Sign in to your account</AppText>

            {/* Email */}
            <View style={styles.fieldWrap}>
              <AppText style={styles.fieldLabel}>Email</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="User" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="name@company.com"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  editable={!busy}
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.fieldWrap}>
              <AppText style={styles.fieldLabel}>Password</AppText>
              <View style={styles.inputWrap}>
                <AppIcon name="ShieldCheck" size={18} color="rgba(255,255,255,0.4)" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="Enter your password"
                  placeholderTextColor="rgba(255,255,255,0.3)"
                  secureTextEntry={!showPassword}
                  editable={!busy}
                />
                <Pressable onPress={() => setShowPassword(v => !v)} hitSlop={8} style={styles.eyeBtn}>
                  <AppIcon name="ChevronRight" size={18} color="rgba(255,255,255,0.4)" />
                </Pressable>
              </View>
            </View>

            {/* Sign In button */}
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

            {/* Guest */}
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

          {/* Demo accounts */}
          {ENABLE_DEMO && (
            <View style={styles.demoWrap}>
              <AppText style={styles.demoTitle}>Quick Demo Access</AppText>
              <View style={styles.demoGrid}>
                {DEMO_ACCOUNTS.map((acc, i) => (
                  <Pressable
                    key={acc.email}
                    style={[styles.demoChip, { borderColor: acc.color + '60' }]}
                    onPress={() => { setEmail(acc.email); setPassword(acc.password); }}
                    disabled={busy}
                  >
                    <AppText style={[styles.demoChipText, { color: acc.color }]}>{acc.label}</AppText>
                  </Pressable>
                ))}
              </View>
              <Pressable style={styles.demoCycleBtn} onPress={fillDemo} disabled={busy}>
                <AppIcon name="ChevronRight" size={14} color="rgba(255,255,255,0.5)" />
                <AppText style={styles.demoCycleText}>Cycle demo accounts</AppText>
              </Pressable>
            </View>
          )}

          {/* Register link */}
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
  safe: { flex: 1 },
  kav: { flex: 1 },
  scroll: { flexGrow: 1, padding: 24, paddingBottom: 48, gap: 24, justifyContent: 'center' },
  // Decorative
  circle1: { position: 'absolute', top: -80, right: -60, width: 260, height: 260, borderRadius: 130, backgroundColor: 'rgba(14,186,175,0.12)' },
  circle2: { position: 'absolute', bottom: 60, left: -80, width: 200, height: 200, borderRadius: 100, backgroundColor: 'rgba(233,30,140,0.08)' },
  // Logo
  logoWrap: { alignItems: 'center', gap: 8 },
  logoIcon: { width: 72, height: 72, borderRadius: 22, backgroundColor: 'rgba(14,186,175,0.25)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(14,186,175,0.4)' },
  logoText: { fontSize: 28, fontWeight: '700', color: '#fff', letterSpacing: 2 },
  logoSub: { fontSize: 13, color: 'rgba(255,255,255,0.5)', letterSpacing: 0.5 },
  // Card
  card: { backgroundColor: 'rgba(255,255,255,0.07)', borderRadius: 24, padding: 24, gap: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)' },
  cardTitle: { fontSize: 22, fontWeight: '700', color: '#fff' },
  cardSub: { fontSize: 14, color: 'rgba(255,255,255,0.5)', marginTop: -8 },
  // Fields
  fieldWrap: { gap: 6 },
  fieldLabel: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: 0.5 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 14, borderWidth: 1, borderColor: 'rgba(255,255,255,0.12)', paddingHorizontal: 14, height: 52 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, fontSize: 15, color: '#fff' },
  eyeBtn: { padding: 4 },
  // Buttons
  signInBtn: { backgroundColor: theme.roles.printer.primary, borderRadius: 14, height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 4 },
  signInBtnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  guestBtn: { borderRadius: 14, height: 48, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  guestBtnText: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  btnDisabled: { opacity: 0.5 },
  // Demo
  demoWrap: { gap: 10 },
  demoTitle: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.8, textAlign: 'center' },
  demoGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  demoChip: { paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, backgroundColor: 'rgba(255,255,255,0.05)' },
  demoChipText: { fontSize: 13, fontWeight: '600' },
  demoCycleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4 },
  demoCycleText: { fontSize: 12, color: 'rgba(255,255,255,0.35)' },
  // Register
  registerRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 6 },
  registerText: { fontSize: 14, color: 'rgba(255,255,255,0.4)' },
  registerLink: { fontSize: 14, fontWeight: '700', color: theme.roles.printer.primary },
});
