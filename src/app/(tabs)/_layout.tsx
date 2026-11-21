import { Tabs } from 'expo-router';
import { Text } from 'react-native';

import { colors } from '@/theme/colors';

const tabIcons: Record<string, string> = { index: '⌖', cleanups: '✓', profile: '●', admin: '⚙' };

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 9, borderTopColor: colors.border, backgroundColor: colors.surface },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color }) => <Text style={{ color, fontSize: 19 }}>{tabIcons[route.name] ?? '•'}</Text>,
      })}
    >
      <Tabs.Screen name="index" options={{ title: 'Map' }} />
      <Tabs.Screen name="cleanups" options={{ title: 'My Cleanups' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      <Tabs.Screen name="admin" options={{ title: 'Admin' }} />
    </Tabs>
  );
}

