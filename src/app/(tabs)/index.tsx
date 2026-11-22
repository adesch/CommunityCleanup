import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { CleanupMap } from '@/components/map/cleanup-map';
import type { CleanupMapView } from '@/components/map/cleanup-map-html';
import { colors } from '@/theme/colors';
import { useCleanups } from '@/state/cleanup-context';

export default function MapScreen() {
  const { areas, claimArea, releaseArea, isHydrated } = useCleanups();
  const [selectedId, setSelectedId] = useState(areas[0].id);
  const [mapView, setMapView] = useState<CleanupMapView>('downtown');
  const [pendingAction, setPendingAction] = useState<'claim' | 'release' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0];

  const confirmAction = () => {
    const succeeded = pendingAction === 'claim' ? claimArea(selected.id) : releaseArea(selected.id);
    if (succeeded) {
      setNotice(pendingAction === 'claim' ? `${selected.name} is now in My Cleanups.` : `${selected.name} is available again.`);
    }
    setPendingAction(null);
  };

  const claimedByUser = selected.status === 'claimed' && selected.volunteer === 'Alex Rivera';
  const actionDisabled = !isHydrated || (selected.status !== 'available' && !claimedByUser);

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
          style={[styles.button, actionDisabled && styles.buttonDisabled, claimedByUser && styles.releaseButton]}
          disabled={actionDisabled}
          onPress={() => {
            setNotice(null);
            setPendingAction(claimedByUser ? 'release' : 'claim');
          }}
        >
          <Text style={[styles.buttonText, claimedByUser && styles.releaseButtonText]}>
            {!isHydrated ? 'Loading claims…' : selected.status === 'available' ? 'Claim this street' : claimedByUser ? 'Release my claim' : selected.status === 'claimed' ? 'Already claimed' : 'Cleanup complete'}
          </Text>
        </Pressable>
        {notice && <Text style={styles.notice}>{notice}</Text>}
      </View>
      <ConfirmDialog
        visible={pendingAction !== null}
        title={pendingAction === 'release' ? `Release ${selected.name}?` : `Claim ${selected.name}?`}
        message={pendingAction === 'release' ? 'This block will become available for another volunteer.' : `${selected.crossStreet}. This will add the block to My Cleanups.`}
        confirmLabel={pendingAction === 'release' ? 'Release street' : 'Claim street'}
        cancelLabel={pendingAction === 'release' ? 'Keep claim' : 'Cancel'}
        destructive={pendingAction === 'release'}
        onConfirm={confirmAction}
        onCancel={() => setPendingAction(null)}
      />
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
  releaseButton: { backgroundColor: '#FFF4E8', borderWidth: 1, borderColor: colors.claimed },
  releaseButtonText: { color: colors.danger },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15 },
  notice: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});

const mapViews: { id: CleanupMapView; label: string }[] = [
  { id: 'downtown', label: 'Downtown' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'borough', label: 'Borough' },
];


