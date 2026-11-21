import type { CleanupArea } from '@/types/cleanup';
import roadSegments from '@/data/downingtown-road-segments.json';

type RoadSegment = {
  id: string;
  osmWayId: number;
  name: string;
  distanceMeters: number;
  coordinates: number[][];
};

const metersToMiles = (meters: number) => `${Math.max(0.1, Math.round(meters / 160.934) / 10).toFixed(1)} mi`;

export const cleanupAreas: CleanupArea[] = (roadSegments as RoadSegment[]).map((segment, index) => {
  const status = index === 0 || index % 47 === 0
    ? 'completed'
    : index % 29 === 0
      ? 'claimed'
      : 'available';

  return {
    id: segment.id,
    osmWayId: segment.osmWayId,
    name: segment.name,
    crossStreet: `Block segment · ${Math.round(segment.distanceMeters)} meters`,
    distance: metersToMiles(segment.distanceMeters),
    coordinates: segment.coordinates.map(([latitude, longitude]) => [latitude, longitude] as [number, number]),
    status,
    volunteer: status === 'claimed' ? 'Community volunteer' : status === 'completed' ? 'Green Team' : undefined,
    completedAt: status === 'completed' ? 'Nov 16, 2026' : undefined,
  } satisfies CleanupArea;
});

