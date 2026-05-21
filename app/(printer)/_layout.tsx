import { Tabs } from 'expo-router';
import { Camera, List, UserRound, Wallet } from 'lucide-react-native';
import { colors } from '@/design-system';

export default function PrinterLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f3d5e3' },
      }}
    >
      <Tabs.Screen name="queue" options={{ title: 'Queue', tabBarIcon: ({ color, size }) => <List color={color} size={size} /> }} />
      <Tabs.Screen name="scan" options={{ title: 'Scan', tabBarIcon: ({ color, size }) => <Camera color={color} size={size} /> }} />
      <Tabs.Screen name="wages" options={{ title: 'Wages', tabBarIcon: ({ color, size }) => <Wallet color={color} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
      <Tabs.Screen name="nfc/[jobId]" options={{ href: null }} />
      <Tabs.Screen name="qa/[jobId]" options={{ href: null }} />
    </Tabs>
  );
}
