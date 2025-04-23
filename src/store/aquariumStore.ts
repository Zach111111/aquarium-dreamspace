import { create } from 'zustand';

interface AquariumState {
  orbitSpeed: number;
  colorShift: boolean;
  musicVolume: number;
  isMenuOpen: boolean;
  speedFactor: number;
  score: number;
  highScore: number;
  gameWon: boolean;
  setOrbitSpeed: (speed: number) => void;
  toggleColorShift: () => void;
  setMusicVolume: (volume: number) => void;
  toggleMenu: () => void;
  setSpeedFactor: (speed: number) => void;
  incrementScore: () => void;
  resetScore: () => void;
  resetGame: () => void;
}

export const useAquariumStore = create<AquariumState>((set) => ({
  orbitSpeed: 0.5,
  colorShift: false,
  musicVolume: 0.5,
  isMenuOpen: false,
  speedFactor: 1.0,
  score: 0,
  highScore: 0,
  gameWon: false,
  setOrbitSpeed: (speed) => set({ orbitSpeed: speed }),
  toggleColorShift: () => set((state) => ({ colorShift: !state.colorShift })),
  setMusicVolume: (volume) => set({ musicVolume: volume }),
  toggleMenu: () => set((state) => ({ isMenuOpen: !state.isMenuOpen })),
  setSpeedFactor: (speed) => set({ speedFactor: speed }),
  incrementScore: () => set((state) => {
    const newScore = state.score + 1;
    return {
      score: newScore,
      highScore: Math.max(state.highScore, newScore),
      gameWon: newScore >= 10
    };
  }),
  resetScore: () => set({ score: 0 }),
  resetGame: () => set((state) => ({ 
    score: 0, 
    gameWon: false,
    highScore: state.highScore 
  })),
}));
