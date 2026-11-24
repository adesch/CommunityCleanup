import type { CleanupArea } from '@/types/cleanup';
import roadSegments from '@/data/downingtown-road-segments.json';
import { personaById } from '@/data/mock-personas';

type RoadSegment = {
  id: string;
  osmWayId: number;
  name: string;
  distanceMeters: number;
  coordinates: number[][];
};

const metersToMiles = (meters: number) => `${Math.max(0.1, Math.round(meters / 160.934) / 10).toFixed(1)} mi`;

export const cleanupAreas: CleanupArea[] = (roadSegments as RoadSegment[]).map((segment, index) => {
  const ownerId = index % 17 === 0 ? 'alex' : index % 13 === 0 ? 'maya' : undefined;
  const owner = ownerId ? personaById[ownerId] : undefined;
  const status = owner ? 'claimed' : 'available';

  return {
    id: segment.id,
    osmWayId: segment.osmWayId,
    name: segment.name,
    crossStreet: `Block segment · ${Math.round(segment.distanceMeters)} meters`,
    distance: metersToMiles(segment.distanceMeters),
    coordinates: segment.coordinates.map(([latitude, longitude]) => [latitude, longitude] as [number, number]),
    status,
    ownerId,
    ownerName: owner?.name,
    ownerColor: owner?.color,
    volunteer: owner?.name,
  } satisfies CleanupArea;
});

