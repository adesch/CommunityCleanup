import { mkdir, writeFile } from 'node:fs/promises';

const boxes = [
  '-75.720,39.995,-75.705,40.0075',
  '-75.705,39.995,-75.690,40.0075',
  '-75.720,40.0075,-75.705,40.020',
  '-75.705,40.0075,-75.690,40.020',
];
const xmlParts = [];
for (const box of boxes) {
  const response = await fetch(`https://api.openstreetmap.org/api/0.6/map?bbox=${box}`, {
    headers: { 'user-agent': 'CommunityCleanupPrototype/1.0' },
  });
  if (!response.ok) throw new Error(`OpenStreetMap export failed for ${box}: ${response.status}`);
  xmlParts.push(await response.text());
}
const xml = xmlParts.join('\n');

const decodeXml = (value) => value
  .replaceAll('&amp;', '&')
  .replaceAll('&quot;', '"')
  .replaceAll('&apos;', "'")
  .replaceAll('&lt;', '<')
  .replaceAll('&gt;', '>');
const nodes = new Map();
for (const match of xml.matchAll(/<node\s+id="(\d+)"[^>]*lat="([^"]+)"[^>]*lon="([^"]+)"[^>]*>/g)) {
  nodes.set(match[1], { lat: Number(match[2]), lon: Number(match[3]) });
}

const exportedWaysById = new Map();
for (const match of xml.matchAll(/<way\s+id="(\d+)"[^>]*>([\s\S]*?)<\/way>/g)) {
  const body = match[2];
  const nodeIds = [...body.matchAll(/<nd\s+ref="(\d+)"/g)].map((item) => item[1]);
  const tags = Object.fromEntries([...body.matchAll(/<tag\s+k="([^"]+)"\s+v="([^"]*)"/g)].map((item) => [decodeXml(item[1]), decodeXml(item[2])]));
  exportedWaysById.set(match[1], { id: Number(match[1]), nodes: nodeIds, tags, geometry: nodeIds.map((id) => nodes.get(id)).filter(Boolean) });
}
const exportedWays = [...exportedWaysById.values()];
const allowedTypes = new Set([
  'primary', 'secondary', 'tertiary', 'residential', 'unclassified',
  'living_street', 'service', 'primary_link', 'secondary_link', 'tertiary_link',
]);
const ways = exportedWays.filter((element) => (
  element.tags?.name &&
  allowedTypes.has(element.tags?.highway) &&
  element.geometry?.length > 1
));
console.log(`Parsed ${nodes.size} nodes and ${exportedWays.length} ways; ${ways.length} are named roads.`);

const nodeUse = new Map();
for (const way of ways) {
  for (const nodeId of way.nodes) nodeUse.set(nodeId, (nodeUse.get(nodeId) ?? 0) + 1);
}

const radians = (degrees) => degrees * Math.PI / 180;
const distanceMeters = (a, b) => {
  const earthRadius = 6371000;
  const dLat = radians(b.lat - a.lat);
  const dLon = radians(b.lon - a.lon);
  const value = Math.sin(dLat / 2) ** 2 + Math.cos(radians(a.lat)) * Math.cos(radians(b.lat)) * Math.sin(dLon / 2) ** 2;
  return earthRadius * 2 * Math.atan2(Math.sqrt(value), Math.sqrt(1 - value));
};

const segments = [];
for (const way of ways) {
  let start = 0;
  let distance = 0;
  let segmentIndex = 0;

  for (let index = 1; index < way.geometry.length; index += 1) {
    distance += distanceMeters(way.geometry[index - 1], way.geometry[index]);
    const isIntersection = (nodeUse.get(way.nodes[index]) ?? 0) > 1;
    const isEnd = index === way.geometry.length - 1;
    const isLong = distance >= 220;

    if ((isIntersection || isEnd || isLong) && index > start) {
      const geometry = way.geometry.slice(start, index + 1).map(({ lat, lon }) => [lat, lon]);
      if (geometry.length > 1 && distance >= 18) {
        segments.push({
          id: `osm-${way.id}-${segmentIndex}`,
          osmWayId: way.id,
          name: way.tags.name,
          roadType: way.tags.highway,
          distanceMeters: Math.round(distance),
          coordinates: geometry,
        });
        segmentIndex += 1;
      }
      start = index;
      distance = 0;
    }
  }
}

segments.sort((a, b) => a.name.localeCompare(b.name) || a.id.localeCompare(b.id));
await mkdir('src/data', { recursive: true });
await writeFile('src/data/downingtown-road-segments.json', `${JSON.stringify(segments, null, 2)}\n`);
console.log(`Wrote ${segments.length} Downingtown road segments from ${ways.length} named OSM ways.`);
