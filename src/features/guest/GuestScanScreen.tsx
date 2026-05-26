import { useCallback, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { router } from 'expo-router';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppHeader } from '@/src/components/AppHeader';
import { AppIcon } from '@/src/components/AppIcon';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { GUEST_DEMO_QR_CODES } from '@/src/constants/guestDemo';
import { theme } from '@/src/constants/theme';
import { useRequireAccount } from '@/src/providers/GuestGateProvider';
import { parseScanPayloadToSlug } from '@/src/utils/guestScan';

export function GuestScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [lastScan, setLastScan] = useState<string | null>(null);
  const { requireAccount } = useRequireAccount();

  const openSlug = useCallback((slug: string) => {
    router.push(`/public/${slug}`);
  }, []);

  const onBarcodeScanned = useCallback(
    ({ data }: { data: string }) => {
      if (data === lastScan) return;
      setLastScan(data);
      const slug = parseScanPayloadToSlug(data);
      if (slug) {
        openSlug(slug);
      }
    },
    [lastScan, openSlug]
  );

  return (
    <ScreenContainer>
      <AppHeader title="Scan QR" subtitle="Preview public NFC identities" showBack={router.canGoBack()} />

      {!permission?.granted ? (
        <AppCard style={styles.permissionCard}>
          <AppIcon name="ScanLine" size={32} color={theme.colors.primary} />
          <AppText variant="body" tone="muted">
            Camera access lets you try the scan experience. No scan history is saved in guest mode.
          </AppText>
          <AppButton label="Enable Camera" onPress={() => void requestPermission()} />
        </AppCard>
      ) : (
        <View style={styles.cameraWrap}>
          <CameraView
            style={styles.camera}
            facing="back"
            barcodeScannerSettings={{ barcodeTypes: ['qr'] }}
            onBarcodeScanned={onBarcodeScanned}
          />
          <View style={styles.cameraOverlay}>
            <AppText variant="caption" tone="inverse" style={styles.overlayText}>
              Point at a demo or public profile QR
            </AppText>
          </View>
        </View>
      )}

      <AppText variant="h2">Demo codes</AppText>
      <AppText variant="caption" tone="muted">
        Tap a sample code to open a public profile preview.
      </AppText>
      {GUEST_DEMO_QR_CODES.map((demo) => (
        <Pressable key={demo.id} onPress={() => openSlug(demo.slug)}>
          <AppCard style={styles.demoRow}>
            <AppIcon name="QrCode" size={22} color={theme.colors.primary} />
            <View style={styles.demoCopy}>
              <AppText variant="body" weight="semibold">
                {demo.label}
              </AppText>
              <AppText variant="caption" tone="muted" numberOfLines={1}>
                {demo.payload}
              </AppText>
            </View>
            <AppIcon name="ChevronRight" size={18} color={theme.colors.textMuted} />
          </AppCard>
        </Pressable>
      ))}

      <AppButton
        label="Generate my QR"
        variant="outline"
        iconName="QrCode"
        onPress={() =>
          requireAccount(undefined, {
            message: 'Create an account to generate your personal QR and NFC identity.',
          })
        }
      />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  permissionCard: {
    alignItems: 'center',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.xl,
  },
  cameraWrap: {
    height: 280,
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  cameraOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  overlayText: {
    textAlign: 'center',
    color: '#fff',
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  demoCopy: {
    flex: 1,
    gap: 2,
  },
});
