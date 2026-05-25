import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import {
  MavenPro_400Regular,
  MavenPro_500Medium,
  MavenPro_600SemiBold,
  MavenPro_700Bold,
} from '@expo-google-fonts/maven-pro';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/src/providers/AuthProvider';
import { PreferencesProvider } from '@/src/providers/PreferencesProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    MavenPro_400Regular,
    MavenPro_500Medium,
    MavenPro_600SemiBold,
    MavenPro_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <PreferencesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="sales" />
          <Stack.Screen name="printer" />
          <Stack.Screen name="admin" />
          <Stack.Screen name="new-order" />
          <Stack.Screen name="order-detail/[orderId]" />
          <Stack.Screen name="activate-card" options={{ headerShown: true, title: 'Activate Card' }} />
          <Stack.Screen name="edit-bio" options={{ headerShown: true, title: 'Edit Bio Page' }} />
          <Stack.Screen name="theme-picker" options={{ headerShown: true, title: 'Pick Theme' }} />
          <Stack.Screen name="language-picker" options={{ headerShown: true, title: 'Language Picker' }} />
          <Stack.Screen name="public/[slug]" options={{ headerShown: true, title: 'Public Bio Page' }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="dark" />
      </PreferencesProvider>
    </AuthProvider>
  );
}
