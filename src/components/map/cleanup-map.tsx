import { StyleSheet, View } from 'react-native';
import { WebView, type WebViewMessageEvent } from 'react-native-webview';

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
  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data);
      if (message.type === 'cleanup-street-select') onSelect(message.id);
    } catch {
      // Ignore malformed messages from the embedded map.
    }
  };

  return (
    <View style={styles.frame}>
      <WebView
        key={`${view}-${selectedId}-${areas.map((area) => area.status).join('-')}`}
        originWhitelist={['*']}
        source={{ html: buildCleanupMapHtml(areas, selectedId, view) }}
        onMessage={handleMessage}
        javaScriptEnabled
        domStorageEnabled
        style={styles.webView}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: { height: 390, overflow: 'hidden', borderRadius: 22, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.map },
  webView: { flex: 1, backgroundColor: colors.map },
});
