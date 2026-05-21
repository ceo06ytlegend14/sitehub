import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';

export function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGuestLoading, setIsGuestLoading] = useState(false);
  const { signIn, signInAsGuest } = useAuth();

  async function handleLogin() {
    if (!email.trim() || !password) {
      Alert.alert('Missing details', 'Please enter your email and password.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn({ email, password });
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to sign in right now.';
      Alert.alert('Sign in failed', message);
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
      Alert.alert('Error', 'Unable to continue as guest right now.');
    } finally {
      setIsGuestLoading(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <AppText variant="h1">Bio Cloud</AppText>
        <AppText variant="body" tone="muted">
          Internal tools + customer card pages in one app.
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
          <AppButton label="Sign In" loading={isSubmitting} onPress={handleLogin} />
        </View>
      </AppCard>

      <AppButton
        label="Continue as Guest"
        loading={isGuestLoading}
        onPress={handleGuestLogin}
        variant="ghost"
      />

      <View style={styles.row}>
        <AppText variant="caption" tone="muted">
          New here?
        </AppText>
        <Pressable onPress={() => router.push('/auth/register')}>
          <AppText variant="caption">Create an account</AppText>
        </Pressable>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  hero: {
    gap: theme.spacing.xs,
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  form: {
    gap: theme.spacing.md,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
