import React, { useMemo, useState } from 'react';
import { Alert, Pressable, SafeAreaView, StyleSheet, View } from 'react-native';
import { Body, Caption, H1, H2, colors, spacing } from '@/design-system';
import { CreditCard, ShieldCheck, UserRound, Video } from 'lucide-react-native';

type EncodeState = 'idle' | 'writing' | 'success' | 'locked';

export default function NfcEncodeScreen() {
  const [status, setStatus] = useState<EncodeState>('idle');

  const statusLabel = useMemo(() => {
    if (status === 'writing') return 'Programming...';
    if (status === 'success') return 'Success';
    if (status === 'locked') return 'Chip already locked';
    return 'Hold card near NFC antenna';
  }, [status]);

  const onWrite = () => {
    setStatus('writing');
    setTimeout(() => {
      const hasError = Math.random() > 0.5;
      if (hasError) {
        setStatus('locked');
        return;
      }
      setStatus('success');
      Alert.alert('Complete', 'Job ORD-8829 chip locked. Continue to QA video.');
    }, 1700);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <CreditCard color={colors.secondary} size={22} />
        <H1>SiteHub Man</H1>
      </View>

      <View style={styles.card}>
        <Caption muted>ACTIVE JOB</Caption>
        <H2>Encoding Job #ORD-8829</H2>
        <View style={styles.row}>
          <UserRound color={colors.textMuted} size={16} />
          <Body muted>Customer: Jane Smith</Body>
        </View>
      </View>

      <View style={styles.stepRow}>
        <View style={styles.step}>
          <ShieldCheck color={colors.success} size={18} />
          <Caption muted>Print</Caption>
        </View>
        <View style={styles.stepActive}>
          <CreditCard color={colors.white} size={18} />
          <Caption style={styles.stepActiveText}>Encode</Caption>
        </View>
        <View style={styles.step}>
          <Video color={colors.textMuted} size={18} />
          <Caption muted>QA Video</Caption>
        </View>
      </View>

      <View style={styles.nfcZone}>
        <View style={styles.nfcCore}>
          <CreditCard color={colors.primary} size={42} />
        </View>
        <Body>{statusLabel}</Body>
        {status === 'locked' && <Caption muted>This card was already programmed and secured.</Caption>}
      </View>

      <Pressable
        style={[styles.writeButton, status === 'writing' && styles.writeButtonDisabled]}
        disabled={status === 'writing'}
        onPress={onWrite}
      >
        <Body style={styles.writeButtonText}>Write & Lock Chip</Body>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.lg,
    gap: spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 14,
    padding: spacing.lg,
    gap: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  stepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  step: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepActive: {
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.primary,
    borderRadius: 999,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  stepActiveText: {
    color: colors.white,
  },
  nfcZone: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sm,
  },
  nfcCore: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.surface,
    borderWidth: 2,
    borderColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  writeButton: {
    height: 52,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
  },
  writeButtonDisabled: {
    opacity: 0.6,
  },
  writeButtonText: {
    color: colors.white,
    fontWeight: '600',
  },
});
