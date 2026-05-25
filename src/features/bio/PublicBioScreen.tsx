import { useEffect, useState } from 'react';
import { Linking, Pressable, ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AppIcon } from '@/src/components/AppIcon';
import { AppText } from '@/src/components/AppText';
import { getPublicBioPageBySlug } from '@/src/services/firestoreService';
import { BioPage } from '@/src/types/models';
import { bioThemeOptions } from '@/src/constants/options';
import { theme } from '@/src/constants/theme';

interface Props { slug: string }

function getThemeStyle(t: BioPage['theme']) {
  return bioThemeOptions.find((o) => o.value === t) ?? bioThemeOptions[0];
}

function SocialButton({ icon, label, url, bg }: { icon: React.ComponentProps<typeof AppIcon>['name']; label: string; url: string; bg: string }) {
  return (
    <Pressable style={[styles.socialBtn, { backgroundColor: bg }]} onPress={() => Linking.openURL(url)}>
      <AppIcon name={icon} size={20} color="#fff" />
      <AppText variant="body" style={styles.socialLabel}>{label}</AppText>
    </Pressable>
  );
}

export function PublicBioScreen({ slug }: Props) {
  const [bioPage, setBioPage] = useState<BioPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPublicBioPageBySlug(slug).then(setBioPage).finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <AppText variant="body" tone="muted">Loading…</AppText>
      </SafeAreaView>
    );
  }

  if (!bioPage) {
    return (
      <SafeAreaView style={styles.center}>
        <AppText variant="h2">Page not found</AppText>
        <AppText variant="body" tone="muted">This bio page does not exist yet.</AppText>
      </SafeAreaView>
    );
  }

  const themeStyle = getThemeStyle(bioPage.theme);
  const profileUrl = `https://biocloud.app/c/${bioPage.slug}`;

  async function handleShare() {
    await Share.share({ message: `${bioPage!.displayName} — ${profileUrl}`, url: profileUrl });
  }

  async function handleSaveContact() {
    // vCard format
    const vcard = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${bioPage!.displayName}`,
      bioPage!.tagline ? `TITLE:${bioPage!.tagline}` : '',
      bioPage!.whatsapp ? `TEL;TYPE=CELL:${bioPage!.whatsapp}` : '',
      bioPage!.email ? `EMAIL:${bioPage!.email}` : '',
      `URL:${profileUrl}`,
      'END:VCARD',
    ].filter(Boolean).join('\n');

    await Share.share({ message: vcard, title: `${bioPage!.displayName} Contact` });
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: themeStyle.bg }]}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Share button top right */}
        <View style={styles.topBar}>
          <View />
          <Pressable onPress={handleShare} style={styles.shareBtn}>
            <AppIcon name="ChevronRight" size={18} color={themeStyle.accent} />
          </Pressable>
        </View>

        {/* Avatar */}
        <View style={styles.avatarWrap}>
          <View style={[styles.avatar, { backgroundColor: themeStyle.accent }]}>
            <AppText style={[styles.avatarText, { color: themeStyle.bg }]}>
              {(bioPage.displayName ?? 'U')[0].toUpperCase()}
            </AppText>
          </View>
        </View>

        {/* Name + tagline */}
        <AppText style={[styles.name, { color: themeStyle.text }]}>{bioPage.displayName}</AppText>
        {bioPage.tagline ? (
          <AppText style={[styles.tagline, { color: themeStyle.text + 'AA' }]}>{bioPage.tagline}</AppText>
        ) : null}

        {/* Save to Contacts */}
        <Pressable style={[styles.saveContactBtn, { backgroundColor: themeStyle.accent }]} onPress={handleSaveContact}>
          <AppIcon name="User" size={18} color="#fff" />
          <AppText style={styles.saveContactText}>Save to Contacts</AppText>
        </Pressable>

        {/* Social links */}
        <View style={styles.socials}>
          {bioPage.whatsapp ? (
            <SocialButton icon="Phone" label={`WhatsApp · ${bioPage.whatsapp}`} url={`https://wa.me/${bioPage.whatsapp.replace(/\D/g, '')}`} bg="#25D366" />
          ) : null}
          {bioPage.instagram ? (
            <SocialButton icon="User" label={`Instagram · ${bioPage.instagram}`} url={`https://instagram.com/${bioPage.instagram.replace('@', '')}`} bg="#E1306C" />
          ) : null}
          {bioPage.telegram ? (
            <SocialButton icon="Phone" label={`Telegram · ${bioPage.telegram}`} url={`https://t.me/${bioPage.telegram.replace('@', '')}`} bg="#0088CC" />
          ) : null}
          {bioPage.email ? (
            <SocialButton icon="ChevronRight" label={`Email · ${bioPage.email}`} url={`mailto:${bioPage.email}`} bg="#6E8A95" />
          ) : null}
          {bioPage.customLinks?.map((link) => (
            <SocialButton key={link.url} icon="ChevronRight" label={link.label} url={link.url} bg={themeStyle.accent} />
          ))}
        </View>

        {/* Footer */}
        <AppText style={styles.footer}>Powered by SITEHUB</AppText>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 },
  scroll: { padding: theme.spacing.lg, paddingBottom: 60, alignItems: 'center', gap: theme.spacing.md },
  topBar: { width: '100%', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  shareBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(0,0,0,0.08)', alignItems: 'center', justifyContent: 'center' },
  avatarWrap: { marginTop: theme.spacing.md },
  avatar: { width: 96, height: 96, borderRadius: 48, alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 40, fontWeight: '700' },
  name: { fontSize: 28, fontWeight: '700', textAlign: 'center' },
  tagline: { fontSize: 14, textAlign: 'center', marginTop: -theme.spacing.xs },
  saveContactBtn: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.xs, paddingHorizontal: theme.spacing.xl, paddingVertical: theme.spacing.sm, borderRadius: theme.radius.pill },
  saveContactText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  socials: { width: '100%', gap: theme.spacing.sm },
  socialBtn: { flexDirection: 'row', alignItems: 'center', gap: theme.spacing.md, padding: theme.spacing.md, borderRadius: theme.radius.lg },
  socialLabel: { color: '#fff', fontWeight: '600', flex: 1 },
  footer: { fontSize: 11, color: 'rgba(0,0,0,0.3)', marginTop: theme.spacing.md },
});
