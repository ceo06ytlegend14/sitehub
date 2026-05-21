import { useEffect, useState } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppCard } from '@/src/components/AppCard';
import { AppText } from '@/src/components/AppText';
import { theme } from '@/src/constants/theme';
import { getPublicBioPageBySlug } from '@/src/services/firestoreService';
import { BioPage } from '@/src/types/models';

interface PublicBioScreenProps {
  slug: string;
}

const themeTint = {
  mint: '#2BC48A',
  coral: '#FF7B54',
  ocean: '#4FAEF5',
} as const;

export function PublicBioScreen({ slug }: PublicBioScreenProps) {
  const [bioPage, setBioPage] = useState<BioPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    getPublicBioPageBySlug(slug)
      .then((result) => setBioPage(result))
      .finally(() => setIsLoading(false));
  }, [slug]);

  if (isLoading) {
    return (
      <ScreenContainer>
        <AppText variant="h1">Loading...</AppText>
      </ScreenContainer>
    );
  }

  if (!bioPage) {
    return (
      <ScreenContainer>
        <AppText variant="h1">Page not found</AppText>
        <AppText variant="body" tone="muted">
          This bio page is not available yet.
        </AppText>
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <AppCard style={[styles.heroCard, { borderColor: themeTint[bioPage.theme] }]}>
        <AppText variant="h1">{bioPage.title}</AppText>
        <AppText variant="body" tone="muted">
          {bioPage.bio}
        </AppText>
      </AppCard>

      <View style={styles.links}>
        {bioPage.links.map((link) => (
          <Pressable key={link} style={styles.linkButton} onPress={() => Linking.openURL(link)}>
            <AppText variant="body">{link}</AppText>
          </Pressable>
        ))}
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  heroCard: {
    borderWidth: 2,
  },
  links: {
    gap: theme.spacing.sm,
  },
  linkButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.md,
  },
});

