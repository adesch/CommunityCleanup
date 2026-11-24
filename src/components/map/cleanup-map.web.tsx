import { createElement, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { buildCleanupMapHtml, type CleanupMapView } from '@/components/map/cleanup-map-html';
import { colors } from '@/theme/colors';
import type { CleanupArea } from '@/types/cleanup';

type CleanupMapProps = {
  areas: CleanupArea[];
  selectedId: string;
  onSelect: (id: string) => void;
  view: CleanupMapView;
};

export function CleanupMap({ areas, selectedId, onSelect, view }: CleanupMapProps) {
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(String(event.data));
        if (message.type === 'cleanup-street-select') onSelect(message.id);
      } catch {
        // Ignore messages from unrelated browser tools.
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onSelect]);

  return (
    <View style={styles.frame}>
      {createElement('iframe', {
        key: `${view}-${selectedId}-${areas.map((area) => `${area.ownerId ?? 'open'}:${area.cleanupReport?.reportedAt ?? ''}`).join('-')}`,
        srcDoc: buildCleanupMapHtml(areas, selectedId, view),
        title: 'Interactive cleanup map of Downingtown, Pennsylvania',
        style: { width: '100%', height: '100%', border: 0 },
        allow: 'geolocation',
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 460, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.map },
});
