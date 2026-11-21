import { createContext, useContext, useState, type PropsWithChildren } from 'react';

import { cleanupAreas as initialAreas } from '@/data/mock-cleanups';
import type { CleanupArea } from '@/types/cleanup';

type CleanupContextValue = {
  areas: CleanupArea[];
  myCleanups: CleanupArea[];
  claimArea: (id: string) => boolean;
};

const CleanupContext = createContext<CleanupContextValue | null>(null);

export function CleanupProvider({ children }: PropsWithChildren) {
  const [areas, setAreas] = useState(initialAreas);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);

  const claimArea = (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.status !== 'available') return false;

    setAreas((current) => current.map((item) => (
      item.id === id ? { ...item, status: 'claimed', volunteer: 'Alex Rivera' } : item
    )));
    setClaimedIds((current) => [...current, id]);
    return true;
  };

  const value = {
    areas,
    claimArea,
    myCleanups: areas.filter((area, index) => claimedIds.includes(area.id) || index === 0),
  };

  return <CleanupContext.Provider value={value}>{children}</CleanupContext.Provider>;
}

export function useCleanups() {
  const context = useContext(CleanupContext);
  if (!context) throw new Error('useCleanups must be used inside CleanupProvider');
  return context;
}
