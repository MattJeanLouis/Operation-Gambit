import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // État du jeu
  gameMode: null, // null, 'local', 'ai', 'energy-local', 'energy-ai'
  aiDifficulty: 1, // 1-20 (niveaux Stockfish)
  playerColor: 'white', // 'white' ou 'black' pour le mode IA
  isGameStarted: false,
  
  // Configuration Energy Mode - SIMPLIFIÉE
  energyConfig: {
    maxEnergy: 6,        // Réduit de 10 à 6 pour plus de dynamisme
    regenRate: 2.0,      // Augmenté de 1.0 à 2.0 pour plus de fluidité
    refreshCost: 1,      // Réduit de 2 à 1 pour encourager le refresh
    refreshAllCost: 3,   // Nouveau : coût pour refresh toute la main
    replaceDelay: 300,   // Réduit de 500 à 300ms pour plus de réactivité
    matchClockSeconds: 300, // 5 minutes
  },
  
  // Actions
  setGameMode: (mode) => set({ gameMode: mode }),
  setAiDifficulty: (difficulty) => set({ aiDifficulty: difficulty }),
  setPlayerColor: (color) => set({ playerColor: color }),
  startGame: () => set({ isGameStarted: true }),
  resetGame: () => set({ 
    gameMode: null, 
    isGameStarted: false 
  }),
  
  // Configuration
  showMainMenu: () => set({ 
    gameMode: null, 
    isGameStarted: false 
  }),
  
  // Energy Mode helpers
  isEnergyMode: () => {
    const state = get();
    return state.gameMode?.startsWith('energy-');
  },
}));

export default useGameStore; 