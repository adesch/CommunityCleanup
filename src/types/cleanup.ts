export type CleanupStatus = 'available' | 'claimed';
export type CleanupIssue = 'Litter' | 'Overflowing bin' | 'Illegal dumping' | 'Other';
export type CleanupSeverity = 'Low' | 'Medium' | 'High';
export type CleanupReport = { issue: CleanupIssue; severity: CleanupSeverity; note: string; reportedAt: string };

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
  cleanupReport?: CleanupReport;
};

