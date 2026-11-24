import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';
import type { CleanupStatus } from '@/types/cleanup';

const statusColors: Record<CleanupStatus, string> = {
  available: colors.available,
  claimed: colors.claimed,
};

export function StatusPill({ status, color, label }: { status: CleanupStatus; color?: string; label?: string }) {
  return (
    <View style={styles.container}>
      <View style={[styles.dot, { backgroundColor: color ?? statusColors[status] }]} />
      <Text style={styles.label}>{label ?? status[0].toUpperCase() + status.slice(1)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 9, height: 9, borderRadius: 5 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});

