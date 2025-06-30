import { create } from 'zustand';

const useGameStore = create((set, get) => ({
  // État du jeu
  gameMode: null, // null, 'local', 'ai', 'energy-local', 'energy-ai'
  aiDifficulty: 1, // 1-20 (niveaux Stockfish)
  playerColor: 'white', // 'white' ou 'black' pour le mode IA
  isGameStarted: false,
  
  // État Chessweeper
  chessweeperBoard: null, // Grille 8x8 avec { hasMine: bool, adjacentMines: int, status: 'unknown' | 'revealed' | 'exploded' }
  minesRemaining: 0,
  flags: [], // Tableau des cases flaggées, ex: ['e4', 'f5']
  chessweeperMineCount: 10, // Nombre de mines à la configuration

  // État PongChess
  pongScore: { white: 0, black: 0 },
  pongPhase: 'paused', // 'playing', 'paused', 'ended'
  chessTurnAcquiredBy: null, // 'white' | 'black' | null
  pongStreak: { player: null, count: 0 },

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
    isGameStarted: false,
    chessweeperBoard: null,
    minesRemaining: 0,
    flags: [],
    pongScore: { white: 0, black: 0 },
    pongPhase: 'paused',
    chessTurnAcquiredBy: null,
    pongStreak: { player: null, count: 0 },
  }),
  
  // Configuration
  showMainMenu: () => set({ 
    gameMode: null, 
    isGameStarted: false,
    chessweeperBoard: null,
    minesRemaining: 0,
    flags: [],
    pongScore: { white: 0, black: 0 },
    pongPhase: 'paused',
    chessTurnAcquiredBy: null,
    pongStreak: { player: null, count: 0 },
  }),
  
  // Actions Chessweeper
  setChessweeperMineCount: (count) => set ({ chessweeperMineCount: count }),
  setupChessweeper: (board, minesCount) => set({
    chessweeperBoard: board,
    minesRemaining: minesCount,
    flags: [],
    isGameStarted: true,
  }),
  updateChessweeperCell: (square, newCellData) => set((state) => {
    if (!state.chessweeperBoard) return {};
    const newBoard = { ...state.chessweeperBoard };
    newBoard[square] = { ...newBoard[square], ...newCellData };
    return { chessweeperBoard: newBoard };
  }),
  toggleFlag: (square) => set((state) => {
    const flags = state.flags.includes(square)
      ? state.flags.filter(f => f !== square)
      : [...state.flags, square];
    return { flags };
  }),
  decrementMinesRemaining: () => set((state) => ({ minesRemaining: state.minesRemaining - 1 })),

  // Actions PongChess
  scorePongPoint: (winner) => set((state) => {
    const newScore = { ...state.pongScore, [winner]: state.pongScore[winner] + 1 };
    
    let newStreak = { ...state.pongStreak };
    if (state.pongStreak.player === winner) {
      newStreak.count++;
    } else {
      newStreak = { player: winner, count: 1 };
    }

    let turnGoesTo = winner;
    // Streak cap rule: after 3 consecutive moves, the turn is forced to the other player
    if (newStreak.count >= 3) {
      console.log(`Streak cap of 3 reached by ${winner}. Next turn is forced for opponent.`);
      turnGoesTo = winner === 'white' ? 'black' : 'white';
      newStreak = { player: turnGoesTo, count: 0 }; // Reset streak
    }

    return {
      pongScore: newScore,
      pongPhase: 'paused',
      chessTurnAcquiredBy: turnGoesTo,
      pongStreak: newStreak
    };
  }),

  completePongChessTurn: () => set({
    chessTurnAcquiredBy: null,
    pongPhase: 'playing'
  }),

  setPongPhase: (phase) => set({ pongPhase: phase }),

  // Energy Mode helpers
  isEnergyMode: () => {
    const state = get();
    return state.gameMode?.startsWith('energy-');
  },

  isChessweeperMode: () => {
    const state = get();
    return state.gameMode?.startsWith('chessweeper-');
  },

  isPongChessMode: () => {
    const state = get();
    return state.gameMode?.startsWith('pongchess-');
  }
}));

export default useGameStore; 