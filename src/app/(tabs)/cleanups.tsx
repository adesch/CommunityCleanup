import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { ConfirmDialog } from '@/components/confirm-dialog';
import { EmptyPhoto } from '@/components/empty-photo';
import { Screen } from '@/components/screen';
import { StatusPill } from '@/components/status-pill';
import { colors } from '@/theme/colors';
import { useCleanups } from '@/state/cleanup-context';

export default function CleanupsScreen() {
  const { myCleanups, releaseArea, currentPersona } = useCleanups();
  const [releaseId, setReleaseId] = useState<string | null>(null);
  const releaseCleanup = myCleanups.find((cleanup) => cleanup.id === releaseId);
  return (
    <Screen>
      <View>
        <Text style={styles.title}>My territory</Text>
        <Text style={styles.subtitle}>{currentPersona.name} owns {myCleanups.length} blocks.</Text>
      </View>
      {myCleanups.map((cleanup) => (
        <View key={cleanup.id} style={styles.card}>
          <View style={styles.row}>
            <View style={styles.grow}>
              <Text style={styles.cardTitle}>{cleanup.name}</Text>
              <Text style={styles.meta}>{cleanup.completedAt ?? cleanup.crossStreet}</Text>
              {cleanup.proofCapturedAt && (
                <Text style={styles.proofMeta}>Proof received {new Date(cleanup.proofCapturedAt).toLocaleString()} · {cleanup.proofSource === 'camera' ? 'camera' : 'photo library'}</Text>
              )}
            </View>
            <StatusPill status={cleanup.status} color={cleanup.ownerColor} label="Owned" />
          </View>
          <View style={styles.photos}>
            <EmptyPhoto label="Before photo" />
            <EmptyPhoto label="After photo" />
          </View>
          <Pressable
            style={[styles.secondaryButton, cleanup.ownerId === currentPersona.id && styles.releaseButton]}
            onPress={() => cleanup.ownerId === currentPersona.id && setReleaseId(cleanup.id)}
          >
            <Text style={[styles.secondaryText, cleanup.ownerId === currentPersona.id && styles.releaseText]}>
              {cleanup.ownerId === currentPersona.id ? 'Abandon this block' : 'View cleanup details'}
            </Text>
          </Pressable>
        </View>
      ))}
      {myCleanups.length === 0 && (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>Ready for another cleanup?</Text>
          <Text style={styles.emptyBody}>Choose an unclaimed block on the Downingtown map and tap “Capture this block.”</Text>
        </View>
      )}
      <View style={styles.note}>
        <Text style={styles.noteTitle}>Cleanup proof is coming next</Text>
        <Text style={styles.noteBody}>Before-and-after photos will verify that a captured block was actually cleaned without changing its ownership color.</Text>
      </View>
      <ConfirmDialog
        visible={releaseCleanup !== undefined}
        title={`Abandon ${releaseCleanup?.name ?? 'this block'}?`}
        message="This territory will become unclaimed and your score will decrease by 10 points."
        confirmLabel="Abandon block"
        destructive
        onConfirm={() => {
          if (releaseCleanup) releaseArea(releaseCleanup.id);
          setReleaseId(null);
        }}
        onCancel={() => setReleaseId(null)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: { fontSize: 30, fontWeight: '800', color: colors.ink },
  subtitle: { color: colors.muted, fontSize: 15, marginTop: 4 },
  card: { padding: 17, backgroundColor: colors.surface, borderRadius: 20, borderWidth: 1, borderColor: colors.border, gap: 16 },
  row: { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  grow: { flex: 1 },
  cardTitle: { color: colors.ink, fontWeight: '800', fontSize: 20 },
  meta: { color: colors.muted, marginTop: 4 },
  proofMeta: { color: colors.primaryDark, fontSize: 12, fontWeight: '700', marginTop: 5 },
  photos: { flexDirection: 'row', gap: 10 },
  secondaryButton: { borderWidth: 1, borderColor: colors.primary, paddingVertical: 13, borderRadius: 14, alignItems: 'center' },
  secondaryText: { color: colors.primary, fontWeight: '800' },
  releaseButton: { borderColor: colors.claimed, backgroundColor: '#FFF4E8' },
  releaseText: { color: colors.danger },
  note: { padding: 16, borderRadius: 16, backgroundColor: '#E7F2EC' },
  noteTitle: { color: colors.ink, fontWeight: '800', marginBottom: 4 },
  noteBody: { color: colors.muted, lineHeight: 20 },
  empty: { padding: 18, alignItems: 'center', borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 16 },
  emptyTitle: { color: colors.ink, fontWeight: '800' },
  emptyBody: { color: colors.muted, textAlign: 'center', lineHeight: 20, marginTop: 5 },
});

