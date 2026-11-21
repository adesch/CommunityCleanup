import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { colors } from '@/theme/colors';
import { CleanupProvider } from '@/state/cleanup-context';

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <CleanupProvider>
        <StatusBar style="dark" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />
      </CleanupProvider>
    </SafeAreaProvider>
  );
}

