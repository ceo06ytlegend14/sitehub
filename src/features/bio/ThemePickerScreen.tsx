import { Pressable, StyleSheet, View } from 'react-native';
import { AppCard } from '@/src/components/AppCard';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { bioThemeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { BioTheme } from '@/src/types/models';

export function ThemePickerScreen() {
  const { user } = useAuth();
  const { bioPage, saveBioPage } = useBioPage(user?.id ?? '');

  async function handleSelect(value: BioTheme) {
    if (!bioPage) return;
    await saveBioPage({ ...bioPage, theme: value });
  }

  const current = bioPage?.theme ?? 'vibrant_pink';

  return (
    <ScreenContainer>
      <AppText variant="h1">Choose a Vibe</AppText>
      <AppText variant="body" tone="muted">
        Pick the look for your public bio page.
      </AppText>

      {bioThemeOptions.map((opt) => {
        const isSelected = current === opt.value;
        return (
          <Pressable key={opt.value} onPress={() => handleSelect(opt.value)}>
            <AppCard style={[styles.card, isSelected && { borderColor: opt.accent, borderWidth: 2 }]}>
              {/* Preview swatch */}
              <View style={[styles.swatch, { backgroundColor: opt.bg }]}>
                <View style={[styles.swatchBar, { backgroundColor: opt.accent }]} />
                <View style={[styles.swatchDot, { backgroundColor: opt.accent }]} />
              </View>
              {/* Info */}
              <View style={styles.info}>
                <AppText variant="h2">{opt.label}</AppText>
                <AppText variant="caption" tone="muted">
                  {isSelected ? 'Currently selected' : 'Tap to apply'}
                </AppText>
              </View>
              {isSelected ? (
                <AppIcon name="ShieldCheck" size={20} color={opt.accent} />
              ) : null}
            </AppCard>
          </Pressable>
        );
      })}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  card: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md },
  swatch: { width: 72, height: 72, borderRadius: theme.radius.lg, justifyContent: 'flex-end', padding: theme.spacing.sm, gap: 4 },
  swatchBar: { height: 8, borderRadius: theme.radius.pill, opacity: 0.8 },
  swatchDot: { width: 20, height: 20, borderRadius: 10, alignSelf: 'flex-end' },
  info: { flex: 1, gap: 2 },
});
