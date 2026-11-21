import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { colors } from '@/theme/colors';
import { useCleanups } from '@/state/cleanup-context';

export default function AdminScreen() {
  const { areas } = useCleanups();
  return (
    <Screen>
      <View>
        <Text style={styles.kicker}>ADMIN VIEW</Text>
        <Text style={styles.title}>Area assignments</Text>
        <Text style={styles.subtitle}>Coordinate volunteers and monitor progress.</Text>
      </View>
      <View style={styles.summary}>
        <Text style={styles.summaryValue}>{areas.length}</Text><Text style={styles.summaryLabel}> active streets</Text>
        <Text style={styles.summaryDivider}>·</Text>
        <Text style={styles.summaryValue}>2</Text><Text style={styles.summaryLabel}> volunteers</Text>
      </View>
      {areas.map((area) => (
        <View style={styles.row} key={area.id}>
          <View style={styles.grow}>
            <Text style={styles.areaName}>{area.name}</Text>
            <Text style={styles.meta}>{area.volunteer ? `Assigned to ${area.volunteer}` : 'Unassigned'}</Text>
          </View>
          <View style={styles.actions}>
            <StatusPill status={area.status} />
            <Pressable><Text style={styles.assign}>{area.volunteer ? 'Reassign' : 'Assign'}</Text></Pressable>
          </View>
        </View>
      ))}
      <Text style={styles.disclaimer}>Role-based access will be added when authentication is connected.</Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  kicker: { color: colors.primary, fontSize: 12, letterSpacing: 1.2, fontWeight: '800' },
  title: { color: colors.ink, fontSize: 30, fontWeight: '800', marginTop: 5 },
  subtitle: { color: colors.muted, marginTop: 5 },
  summary: { flexDirection: 'row', alignItems: 'baseline', backgroundColor: '#E7F2EC', padding: 16, borderRadius: 16 },
  summaryValue: { color: colors.ink, fontWeight: '800', fontSize: 18 },
  summaryLabel: { color: colors.muted },
  summaryDivider: { color: colors.muted, marginHorizontal: 9 },
  row: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 16, borderWidth: 1, borderColor: colors.border, padding: 16, gap: 10 },
  grow: { flex: 1 },
  areaName: { color: colors.ink, fontWeight: '800', fontSize: 16 },
  meta: { color: colors.muted, fontSize: 13, marginTop: 5 },
  actions: { alignItems: 'flex-end', justifyContent: 'space-between', gap: 12 },
  assign: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  disclaimer: { color: colors.muted, fontSize: 12, textAlign: 'center', paddingHorizontal: 20 },
});

