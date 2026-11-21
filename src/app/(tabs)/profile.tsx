import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { colors } from '@/theme/colors';

export default function ProfileScreen() {
  return (
    <Screen>
      <Text style={styles.title}>Profile</Text>
      <View style={styles.identity}>
        <View style={styles.avatar}><Text style={styles.initials}>AR</Text></View>
        <View><Text style={styles.name}>Alex Rivera</Text><Text style={styles.location}>Riverside neighborhood</Text></View>
      </View>
      <View style={styles.stats}>
        <Stat value="8" label="Cleanups" />
        <View style={styles.divider} />
        <Stat value="5.2" label="Miles" />
        <View style={styles.divider} />
        <Stat value="14" label="Bags" />
      </View>
      <Text style={styles.sectionTitle}>Recent impact</Text>
      <View style={styles.timeline}>
        <View style={styles.timelineDot} />
        <View style={styles.grow}><Text style={styles.eventTitle}>Completed Market Square</Text><Text style={styles.eventMeta}>November 16 · 3 bags collected</Text></View>
      </View>
      <View style={styles.placeholder}><Text style={styles.placeholderTitle}>Achievements</Text><Text style={styles.placeholderBody}>Badges and community milestones will live here.</Text></View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '800' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  avatar: { height: 68, width: 68, borderRadius: 34, backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  name: { color: colors.ink, fontWeight: '800', fontSize: 21 },
  location: { color: colors.muted, marginTop: 4 },
  stats: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 18, borderWidth: 1, borderColor: colors.border },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontWeight: '800', fontSize: 22 },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 18, marginTop: 6 },
  timeline: { flexDirection: 'row', gap: 12, alignItems: 'flex-start', backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  timelineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: colors.completed, marginTop: 4 },
  grow: { flex: 1 },
  eventTitle: { color: colors.ink, fontWeight: '700' },
  eventMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  placeholder: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 16, padding: 18 },
  placeholderTitle: { color: colors.ink, fontWeight: '800' },
  placeholderBody: { color: colors.muted, marginTop: 4 },
});

