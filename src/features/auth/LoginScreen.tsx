import { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { getAuthErrorMessage } from '@/src/services/authService';
import { getDashboardRoute } from '@/src/utils/authFlow';

const ENABLE_DEMO_ACCOUNTS = process.env.EXPO_PUBLIC_ENABLE_DEMO_ACCOUNTS === 'true';

const DEMO_ACCOUNTS = [
  { label: 'Sales', email: 'sales@demo.com', password: 'demo1234' },
  { label: 'Printer', email: 'printer@demo.com', password: 'demo1234' },
  { label: 'Admin', email: 'admin@demo.com', password: 'demo1234' },
  { label: 'Sales 2', email: 'sales2@demo.com', password: 'demo1234' },
];

let demoIndex = 0;

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const [demoLabel, setDemoLabel] = useState(DEMO_ACCOUNTS[0].label);
  const { user, isLoading, signIn, signInAsGuest } = useAuth();

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(getDashboardRoute(user));
    }
  }, [isLoading, user]);

  function fillDemo() {
    const account = DEMO_ACCOUNTS[demoIndex % DEMO_ACCOUNTS.length];
    setEmail(account.email);
    setPassword(account.password);
    setDemoLabel(account.label);
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

  async function handleGuestLogin() {
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

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <AppText variant="h1">SITEHUB</AppText>
        <AppText variant="body" tone="muted">
          NFC smart card production platform
        </AppText>
      </View>

      <AppCard>
        <View style={styles.form}>
          <AppText variant="h2">Welcome Back</AppText>
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="name@company.com"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="Enter your password"
          />
          <AppButton
            label="Sign In"
            loading={isSubmitting}
            disabled={isLoading || isGuestLoading}
            onPress={handleLogin}
          />
        </View>
      </AppCard>

      <AppButton
        label="Continue as Guest"
        loading={isGuestLoading}
        disabled={isLoading || isSubmitting}
        onPress={handleGuestLogin}
        variant="ghost"
      />

      {ENABLE_DEMO_ACCOUNTS ? (
        <Pressable style={styles.demoBtn} onPress={fillDemo} disabled={isSubmitting || isGuestLoading}>
          <AppText style={styles.demoBtnText}>Demo: {demoLabel}</AppText>
          <AppText style={styles.demoBtnHint}>tap to cycle accounts</AppText>
        </Pressable>
      ) : null}

      <View style={styles.row}>
        <AppText variant="caption" tone="muted">New here?</AppText>
        <Pressable onPress={() => router.push('/auth/register')} disabled={isSubmitting || isGuestLoading}>
          <AppText variant="caption" style={styles.link}>Create an account</AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: { gap: theme.spacing.xs, marginTop: theme.spacing.sm, marginBottom: theme.spacing.sm },
  form: { gap: theme.spacing.md },
  row: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: theme.spacing.xs },
  link: { color: theme.colors.primary, fontWeight: '600' },
  demoBtn: { backgroundColor: '#FFF8E1', borderRadius: 14, paddingVertical: 12, paddingHorizontal: 20, alignItems: 'center', gap: 2, borderWidth: 1, borderColor: '#FFE082' },
  demoBtnText: { fontSize: 15, fontWeight: '700', color: '#B8860B' },
  demoBtnHint: { fontSize: 11, color: '#B8860B', opacity: 0.7 },
});
