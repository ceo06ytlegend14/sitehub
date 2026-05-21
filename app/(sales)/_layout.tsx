import { Tabs } from 'expo-router';
import { Banknote, Home, ListOrdered, UserRound } from 'lucide-react-native';
import { colors } from '@/design-system';

export default function SalesLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#f3d5e3' },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home', tabBarIcon: ({ color, size }) => <Home color={color} size={size} /> }} />
      <Tabs.Screen name="orders" options={{ title: 'Orders', tabBarIcon: ({ color, size }) => <ListOrdered color={color} size={size} /> }} />
      <Tabs.Screen name="payouts" options={{ title: 'Payouts', tabBarIcon: ({ color, size }) => <Banknote color={color} size={size} /> }} />
      <Tabs.Screen name="me" options={{ title: 'Me', tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} /> }} />
      <Tabs.Screen name="new-order" options={{ href: null }} />
    </Tabs>
  );
}
