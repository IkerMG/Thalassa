import { create } from 'zustand';
import type { AquariumSummary } from '../types/aquarium';

interface AquariumState {
  aquariums: AquariumSummary[];
  setAquariums: (list: AquariumSummary[]) => void;
  addAquarium: (a: AquariumSummary) => void;
  removeAquarium: (id: number) => void;
}

export const useAquariumStore = create<AquariumState>((set) => ({
  aquariums: [],
  setAquariums: (list) => set({ aquariums: list }),
  addAquarium: (a) => set((s) => ({ aquariums: [...s.aquariums, a] })),
  removeAquarium: (id) =>
    set((s) => ({ aquariums: s.aquariums.filter((aq) => aq.id !== id) })),
}));
