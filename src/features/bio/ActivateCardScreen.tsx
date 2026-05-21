import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { activateNfcCard, linkCardToBio } from '@/src/services/firestoreService';

export function ActivateCardScreen() {
  const { user } = useAuth();
  const { bioPage } = useBioPage(user?.id ?? '');
  const [cardCode, setCardCode] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function handleActivate() {
    if (!user) return;
    if (!cardCode.trim()) {
      Alert.alert('Card code required', 'Enter the NFC card code printed on the card.');
      return;
    }

    setIsSaving(true);
    try {
      await activateNfcCard(user, cardCode.trim());
      if (bioPage?.slug) {
        await linkCardToBio(cardCode.trim(), bioPage.slug);
      }
      Alert.alert('Card activated', 'Your card is now linked to your account.');
      setCardCode('');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to activate card.';
      Alert.alert('Activation failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="h1">Activate Card</AppText>
      <AppText variant="body" tone="muted">
        Link your NFC card to your Bio Cloud page.
      </AppText>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Card code" value={cardCode} onChangeText={setCardCode} placeholder="NFC-8922-1A2B" />
          <AppButton label="Activate Now" loading={isSaving} onPress={handleActivate} />
          <AppText variant="caption" tone="muted">
            If your bio page already exists, we will auto-link this card.
          </AppText>
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.sm,
  },
});

