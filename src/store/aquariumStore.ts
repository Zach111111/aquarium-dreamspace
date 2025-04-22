
import { create } from 'zustand';

interface AquariumState {
  orbitSpeed: number;
  colorShift: boolean;
  musicVolume: number;
  isMenuOpen: boolean;
  setOrbitSpeed: (speed: number) => void;
  toggleColorShift: () => void;
  setMusicVolume: (volume: number) => void;
  toggleMenu: () => void;
}

export const useAquariumStore = create<AquariumState>((set) => ({
  orbitSpeed: 0.5,
  colorShift: false,
  musicVolume: 0.5,
  isMenuOpen: false,
  setOrbitSpeed: (speed) => set({ orbitSpeed: speed }),
  toggleColorShift: () => set((state) => ({ colorShift: !state.colorShift })),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
}));
