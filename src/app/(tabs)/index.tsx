import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { CleanupProofDialog } from '@/components/cleanup-proof-dialog';
import { ReportCleanupDialog } from '@/components/report-cleanup-dialog';
import { CleanupMap } from '@/components/map/cleanup-map';
import type { CleanupMapView } from '@/components/map/cleanup-map-html';
import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { useCleanups, type CleanupProof } from '@/state/cleanup-context';
import { colors } from '@/theme/colors';
import type { CleanupReport } from '@/types/cleanup';

export default function MapScreen() {
  const { areas, claimArea, releaseArea, reportArea, isHydrated, currentPersona, personas, leaderboard, setCurrentPersonaId } = useCleanups();
  const [selectedId, setSelectedId] = useState(areas[0].id);
  const [mapView, setMapView] = useState<CleanupMapView>('downtown');
  const [pendingAction, setPendingAction] = useState<'claim' | 'release' | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [reportVisible, setReportVisible] = useState(false);
  const selected = areas.find((area) => area.id === selectedId) ?? areas[0];
  const ownedByCurrentUser = selected.ownerId === currentPersona.id;
  const ownedBySomeoneElse = Boolean(selected.ownerId && !ownedByCurrentUser);
  const actionDisabled = !isHydrated;

  const confirmRelease = () => {
    const succeeded = releaseArea(selected.id);
    if (succeeded) {
      setNotice(`${selected.name} is unclaimed again.`);
    }
    setPendingAction(null);
  };

  const submitProof = (proof: CleanupProof) => {
    const previousOwner = selected.ownerName;
    if (claimArea(selected.id, proof)) {
      setNotice(previousOwner
        ? `${currentPersona.name} captured this block from ${previousOwner}. Score updated with any connection bonus!`
        : `${currentPersona.name} claimed this block. Score updated with any connection bonus!`);
    }
    setPendingAction(null);
  };

  return (
    <Screen contentStyle={styles.screen}>
      <View>
        <Text style={styles.eyebrow}>DOWNINGTOWN TERRITORY</Text>
        <Text style={styles.title}>Clean blocks. Capture streets.</Text>
      </View>

      <View style={styles.personaCard}>
        <Text style={styles.sectionLabel}>PLAYING AS</Text>
        <View style={styles.personaRow}>
          {personas.map((persona) => (
            <Pressable
              key={persona.id}
              onPress={() => { setCurrentPersonaId(persona.id); setNotice(null); }}
              style={[styles.personaButton, currentPersona.id === persona.id && { borderColor: persona.color, backgroundColor: `${persona.color}14` }]}
            >
              <View style={[styles.personaDot, { backgroundColor: persona.color }]} />
              <Text style={styles.personaName}>{persona.name}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.leaderboard}>
        <Text style={styles.sectionLabel}>LEADERBOARD</Text>
        {leaderboard.map((player, index) => (
          <View key={player.id} style={styles.leaderRow}>
            <Text style={styles.rank}>{index + 1}</Text>
            <View style={[styles.personaDot, { backgroundColor: player.color }]} />
            <Text style={styles.leaderName}>{player.name}</Text>
            <Text style={styles.blocks}>{player.blocks} blocks</Text>
            <Text style={styles.points}>{player.points} pts</Text>
          </View>
        ))}
        <Text style={styles.bonusHelp}>10 points per block + 5 points for every connected pair.</Text>
      </View>

      <View style={styles.viewPicker}>
        {mapViews.map((view) => (
          <Pressable key={view.id} onPress={() => setMapView(view.id)} style={[styles.viewButton, mapView === view.id && styles.viewButtonActive]}>
            <Text style={[styles.viewButtonText, mapView === view.id && styles.viewButtonTextActive]}>{view.label}</Text>
          </Pressable>
        ))}
      </View>
      <CleanupMap areas={areas} selectedId={selectedId} onSelect={(id) => { setSelectedId(id); setNotice(null); }} view={mapView} />
      <Text style={styles.mapHelp}>Tap a road block to select it. Yellow marks your current selection.</Text>

      <View style={styles.legend}>
        <StatusPill status="available" color="#8A9691" label="Unclaimed" />
        {personas.map((persona) => <StatusPill key={persona.id} status="claimed" color={persona.color} label={persona.name.split(' ')[0]} />)}
      </View>

      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.grow}>
            <Text style={styles.cardTitle}>{selected.name}</Text>
            <Text style={styles.cardMeta}>{selected.crossStreet} · {selected.distance}</Text>
          </View>
          <StatusPill
            status={selected.status}
            color={selected.ownerColor ?? '#8A9691'}
            label={selected.ownerName ? `Owned by ${selected.ownerName.split(' ')[0]}` : 'Unclaimed'}
          />
        </View>
        <Pressable
          style={[styles.button, { backgroundColor: currentPersona.color }, actionDisabled && styles.buttonDisabled, ownedByCurrentUser && styles.releaseButton]}
          disabled={actionDisabled}
          onPress={() => setPendingAction(ownedByCurrentUser ? 'release' : 'claim')}
        >
          <Text style={[styles.buttonText, ownedByCurrentUser && styles.releaseButtonText]}>
            {!isHydrated ? 'Loading territory…' : ownedByCurrentUser ? 'Abandon this block' : ownedBySomeoneElse ? `Clean & capture from ${selected.ownerName}` : 'Clean & claim this block · 10+ points'}
          </Text>
        </Pressable>
        {selected.cleanupReport && (
          <View style={styles.reportSummary}>
            <Text style={styles.reportTitle}>⚑ Cleanup requested · {selected.cleanupReport.severity}</Text>
            <Text style={styles.reportText}>{selected.cleanupReport.issue}{selected.cleanupReport.note ? ` — ${selected.cleanupReport.note}` : ''}</Text>
          </View>
        )}
        <Pressable style={styles.reportButton} onPress={() => setReportVisible(true)}>
          <Text style={styles.reportButtonText}>{selected.cleanupReport ? 'Update cleanup report' : 'Report cleanup needed'}</Text>
        </Pressable>
        {notice && <Text style={styles.notice}>{notice}</Text>}
      </View>

      <ConfirmDialog
        visible={pendingAction === 'release'}
        title={`Abandon ${selected.name}?`}
        message="This block will become unclaimed and your score will decrease by 10 points."
        confirmLabel="Abandon block"
        destructive
        onConfirm={confirmRelease}
        onCancel={() => setPendingAction(null)}
      />
      <CleanupProofDialog
        visible={pendingAction === 'claim'}
        streetName={selected.name}
        previousOwner={selected.ownerName}
        playerName={currentPersona.name}
        playerColor={currentPersona.color}
        onSubmit={submitProof}
        onCancel={() => setPendingAction(null)}
      />
      <ReportCleanupDialog
        key={`${selected.id}-${selected.cleanupReport?.reportedAt ?? 'new'}`}
        visible={reportVisible}
        streetName={selected.name}
        existingReport={selected.cleanupReport}
        onSubmit={(report: CleanupReport) => {
          reportArea(selected.id, report);
          setNotice(`${selected.name} was marked as needing cleanup.`);
        }}
        onCancel={() => setReportVisible(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  screen: { paddingBottom: 28 },
  eyebrow: { color: colors.primary, fontWeight: '800', fontSize: 12, letterSpacing: 1.4, marginBottom: 6 },
  title: { color: colors.ink, fontSize: 29, lineHeight: 35, fontWeight: '800' },
  sectionLabel: { color: colors.muted, fontSize: 10, letterSpacing: 1.1, fontWeight: '800' },
  personaCard: { gap: 10 },
  personaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  personaButton: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 13, paddingVertical: 10, borderRadius: 14, borderWidth: 2, borderColor: colors.border, backgroundColor: colors.surface },
  personaDot: { width: 11, height: 11, borderRadius: 6 },
  personaName: { color: colors.ink, fontWeight: '700', fontSize: 13 },
  leaderboard: { padding: 15, backgroundColor: colors.surface, borderRadius: 18, borderWidth: 1, borderColor: colors.border, gap: 10 },
  leaderRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rank: { width: 18, color: colors.muted, fontWeight: '800' },
  leaderName: { flex: 1, color: colors.ink, fontWeight: '700' },
  blocks: { color: colors.muted, fontSize: 12 },
  points: { width: 57, textAlign: 'right', color: colors.ink, fontWeight: '800' },
  bonusHelp: { color: colors.muted, fontSize: 10, textAlign: 'right' },
  viewPicker: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  viewButton: { paddingHorizontal: 13, paddingVertical: 8, borderRadius: 18, backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
  viewButtonActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  viewButtonText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  viewButtonTextActive: { color: '#FFFFFF' },
  mapHelp: { color: colors.muted, fontSize: 12, textAlign: 'center', marginTop: -8 },
  legend: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  card: { backgroundColor: colors.surface, borderRadius: 20, padding: 17, borderWidth: 1, borderColor: colors.border, gap: 16 },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  grow: { flex: 1 },
  cardTitle: { color: colors.ink, fontSize: 20, fontWeight: '800', marginBottom: 4 },
  cardMeta: { color: colors.muted, fontSize: 13 },
  button: { borderRadius: 14, paddingVertical: 14, alignItems: 'center', paddingHorizontal: 10 },
  buttonDisabled: { backgroundColor: '#AAB8B3' },
  releaseButton: { backgroundColor: '#FFF4E8', borderWidth: 1, borderColor: colors.claimed },
  releaseButtonText: { color: colors.danger },
  buttonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 15, textAlign: 'center' },
  reportSummary: { padding: 12, borderRadius: 12, backgroundColor: '#FFF2DB', gap: 3 },
  reportTitle: { color: colors.ink, fontSize: 13, fontWeight: '800' },
  reportText: { color: colors.muted, fontSize: 12, lineHeight: 17 },
  reportButton: { alignItems: 'center', paddingVertical: 12, borderRadius: 13, borderWidth: 1, borderColor: colors.claimed },
  reportButtonText: { color: colors.danger, fontWeight: '800' },
  notice: { color: colors.primaryDark, fontSize: 13, fontWeight: '700', textAlign: 'center' },
});

const mapViews: { id: CleanupMapView; label: string }[] = [
  { id: 'downtown', label: 'Downtown' },
  { id: 'east', label: 'East' },
  { id: 'west', label: 'West' },
  { id: 'borough', label: 'Borough' },
];
