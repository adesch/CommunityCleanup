import { personas } from '@/data/mock-personas';
import type { CleanupArea } from '@/types/cleanup';

export type CleanupMapView = 'downtown' | 'east' | 'west' | 'borough';

const mapViews: Record<CleanupMapView, { center: [number, number]; zoom: number }> = {
  downtown: { center: [40.0065, -75.7045], zoom: 16 },
  east: { center: [40.008, -75.6965], zoom: 15 },
  west: { center: [40.007, -75.7135], zoom: 15 },
  borough: { center: [40.008, -75.705], zoom: 14 },
};

export function buildCleanupMapHtml(areas: CleanupArea[], selectedId: string, view: CleanupMapView) {
  const streets = areas.map((area) => ({
    id: area.id,
    name: area.name,
    detail: area.crossStreet,
    status: area.status,
    ownerName: area.ownerName,
    coordinates: area.coordinates,
    color: area.ownerColor ?? '#8A9691',
    report: area.cleanupReport ? { issue: area.cleanupReport.issue, severity: area.cleanupReport.severity } : null,
    selected: area.id === selectedId,
  }));
  const mapView = mapViews[view];

  return `<!doctype html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; width: 100%; margin: 0; background: #e8eee9; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .leaflet-container { font: 13px/1.4 -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; }
    .leaflet-tooltip.street-name { border: 0; border-radius: 7px; box-shadow: 0 1px 5px #17332d33; color: #17332d; font-weight: 800; padding: 5px 8px; }
    .map-key { background: #fff; border-radius: 10px; box-shadow: 0 1px 6px #17332d2b; color: #17332d; padding: 7px 9px; font-size: 11px; font-weight: 700; }
    .map-key span { display: inline-block; width: 8px; height: 8px; border-radius: 50%; margin-right: 4px; }
    .map-key div + div { margin-top: 4px; }
  </style>
</head>
<body>
  <div id="map" aria-label="Interactive cleanup map of Downingtown, Pennsylvania"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const streets = ${JSON.stringify(streets)};
    const map = L.map('map', {
      zoomControl: true,
      minZoom: 14,
      maxBounds: [[39.992, -75.724], [40.023, -75.686]],
      maxBoundsViscosity: 1
    }).setView(${JSON.stringify(mapView.center)}, ${mapView.zoom});
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    function selectStreet(id) {
      const message = JSON.stringify({ type: 'cleanup-street-select', id });
      if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(message);
      else window.parent.postMessage(message, '*');
    }

    streets.forEach((street) => {
      if (!street.coordinates) return;
      const outline = L.polyline(street.coordinates, {
        color: street.selected ? '#17332d' : '#ffffff',
        weight: street.selected ? 13 : street.status === 'available' ? 7 : 9,
        opacity: street.selected ? 1 : 0.72,
        interactive: false
      }).addTo(map);
      const line = L.polyline(street.coordinates, {
        color: street.selected ? '#F6C945' : street.color,
        weight: street.selected ? 9 : street.status === 'available' ? 3 : 5,
        opacity: street.selected ? 1 : street.status === 'available' ? 0.48 : 0.88
      }).addTo(map);
      const hitArea = L.polyline(street.coordinates, { color: '#000', weight: 18, opacity: 0 });
      hitArea.addTo(map);
      line.bindTooltip(street.name, { className: 'street-name', sticky: true });
      line.bindPopup('<strong>' + street.name + '</strong><br>' + street.detail + '<br><em>' + (street.ownerName ? 'Owned by ' + street.ownerName : 'Unclaimed') + '</em>');
      line.on('click', () => selectStreet(street.id));
      hitArea.on('click', () => selectStreet(street.id));
      hitArea.bindTooltip(street.name, { className: 'street-name', sticky: true });
      if (street.selected) {
        line.openPopup();
        map.fitBounds(outline.getBounds(), { padding: [80, 80], maxZoom: 17 });
      }
      if (street.report) {
        const midpoint = street.coordinates[Math.floor(street.coordinates.length / 2)];
        const reportMarker = L.circleMarker(midpoint, { radius: 8, color: '#ffffff', weight: 3, fillColor: '#F2A93B', fillOpacity: 1 }).addTo(map);
        reportMarker.bindTooltip('Cleanup needed: ' + street.report.issue + ' (' + street.report.severity + ')', { className: 'street-name' });
        reportMarker.on('click', () => selectStreet(street.id));
      }
    });

    const key = L.control({ position: 'bottomleft' });
    key.onAdd = () => {
      const div = L.DomUtil.create('div', 'map-key');
      div.innerHTML = '<div><span style="background:#F2A93B"></span>Needs cleanup</div>' +
        '<div><span style="background:#8A9691"></span>Unclaimed</div>' +
        ${personas.map((persona) => `'<div><span style="background:${persona.color}"></span>${persona.name}</div>'`).join(' + ')};
      return div;
    };
    key.addTo(map);
  </script>
</body>
</html>`;
}
