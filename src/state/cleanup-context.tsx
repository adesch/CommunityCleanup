import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { cleanupAreas as initialAreas } from '@/data/mock-cleanups';
import { personaById, personas, type Persona } from '@/data/mock-personas';
import type { CleanupArea } from '@/types/cleanup';

type LeaderboardEntry = Persona & { blocks: number; points: number };
export type CleanupProof = { capturedAt: string; source: 'camera' | 'library' };
type CleanupContextValue = {
  areas: CleanupArea[];
  myCleanups: CleanupArea[];
  currentPersona: Persona;
  personas: Persona[];
  leaderboard: LeaderboardEntry[];
  setCurrentPersonaId: (id: string) => void;
  claimArea: (id: string, proof: CleanupProof) => boolean;
  releaseArea: (id: string) => boolean;
  isHydrated: boolean;
};

const CleanupContext = createContext<CleanupContextValue | null>(null);
const TERRITORY_KEY = 'community-cleanup:territory:v3';
const PERSONA_KEY = 'community-cleanup:persona:v1';

function assignOwner(area: CleanupArea, ownerId?: string, proof?: CleanupProof): CleanupArea {
  const owner = ownerId ? personaById[ownerId] : undefined;
  return { ...area, status: owner ? 'claimed' : 'available', ownerId: owner?.id, ownerName: owner?.name, ownerColor: owner?.color, volunteer: owner?.name, proofCapturedAt: proof?.capturedAt, proofSource: proof?.source };
}

export function CleanupProvider({ children }: PropsWithChildren) {
  const [areas, setAreas] = useState(initialAreas);
  const [currentPersonaId, setCurrentPersonaIdState] = useState('alex');
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const restoreTerritory = async () => {
      try {
        const [storedTerritory, storedPersona] = await Promise.all([AsyncStorage.getItem(TERRITORY_KEY), AsyncStorage.getItem(PERSONA_KEY)]);
        const ownership: Record<string, { ownerId: string; capturedAt?: string; source?: 'camera' | 'library' }> | null = storedTerritory ? JSON.parse(storedTerritory) : null;
        if (ownership) setAreas((current) => current.map((area) => {
          const saved = ownership[area.id];
          return saved ? assignOwner(area, saved.ownerId, saved.capturedAt && saved.source ? { capturedAt: saved.capturedAt, source: saved.source } : undefined) : assignOwner(area);
        }));
        if (storedPersona && personaById[storedPersona]) setCurrentPersonaIdState(storedPersona);
      } catch (error) {
        console.warn('Could not restore territory', error);
      } finally {
        setIsHydrated(true);
      }
    };
    void restoreTerritory();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    const ownership = Object.fromEntries(areas.filter((area) => area.ownerId).map((area) => [area.id, {
      ownerId: area.ownerId,
      capturedAt: area.proofCapturedAt,
      source: area.proofSource,
    }]));
    void AsyncStorage.setItem(TERRITORY_KEY, JSON.stringify(ownership));
  }, [areas, isHydrated]);

  const setCurrentPersonaId = (id: string) => {
    if (!personaById[id]) return;
    setCurrentPersonaIdState(id);
    void AsyncStorage.setItem(PERSONA_KEY, id);
  };

  const claimArea = (id: string, proof: CleanupProof) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.ownerId === currentPersonaId) return false;
    setAreas((current) => current.map((item) => item.id === id ? assignOwner(item, currentPersonaId, proof) : item));
    return true;
  };

  const releaseArea = (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.ownerId !== currentPersonaId) return false;
    setAreas((current) => current.map((item) => item.id === id ? assignOwner(item) : item));
    return true;
  };

  const currentPersona = personaById[currentPersonaId] ?? personas[0];
  const leaderboard = personas.map((persona) => {
    const blocks = areas.filter((area) => area.ownerId === persona.id).length;
    return { ...persona, blocks, points: blocks * 10 };
  }).sort((a, b) => b.points - a.points);

  return (
    <CleanupContext.Provider value={{
      areas, claimArea, releaseArea, isHydrated, currentPersona, personas, leaderboard, setCurrentPersonaId,
      myCleanups: areas.filter((area) => area.ownerId === currentPersonaId),
    }}>
      {children}
    </CleanupContext.Provider>
  );
}

export function useCleanups() {
  const context = useContext(CleanupContext);
  if (!context) throw new Error('useCleanups must be used inside CleanupProvider');
  return context;
}
