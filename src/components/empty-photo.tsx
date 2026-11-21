import { StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme/colors';

export function EmptyPhoto({ label }: { label: string }) {
  return (
    <View style={styles.photo}>
      <Text style={styles.icon}>＋</Text>
      <Text style={styles.label}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  photo: { flex: 1, minHeight: 126, borderWidth: 1, borderStyle: 'dashed', borderColor: colors.border, borderRadius: 16, alignItems: 'center', justifyContent: 'center', backgroundColor: '#F9FBF9', gap: 5 },
  icon: { color: colors.primary, fontSize: 26 },
  label: { color: colors.muted, fontSize: 13, fontWeight: '600' },
});

