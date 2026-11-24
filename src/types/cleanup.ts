export type CleanupStatus = 'available' | 'claimed';

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
  ownerId?: string;
  ownerName?: string;
  ownerColor?: string;
  proofCapturedAt?: string;
  proofSource?: 'camera' | 'library';
};

