import { Redirect } from 'expo-router';
import { ScreenContainer } from '@/src/components/ScreenContainer';
import { AppText } from '@/src/components/AppText';
import { useAuth } from '@/src/hooks/useAuth';

export default function IndexScreen() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <ScreenContainer scroll={false}>
        <AppText variant="h1">Loading...</AppText>
      </ScreenContainer>
    );
  }

  if (!user) {
    return <Redirect href="/auth/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
