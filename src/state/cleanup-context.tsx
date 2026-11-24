import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from 'react';

import { cleanupAreas as initialAreas } from '@/data/mock-cleanups';
import { personaById, personas, type Persona } from '@/data/mock-personas';
import type { CleanupArea, CleanupReport } from '@/types/cleanup';

type LeaderboardEntry = Persona & { blocks: number; points: number; connections: number; bonusPoints: number };
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
  reportArea: (id: string, report: CleanupReport) => void;
  isHydrated: boolean;
};

const CleanupContext = createContext<CleanupContextValue | null>(null);
const TERRITORY_KEY = 'community-cleanup:territory:v3';
const PERSONA_KEY = 'community-cleanup:persona:v1';
const REPORTS_KEY = 'community-cleanup:reports:v1';

function countConnections(areas: CleanupArea[]) {
  const thresholdSquared = 0.00035 ** 2;
  let connections = 0;
  for (let first = 0; first < areas.length; first += 1) {
    const firstPoints = areas[first].coordinates ?? [];
    const firstEnds = [firstPoints[0], firstPoints[firstPoints.length - 1]].filter(Boolean);
    for (let second = first + 1; second < areas.length; second += 1) {
      const secondPoints = areas[second].coordinates ?? [];
      const secondEnds = [secondPoints[0], secondPoints[secondPoints.length - 1]].filter(Boolean);
      if (firstEnds.some(([latA, lonA]) => secondEnds.some(([latB, lonB]) => (latA - latB) ** 2 + (lonA - lonB) ** 2 <= thresholdSquared))) connections += 1;
    }
  }
  return connections;
}

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
        const [storedTerritory, storedPersona, storedReports] = await Promise.all([AsyncStorage.getItem(TERRITORY_KEY), AsyncStorage.getItem(PERSONA_KEY), AsyncStorage.getItem(REPORTS_KEY)]);
        const ownership: Record<string, { ownerId: string; capturedAt?: string; source?: 'camera' | 'library' }> | null = storedTerritory ? JSON.parse(storedTerritory) : null;
        if (ownership) setAreas((current) => current.map((area) => {
          const saved = ownership[area.id];
          return saved ? assignOwner(area, saved.ownerId, saved.capturedAt && saved.source ? { capturedAt: saved.capturedAt, source: saved.source } : undefined) : assignOwner(area);
        }));
        if (storedPersona && personaById[storedPersona]) setCurrentPersonaIdState(storedPersona);
        const reports: Record<string, CleanupReport> | null = storedReports ? JSON.parse(storedReports) : null;
        if (reports) setAreas((current) => current.map((area) => ({ ...area, cleanupReport: reports[area.id] })));
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

  useEffect(() => {
    if (!isHydrated) return;
    const reports = Object.fromEntries(areas.filter((area) => area.cleanupReport).map((area) => [area.id, area.cleanupReport]));
    void AsyncStorage.setItem(REPORTS_KEY, JSON.stringify(reports));
  }, [areas, isHydrated]);

  const setCurrentPersonaId = (id: string) => {
    if (!personaById[id]) return;
    setCurrentPersonaIdState(id);
    void AsyncStorage.setItem(PERSONA_KEY, id);
  };

  const claimArea = (id: string, proof: CleanupProof) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.ownerId === currentPersonaId) return false;
    setAreas((current) => current.map((item) => item.id === id ? { ...assignOwner(item, currentPersonaId, proof), cleanupReport: undefined } : item));
    return true;
  };

  const releaseArea = (id: string) => {
    const area = areas.find((item) => item.id === id);
    if (!area || area.ownerId !== currentPersonaId) return false;
    setAreas((current) => current.map((item) => item.id === id ? assignOwner(item) : item));
    return true;
  };

  const reportArea = (id: string, report: CleanupReport) => {
    setAreas((current) => current.map((item) => item.id === id ? { ...item, cleanupReport: report } : item));
  };

  const currentPersona = personaById[currentPersonaId] ?? personas[0];
  const leaderboard = personas.map((persona) => {
    const ownedAreas = areas.filter((area) => area.ownerId === persona.id);
    const blocks = ownedAreas.length;
    const connections = countConnections(ownedAreas);
    const bonusPoints = connections * 5;
    return { ...persona, blocks, connections, bonusPoints, points: blocks * 10 + bonusPoints };
  }).sort((a, b) => b.points - a.points);

  return (
    <CleanupContext.Provider value={{
      areas, claimArea, releaseArea, reportArea, isHydrated, currentPersona, personas, leaderboard, setCurrentPersonaId,
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
