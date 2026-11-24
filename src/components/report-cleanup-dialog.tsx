import { useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

import { colors } from '@/theme/colors';
import type { CleanupIssue, CleanupReport, CleanupSeverity } from '@/types/cleanup';

type ReportCleanupDialogProps = {
  visible: boolean;
  streetName: string;
  existingReport?: CleanupReport;
  onSubmit: (report: CleanupReport) => void;
  onCancel: () => void;
};

export function ReportCleanupDialog({ visible, streetName, existingReport, onSubmit, onCancel }: ReportCleanupDialogProps) {
  const [issue, setIssue] = useState<CleanupIssue>(existingReport?.issue ?? 'Litter');
  const [severity, setSeverity] = useState<CleanupSeverity>(existingReport?.severity ?? 'Medium');
  const [note, setNote] = useState(existingReport?.note ?? '');

  const close = () => {
    setIssue(existingReport?.issue ?? 'Litter');
    setSeverity(existingReport?.severity ?? 'Medium');
    setNote(existingReport?.note ?? '');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <View style={styles.backdrop}>
        <View style={styles.dialog}>
          <Text style={styles.eyebrow}>RESIDENT REPORT</Text>
          <Text style={styles.title}>{streetName} needs cleanup</Text>
          <Text style={styles.label}>What did you see?</Text>
          <View style={styles.choices}>
            {issues.map((value) => (
              <Pressable key={value} onPress={() => setIssue(value)} style={[styles.choice, issue === value && styles.choiceActive]}>
                <Text style={[styles.choiceText, issue === value && styles.choiceTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <Text style={styles.label}>How urgent is it?</Text>
          <View style={styles.choices}>
            {severities.map((value) => (
              <Pressable key={value} onPress={() => setSeverity(value)} style={[styles.choice, severity === value && styles.choiceActive]}>
                <Text style={[styles.choiceText, severity === value && styles.choiceTextActive]}>{value}</Text>
              </Pressable>
            ))}
          </View>
          <TextInput
            value={note}
            onChangeText={setNote}
            placeholder="Optional details, landmark, or safety concern"
            placeholderTextColor={colors.muted}
            maxLength={240}
            multiline
            style={styles.input}
          />
          <Text style={styles.hint}>An orange marker will appear on this block. A cleanup claim with proof automatically resolves the report.</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={close}><Text style={styles.cancelText}>Cancel</Text></Pressable>
            <Pressable
              style={styles.submitButton}
              onPress={() => {
                onSubmit({ issue, severity, note: note.trim(), reportedAt: new Date().toISOString() });
                close();
              }}
            >
              <Text style={styles.submitText}>{existingReport ? 'Update report' : 'Mark for cleanup'}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const issues: CleanupIssue[] = ['Litter', 'Overflowing bin', 'Illegal dumping', 'Other'];
const severities: CleanupSeverity[] = ['Low', 'Medium', 'High'];

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, backgroundColor: 'rgba(15, 35, 30, 0.58)' },
  dialog: { width: '100%', maxWidth: 500, padding: 21, borderRadius: 21, backgroundColor: colors.surface, gap: 12 },
  eyebrow: { color: colors.claimed, fontSize: 11, fontWeight: '800', letterSpacing: 1.2 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  label: { color: colors.ink, fontSize: 13, fontWeight: '800', marginTop: 2 },
  choices: { flexDirection: 'row', flexWrap: 'wrap', gap: 7 },
  choice: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 15, borderWidth: 1, borderColor: colors.border },
  choiceActive: { backgroundColor: '#FFF2DB', borderColor: colors.claimed },
  choiceText: { color: colors.muted, fontSize: 12, fontWeight: '700' },
  choiceTextActive: { color: colors.ink },
  input: { minHeight: 82, padding: 12, borderRadius: 13, borderWidth: 1, borderColor: colors.border, color: colors.ink, textAlignVertical: 'top' },
  hint: { color: colors.muted, fontSize: 11, lineHeight: 16 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 9 },
  cancelButton: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.ink, fontWeight: '700' },
  submitButton: { flex: 1, alignItems: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: colors.claimed },
  submitText: { color: '#FFFFFF', fontWeight: '800' },
});
