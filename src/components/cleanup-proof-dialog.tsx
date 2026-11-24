import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import type { CleanupProof } from '@/state/cleanup-context';
import { colors } from '@/theme/colors';

type ProofSelection = CleanupProof & { uri: string; exifDate?: string; fileName?: string };
type CleanupProofDialogProps = {
  visible: boolean;
  streetName: string;
  previousOwner?: string;
  playerName: string;
  playerColor: string;
  onSubmit: (proof: CleanupProof) => void;
  onCancel: () => void;
};

function findExifDate(exif: Record<string, unknown> | null | undefined) {
  const value = exif?.DateTimeOriginal ?? exif?.DateTimeDigitized ?? exif?.DateTime;
  return typeof value === 'string' ? value : undefined;
}

export function CleanupProofDialog({ visible, streetName, previousOwner, playerName, playerColor, onSubmit, onCancel }: CleanupProofDialogProps) {
  const [selection, setSelection] = useState<ProofSelection | null>(null);
  const [error, setError] = useState<string | null>(null);

  const close = () => {
    setSelection(null);
    setError(null);
    onCancel();
  };

  const saveResult = (result: ImagePicker.ImagePickerResult, source: CleanupProof['source']) => {
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    setSelection({
      uri: asset.uri,
      capturedAt: new Date().toISOString(),
      source,
      exifDate: findExifDate(asset.exif),
      fileName: asset.fileName ?? undefined,
    });
    setError(null);
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) { setError('Camera permission is required to take cleanup proof.'); return; }
    const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8, exif: true });
    saveResult(result, 'camera');
  };

  const choosePhoto = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8, exif: true });
    saveResult(result, 'library');
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.eyebrow}>CLEANUP PROOF</Text>
          <Text style={styles.title}>Clean and claim {streetName}</Text>
          <Text style={styles.message}>
            Upload a recent photo showing the cleaned block. {previousOwner ? `Verified proof will transfer it from ${previousOwner} to ${playerName}.` : `Verified proof will claim it for ${playerName}.`}
          </Text>

          {selection ? (
            <View style={styles.previewCard}>
              <Image source={{ uri: selection.uri }} style={styles.preview} resizeMode="cover" />
              <View style={styles.proofDetails}>
                <Text style={styles.proofTitle}>{selection.source === 'camera' ? 'Camera capture' : 'Library photo'}</Text>
                <Text style={styles.proofMeta}>App received: {new Date(selection.capturedAt).toLocaleString()}</Text>
                <Text style={styles.proofMeta}>{selection.exifDate ? `EXIF date: ${selection.exifDate}` : 'No EXIF capture date available'}</Text>
              </View>
            </View>
          ) : (
            <View style={styles.emptyPreview}>
              <Text style={styles.emptyIcon}>＋</Text>
              <Text style={styles.emptyText}>A proof photo is required</Text>
            </View>
          )}

          <View style={styles.photoActions}>
            <Pressable style={styles.secondaryButton} onPress={takePhoto}><Text style={styles.secondaryText}>Take photo now</Text></Pressable>
            <Pressable style={styles.secondaryButton} onPress={choosePhoto}><Text style={styles.secondaryText}>Choose photo</Text></Pressable>
          </View>
          <Text style={styles.disclaimer}>Mock verification: the app records when it receives the photo. EXIF dates may be missing or altered and are not treated as proof by themselves.</Text>
          {error && <Text style={styles.error}>{error}</Text>}
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={close}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable
              style={[styles.submitButton, { backgroundColor: playerColor }, !selection && styles.disabledButton]}
              disabled={!selection}
              onPress={() => {
                if (!selection) return;
                onSubmit({ capturedAt: selection.capturedAt, source: selection.source });
                setSelection(null);
                setError(null);
              }}
            >
              <Text style={styles.submitText}>{previousOwner ? 'Transfer territory' : 'Claim territory'} · 10+ pts</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 18, backgroundColor: 'rgba(15, 35, 30, 0.62)' },
  dialog: { width: '100%', maxWidth: 520, maxHeight: '94%', padding: 20, borderRadius: 22, backgroundColor: colors.surface, gap: 12 },
  eyebrow: { color: colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 22, fontWeight: '800' },
  message: { color: colors.muted, lineHeight: 20 },
  previewCard: { overflow: 'hidden', borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  preview: { width: '100%', height: 180, backgroundColor: colors.map },
  proofDetails: { padding: 11, gap: 3 },
  proofTitle: { color: colors.ink, fontWeight: '800' },
  proofMeta: { color: colors.muted, fontSize: 12 },
  emptyPreview: { height: 155, alignItems: 'center', justifyContent: 'center', borderRadius: 16, borderStyle: 'dashed', borderWidth: 1, borderColor: colors.border, backgroundColor: '#F8FAF8' },
  emptyIcon: { color: colors.primary, fontSize: 30 },
  emptyText: { color: colors.muted, fontWeight: '700' },
  photoActions: { flexDirection: 'row', gap: 8 },
  secondaryButton: { flex: 1, alignItems: 'center', paddingVertical: 11, borderRadius: 12, borderWidth: 1, borderColor: colors.primary },
  secondaryText: { color: colors.primary, fontWeight: '800', fontSize: 13 },
  disclaimer: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  error: { color: colors.danger, fontSize: 12, fontWeight: '700' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.ink, fontWeight: '700' },
  submitButton: { flex: 1, alignItems: 'center', paddingHorizontal: 14, paddingVertical: 12, borderRadius: 12 },
  disabledButton: { backgroundColor: '#AAB8B3' },
  submitText: { color: '#FFFFFF', fontWeight: '800', textAlign: 'center' },
});
