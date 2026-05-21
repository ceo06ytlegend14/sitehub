import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { AppButton } from '@/src/components/AppButton';
import { AppCard } from '@/src/components/AppCard';
import { AppInput } from '@/src/components/AppInput';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { useAuth } from '@/src/hooks/useAuth';
import { useBioPage } from '@/src/hooks/useBioPage';
import { usePreferences } from '@/src/hooks/usePreferences';

export function EditBioScreen() {
  const { user } = useAuth();
  const { preferences } = usePreferences();
  const { bioPage, saveBioPage } = useBioPage(user?.id ?? '');

  const [slug, setSlug] = useState('');
  const [title, setTitle] = useState('');
  const [bio, setBio] = useState('');
  const [linksText, setLinksText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!bioPage) return;
    setSlug(bioPage.slug);
    setTitle(bioPage.title);
    setBio(bioPage.bio);
    setLinksText(bioPage.links.join('\n'));
  }, [bioPage]);

  async function handleSave() {
    if (!slug.trim() || !title.trim()) {
      Alert.alert('Missing details', 'Slug and title are required.');
      return;
    }

    const links = linksText
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);

    setIsSaving(true);
    try {
      await saveBioPage({
        slug: slug.trim().toLowerCase(),
        title: title.trim(),
        bio: bio.trim(),
        links,
        theme: preferences.theme,
      });
      Alert.alert('Saved', 'Bio page updated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to save bio page.';
      Alert.alert('Save failed', message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <AppText variant="h1">Edit Bio Page</AppText>
      <AppText variant="body" tone="muted">
        Build your public card page content.
      </AppText>

      <AppCard>
        <View style={styles.form}>
          <AppInput label="URL slug" value={slug} onChangeText={setSlug} placeholder="thean-card" autoCapitalize="none" />
          <AppInput label="Title" value={title} onChangeText={setTitle} placeholder="Thean Legendary" />
          <AppInput
            label="Bio"
            value={bio}
            onChangeText={setBio}
            multiline
            style={styles.multiline}
            placeholder="Short intro about you"
          />
          <AppInput
            label="Links (one per line)"
            value={linksText}
            onChangeText={setLinksText}
            multiline
            style={styles.multiline}
            placeholder="https://instagram.com/..."
          />
          <AppButton label="Save Bio Page" loading={isSaving} onPress={handleSave} />
        </View>
      </AppCard>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: theme.spacing.sm,
  },
  multiline: {
    minHeight: 90,
    textAlignVertical: 'top',
    paddingTop: theme.spacing.sm,
  },
});

