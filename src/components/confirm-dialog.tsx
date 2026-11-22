import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

type ConfirmDialogProps = {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({ visible, title, message, confirmLabel, cancelLabel = 'Cancel', destructive = false, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={styles.backdrop}>
        <View style={styles.dialog} accessibilityRole="alert">
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Pressable style={styles.cancelButton} onPress={onCancel} accessibilityRole="button">
              <Text style={styles.cancelText}>{cancelLabel}</Text>
            </Pressable>
            <Pressable style={[styles.confirmButton, destructive && styles.destructiveButton]} onPress={onConfirm} accessibilityRole="button">
              <Text style={styles.confirmText}>{confirmLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, backgroundColor: 'rgba(15, 35, 30, 0.55)' },
  dialog: { width: '100%', maxWidth: 420, padding: 22, borderRadius: 20, backgroundColor: colors.surface, gap: 12 },
  title: { color: colors.ink, fontSize: 21, fontWeight: '800' },
  message: { color: colors.muted, fontSize: 15, lineHeight: 22 },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 10, marginTop: 8 },
  cancelButton: { paddingHorizontal: 17, paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: colors.border },
  cancelText: { color: colors.ink, fontWeight: '700' },
  confirmButton: { paddingHorizontal: 17, paddingVertical: 12, borderRadius: 12, backgroundColor: colors.primary },
  destructiveButton: { backgroundColor: colors.danger },
  confirmText: { color: '#FFFFFF', fontWeight: '800' },
});
