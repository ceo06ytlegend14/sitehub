import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from '@/src/providers/AuthProvider';
import { PreferencesProvider } from '@/src/providers/PreferencesProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontError, fontsLoaded]);

  if (!fontsLoaded && !fontError) return null;

  return (
    <AuthProvider>
      <PreferencesProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="index" />
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="(tabs)" />
          <Stack.Screen name="new-order" options={{ headerShown: true, title: 'New Order Intake' }} />
          <Stack.Screen name="nfc-programming" options={{ headerShown: true, title: 'NFC Programming' }} />
          <Stack.Screen name="qa-video" options={{ headerShown: true, title: 'QA Video Capture' }} />
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
