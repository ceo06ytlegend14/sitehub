import { Tabs } from 'expo-router';
import { LiquidTabBar } from '@/src/components/LiquidTabBar';

export default function TabsLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="attendance" options={{ title: 'Orders/Queue' }} />
      <Tabs.Screen name="profile" options={{ title: 'Payouts/Profile' }} />
      <Tabs.Screen name="settings" options={{ title: 'Settings' }} />
    </Tabs>
  );
}
