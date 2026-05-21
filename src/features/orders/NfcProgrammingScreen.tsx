import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { programNfcCardForJob, updatePrinterJob } from '@/src/services/firestoreService';

export function NfcProgrammingScreen() {
  const { user } = useAuth();
  const [jobId, setJobId] = useState('');
  const [cardCode, setCardCode] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleProgram() {
    if (!user) return;
    if (!jobId.trim() || !cardCode.trim()) {
      Alert.alert('Missing data', 'Job ID and card code are required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await programNfcCardForJob({
        jobId: jobId.trim(),
        cardCode: cardCode.trim(),
        programmedBy: user.id,
      });
      await updatePrinterJob(jobId.trim(), 'qa_capture', notes.trim() || 'NFC programmed');
      setJobId('');
      setCardCode('');
      setNotes('');
      Alert.alert('NFC programmed', 'Card programming is saved and moved to QA stage.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to program this card.';
      Alert.alert('Programming failed', message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="h1">NFC Programming</AppText>
      <AppText variant="body" tone="muted">
        Program chip details and move the job to QA.
      </AppText>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="Printer job ID" value={jobId} onChangeText={setJobId} placeholder="job_1234" />
          <AppInput label="NFC card code" value={cardCode} onChangeText={setCardCode} placeholder="NFC-ABCD-29" />
          <AppInput label="Notes" value={notes} onChangeText={setNotes} placeholder="Optional programming note" />
          <AppButton label="Save Programming" loading={isSubmitting} onPress={handleProgram} />
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

