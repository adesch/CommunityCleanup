import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { cleanupAreas as initialAreas } from '@/data/mock-cleanups';
import type { CleanupArea } from '@/types/cleanup';

type CleanupContextValue = {
  areas: CleanupArea[];
  myCleanups: CleanupArea[];
  claimArea: (id: string) => boolean;
  releaseArea: (id: string) => boolean;
  isHydrated: boolean;
};

const CleanupContext = createContext<CleanupContextValue | null>(null);
const CLAIMED_STREETS_KEY = 'community-cleanup:claimed-streets:v1';

export function CleanupProvider({ children }: PropsWithChildren) {
  const [areas, setAreas] = useState(initialAreas);
  const [claimedIds, setClaimedIds] = useState<string[]>([]);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const restoreClaims = async () => {
      try {
        const stored = await AsyncStorage.getItem(CLAIMED_STREETS_KEY);
        const restoredIds: string[] = stored ? JSON.parse(stored) : [];
        setClaimedIds(restoredIds);
        setAreas((current) => current.map((item) => (
          restoredIds.includes(item.id) && item.status === 'available'
            ? { ...item, status: 'claimed', volunteer: 'Alex Rivera' }
            : item
        )));
      } catch (error) {
        console.warn('Could not restore claimed streets', error);
      } finally {
        setIsHydrated(true);
      }
    };
    void restoreClaims();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    void AsyncStorage.setItem(CLAIMED_STREETS_KEY, JSON.stringify(claimedIds));
  }, [claimedIds, isHydrated]);

  const claimArea = (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.status !== 'available') return false;

    setAreas((current) => current.map((item) => (
      item.id === id ? { ...item, status: 'claimed', volunteer: 'Alex Rivera' } : item
    )));
    setClaimedIds((current) => [...current, id]);
    return true;
  };

  const releaseArea = (id: string) => {
    if (!claimedIds.includes(id)) return false;
    setAreas((current) => current.map((item) => (
      item.id === id ? { ...item, status: 'available', volunteer: undefined } : item
    )));
    setClaimedIds((current) => current.filter((claimedId) => claimedId !== id));
    return true;
  };

  const value = {
    areas,
    claimArea,
    releaseArea,
    isHydrated,
    myCleanups: areas.filter((area, index) => claimedIds.includes(area.id) || index === 0),
  };

  return <CleanupContext.Provider value={value}>{children}</CleanupContext.Provider>;
}

export function useCleanups() {
  const context = useContext(CleanupContext);
  if (!context) throw new Error('useCleanups must be used inside CleanupProvider');
  return context;
}
