import { useState } from 'react';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { roleOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { UserRole } from '@/src/types/models';

export function RegisterScreen() {
  const { signUp } = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>('customer');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleRegister() {
    if (!displayName.trim() || !email.trim() || password.length < 6) {
      Alert.alert('Missing details', 'Name, valid email, and 6+ char password are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await signUp({ displayName, email, password, role });
      router.replace('/(tabs)');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to create account right now.';
      Alert.alert('Sign up failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.hero}>
        <AppText variant="h1">Create Account</AppText>
        <AppText variant="body" tone="muted">
          Choose your role to load the right workflow.
        </AppText>
      </View>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Display name" value={displayName} onChangeText={setDisplayName} placeholder="Jane Tan" />
          <AppInput
            label="Email"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            placeholder="jane@company.com"
          />
          <AppInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            placeholder="At least 6 characters"
          />

          <View style={styles.roleBlock}>
            <AppText variant="caption" tone="muted">
              Role
            </AppText>
            <View style={styles.roleRow}>
              {roleOptions.map((option) => (
                <Pressable
                  key={option.value}
                  style={[styles.roleOption, role === option.value && styles.roleOptionActive]}
                  onPress={() => setRole(option.value)}
                >
                  <AppText variant="caption" tone={role === option.value ? 'inverse' : 'primary'}>
                    {option.label}
                  </AppText>
                </Pressable>
              ))}
            </View>
          </View>

          <AppButton label="Create Account" loading={isSubmitting} onPress={handleRegister} />
        </View>
      </AppCard>

      <View style={styles.footer}>
        <AppText variant="caption" tone="muted">
          Already have an account?
        </AppText>
        <Pressable onPress={() => router.replace('/auth/login')}>
          <AppText variant="caption">Sign in</AppText>
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
  roleBlock: {
    gap: theme.spacing.xs,
  },
  roleRow: {
    flexDirection: 'row',
    gap: theme.spacing.xs,
  },
  roleOption: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: '#FFFFFF',
  },
  roleOptionActive: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
});
