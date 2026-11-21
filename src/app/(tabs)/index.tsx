import { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { CleanupMap } from '@/components/map/cleanup-map';
import type { CleanupMapView } from '@/components/map/cleanup-map-html';
import { colors } from '@/theme/colors';
import { useCleanups } from '@/state/cleanup-context';

export default function MapScreen() {
  const { areas, claimArea } = useCleanups();
  const [selectedId, setSelectedId] = useState(areas[0].id);
  const [mapView, setMapView] = useState<CleanupMapView>('downtown');
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0];

  const claim = () => Alert.alert(
    `Claim ${selected.name}?`,
    `${selected.crossStreet}\n\nThis will add the street to My Cleanups.`,
    [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Claim street',
        onPress: () => {
          if (claimArea(selected.id)) Alert.alert('Street claimed!', `${selected.name} is now in My Cleanups.`);
        },
      },
    ],
  );

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>DOWNINGTOWN, PA</Text>
        <Text style={styles.title}>Where will you make a difference?</Text>
      </View>

      <View style={styles.viewPicker}>
        {mapViews.map((view) => (
          <Pressable key={view.id} onPress={() => setMapView(view.id)} style={[styles.viewButton, mapView === view.id && styles.viewButtonActive]}>
            <Text style={[styles.viewButtonText, mapView === view.id && styles.viewButtonTextActive]}>{view.label}</Text>
          </Pressable>
        ))}
      </View>
      <CleanupMap areas={areas} selectedId={selectedId} onSelect={setSelectedId} view={mapView} />
      <Text style={styles.mapHelp}>Tap a highlighted road block to select it. Drag to pan and pinch or scroll to zoom.</Text>

      <View style={styles.legend}>
        <StatusPill status="available" />
        <StatusPill status="claimed" />
        <StatusPill status="completed" />
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{selected.name}</Text>
            <Text style={styles.cardMeta}>{selected.crossStreet} · {selected.distance}</Text>
          </View>
          <StatusPill status={selected.status} />
        </View>
        <Pressable
          style={[styles.button, selected.status !== 'available' && styles.buttonDisabled]}
          disabled={selected.status !== 'available'}
          onPress={claim}
        >
          <Text style={styles.buttonText}>{selected.status === 'available' ? 'Claim this street' : selected.volunteer === 'Alex Rivera' ? 'Claimed by you' : selected.status === 'claimed' ? 'Already claimed' : 'Cleanup complete'}</Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 28 },
  eyebrow: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1.4, marginBottom: 6 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '800', maxWidth: 330 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  viewPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  viewButton: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  viewButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  viewButtonText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  viewButtonTextActive: { color: '#FFFFFF' },
  mapHelp: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: -8 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: colors.border, gap: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  grow: { flex: 1 },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  cardMeta: { color: colors.muted, fontSize: 13 },
  button: { backgroundColor: colors.primary, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  buttonDisabled: { backgroundColor: '#AAB8B3' },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
});

const mapViews: { id: CleanupMapView; label: string }[] = [
  { id: 'downtown', label: 'Downtown' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'borough', label: 'Borough' },
];


