export type CleanupStatus = 'available' | 'claimed' | 'completed';

export type CleanupArea = {
  id: string;
  name: string;
  crossStreet: string;
  status: CleanupStatus;
  distance: string;
  volunteer?: string;
  completedAt?: string;
  coordinates?: [number, number][];
  osmWayId?: number;
};

