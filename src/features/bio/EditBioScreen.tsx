import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppIcon } from '@/src/components/AppIcon';
import { AppInput } from '@/src/components/AppInput';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';

function SectionHeader({ icon, title }: { icon: React.ComponentProps<typeof AppIcon>['name']; title: string }) {
  return (
    <View style={styles.sectionHeader}>
      <AppIcon name={icon} size={18} color={theme.colors.primary} />
      <AppText variant="caption" tone="muted" style={styles.sectionLabel}>{title}</AppText>
    </View>
  );
}

export function EditBioScreen() {
  const { user } = useAuth();
  const { bioPage, saveBioPage } = useBioPage(user?.id ?? '');

  const [slug, setSlug] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [tagline, setTagline] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [instagram, setInstagram] = useState('');
  const [telegram, setTelegram] = useState('');
  const [email, setEmail] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!bioPage) return;
    setSlug(bioPage.slug);
    setDisplayName(bioPage.displayName);
    setTagline(bioPage.tagline ?? '');
    setWhatsapp(bioPage.whatsapp ?? '');
    setInstagram(bioPage.instagram ?? '');
    setTelegram(bioPage.telegram ?? '');
    setEmail(bioPage.email ?? '');
  }, [bioPage]);

  async function handleSave() {
    if (!displayName.trim()) {
      Alert.alert('Required', 'Display name is required.');
      return;
    }
    if (slug.trim() && !/^[a-z0-9-]{3,40}$/i.test(slug.trim())) {
      Alert.alert('Invalid slug', 'Use 3-40 letters, numbers, or hyphens.');
      return;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      Alert.alert('Invalid email', 'Enter a valid email address.');
      return;
    }
    setIsSaving(true);
    try {
      await saveBioPage({
        slug: slug.trim().toLowerCase() || (user?.id ?? ''),
        displayName: displayName.trim(),
        tagline: tagline.trim() || undefined,
        whatsapp: whatsapp.trim() || undefined,
        instagram: instagram.trim() || undefined,
        telegram: telegram.trim() || undefined,
        email: email.trim() || undefined,
        customLinks: bioPage?.customLinks ?? [],
        theme: bioPage?.theme ?? 'vibrant_pink',
      });
      Alert.alert('Saved ✅', 'Your bio page has been updated.');
    } catch (err) {
      Alert.alert('Save failed', (err as Error).message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient colors={['#9DECF9', '#CBF7EC', '#FFF4D8']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={StyleSheet.absoluteFill} />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Top bar */}
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
            <AppIcon name="ChevronLeft" size={22} color={theme.colors.textPrimary} />
          </Pressable>
          <AppText variant="h2">Edit Bio</AppText>
          <Pressable onPress={() => bioPage && router.push(`/public/${bioPage.slug}`)} style={styles.previewBtn}>
            <AppText variant="caption" style={styles.previewText}>Preview</AppText>
          </Pressable>
        </View>

        {/* Profile */}
        <AppCard>
          <SectionHeader icon="User" title="PROFILE" />
          <View style={styles.fields}>
            <AppInput label="Display name *" value={displayName} onChangeText={setDisplayName} placeholder="Sok Dara" autoCapitalize="words" />
            <AppInput label="Tagline" value={tagline} onChangeText={setTagline} placeholder="Coffee · Code · Khmer poetry" />
            <AppInput label="URL slug" value={slug} onChangeText={setSlug} placeholder="sokdara" autoCapitalize="none" />
          </View>
        </AppCard>

        {/* Social links */}
        <AppCard>
          <SectionHeader icon="Phone" title="SOCIAL LINKS" />
          <View style={styles.fields}>
            <AppInput label="WhatsApp" value={whatsapp} onChangeText={setWhatsapp} placeholder="+855 12 345 678" keyboardType="phone-pad" />
            <AppInput label="Instagram" value={instagram} onChangeText={setInstagram} placeholder="@sokdara" autoCapitalize="none" />
            <AppInput label="Telegram" value={telegram} onChangeText={setTelegram} placeholder="@sokdara_pp" autoCapitalize="none" />
            <AppInput label="Email" value={email} onChangeText={setEmail} placeholder="sok@dara.bio" keyboardType="email-address" autoCapitalize="none" />
          </View>
        </AppCard>

        <AppButton label="Save Bio Page" loading={isSaving} onPress={handleSave} />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  scroll: { padding: theme.spacing.lg, paddingBottom: 120, gap: theme.spacing.md },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: theme.spacing.xs },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(255,255,255,0.7)', alignItems: 'center', justifyContent: 'center' },
  previewBtn: { paddingHorizontal: theme.spacing.sm, paddingVertical: 6, borderRadius: theme.radius.pill, backgroundColor: theme.colors.primary },
  previewText: { color: '#fff', fontWeight: '700' },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, marginBottom: theme.spacing.sm },
  sectionLabel: { textTransform: 'uppercase', letterSpacing: 0, fontSize: 10 },
  fields: { gap: theme.spacing.sm },
});
