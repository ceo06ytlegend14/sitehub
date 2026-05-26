import { useEffect, useRef } from 'react';
import { Animated, Easing, Pressable, StyleSheet, View } from 'react-native';
import { router } from 'expo-router';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_SAMPLE_PROFILE_SLUG } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';

export function GuestNfcDemoScreen() {
  const pulse = useRef(new Animated.Value(0)).current;
  const { requireAccount } = useRequireAccount();

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1200,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  const ringScale = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.35],
  });
  const ringOpacity = pulse.interpolate({
    inputRange: [0, 1],
    outputRange: [0.55, 0],
  });

  function simulateTap() {
    router.push(`/public/${GUEST_SAMPLE_PROFILE_SLUG}`);
  }

  return (
    <ScreenContainer>
      <AppHeader title="NFC Preview" subtitle="Simulated tap — no chip write" showBack={router.canGoBack()} />

      <AppText variant="body" tone="muted">
        Hold your phone near the NFC zone to preview how a tap opens a public profile. Guest mode cannot write real NFC
        chips.
      </AppText>

      <Pressable style={styles.tapZone} onPress={simulateTap} accessibilityRole="button" accessibilityLabel="Simulate NFC tap">
        <Animated.View
          style={[
            styles.ring,
            {
              opacity: ringOpacity,
              transform: [{ scale: ringScale }],
            },
          ]}
        />
        <View style={styles.chip}>
          <AppIcon name="Nfc" size={48} color={theme.colors.primary} />
        </View>
        <AppText variant="h2" style={styles.tapLabel}>
          Tap to simulate
        </AppText>
        <AppText variant="caption" tone="muted">
          Opens sample profile
        </AppText>
      </Pressable>

      <Pressable
        style={styles.writeRow}
        onPress={() =>
          requireAccount(undefined, {
            message: 'Create an account to program and lock NFC chips with your profile URL.',
          })
        }
      >
        <AppIcon name="ShieldCheck" size={18} color={theme.colors.textMuted} />
        <AppText variant="caption" tone="muted">
          Real NFC write requires an account
        </AppText>
      </Pressable>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  tapZone: {
    marginTop: theme.spacing.lg,
    minHeight: 280,
    borderRadius: theme.radius.xl,
    backgroundColor: theme.colors.surfaceSoft,
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    overflow: 'hidden',
  },
  ring: {
    position: 'absolute',
    width: 160,
    height: 160,
    borderRadius: 80,
    borderWidth: 3,
    borderColor: theme.colors.primary,
  },
  chip: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: theme.colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadows.card,
  },
  tapLabel: {
    marginTop: theme.spacing.sm,
  },
  writeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    marginTop: theme.spacing.md,
  },
});
