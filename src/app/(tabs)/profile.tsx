import { StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { useCleanups } from '@/state/cleanup-context';
import { colors } from '@/theme/colors';

export default function ProfileScreen() {
  const { currentPersona, myCleanups, leaderboard } = useCleanups();
  const player = leaderboard.find((entry) => entry.id === currentPersona.id)!;
  const rank = leaderboard.findIndex((entry) => entry.id === currentPersona.id) + 1;
  const miles = myCleanups.reduce((total, area) => total + Number.parseFloat(area.distance), 0);

  return (
    <Screen>
      <Text style={styles.title}>Player profile</Text>
      <View style={styles.identity}>
        <View style={[styles.avatar, { backgroundColor: currentPersona.color }]}><Text style={styles.initials}>{currentPersona.initials}</Text></View>
        <View><Text style={styles.name}>{currentPersona.name}</Text><Text style={styles.location}>{currentPersona.neighborhood}</Text></View>
      </View>
      <View style={styles.stats}>
        <Stat value={`${player.points}`} label="Points" />
        <View style={styles.divider} />
        <Stat value={`${player.blocks}`} label="Blocks" />
        <View style={styles.divider} />
        <Stat value={`#${rank}`} label="Rank" />
      </View>
      <Text style={styles.sectionTitle}>Territory</Text>
      <View style={styles.territoryCard}>
        <View style={[styles.colorSwatch, { backgroundColor: currentPersona.color }]} />
        <View style={styles.grow}>
          <Text style={styles.eventTitle}>{player.blocks} Downingtown blocks owned</Text>
          <Text style={styles.eventMeta}>{miles.toFixed(1)} territory miles · {player.bonusPoints} connection bonus points from {player.connections} adjacent pairs</Text>
        </View>
      </View>
      <Text style={styles.sectionTitle}>Cleanup history</Text>
      <View style={styles.placeholder}>
        <Text style={styles.placeholderTitle}>Completed cleanups will appear here</Text>
        <Text style={styles.placeholderBody}>Completion and photo proof are tracked as activity without changing the owner color on the territory map.</Text>
      </View>
    </Screen>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return <View style={styles.stat}><Text style={styles.statValue}>{value}</Text><Text style={styles.statLabel}>{label}</Text></View>;
}

const styles = StyleSheet.create({
  title: { color: colors.ink, fontSize: 30, fontWeight: '800' },
  identity: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8 },
  avatar: { height: 68, width: 68, borderRadius: 34, alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#FFFFFF', fontSize: 22, fontWeight: '800' },
  name: { color: colors.ink, fontWeight: '800', fontSize: 21 },
  location: { color: colors.muted, marginTop: 4 },
  stats: { flexDirection: 'row', backgroundColor: colors.surface, borderRadius: 20, paddingVertical: 18, borderWidth: 1, borderColor: colors.border },
  stat: { flex: 1, alignItems: 'center' },
  statValue: { color: colors.ink, fontWeight: '800', fontSize: 22 },
  statLabel: { color: colors.muted, fontSize: 12, marginTop: 2 },
  divider: { width: 1, backgroundColor: colors.border },
  sectionTitle: { color: colors.ink, fontWeight: '800', fontSize: 18, marginTop: 6 },
  territoryCard: { flexDirection: 'row', gap: 12, alignItems: 'center', backgroundColor: colors.surface, padding: 16, borderRadius: 16 },
  colorSwatch: { width: 18, height: 48, borderRadius: 9 },
  grow: { flex: 1 },
  eventTitle: { color: colors.ink, fontWeight: '700' },
  eventMeta: { color: colors.muted, marginTop: 4, fontSize: 13 },
  placeholder: { borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 16, padding: 18 },
  placeholderTitle: { color: colors.ink, fontWeight: '800' },
  placeholderBody: { color: colors.muted, marginTop: 4, lineHeight: 20 },
});
