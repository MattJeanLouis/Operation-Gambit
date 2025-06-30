const SQUARES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const FILES = SQUARES;
const RANKS = ['1', '2', '3', '4', '5', '6', '7', '8'];

/**
 * Fonctions utilitaires pour les coordonnées
 */
const getSquare = (file, rank) => `${FILES[file]}${RANKS[rank]}`;
const getCoords = (square) => {
  const file = FILES.indexOf(square[0]);
  const rank = RANKS.indexOf(square[1]);
  return [file, rank];
};

/**
 * Initialise le plateau pour le mode Chessweeper.
 * @param {number} mineCount - Le nombre total de mines à placer (doit être pair).
 * @returns {{board: Object, minesPlaced: number}} - L'objet du plateau et le nombre de mines.
 */
export function initializeChessweeperBoard(mineCount = 10) {
  if (mineCount % 2 !== 0) {
    console.warn("Le nombre de mines doit être pair pour la symétrie. Utilisation de ", mineCount - 1);
    mineCount--;
  }

  const board = {};
  for (const rank of RANKS) {
    for (const file of FILES) {
      board[`${file}${rank}`] = {
        hasMine: false,
        adjacentMines: 0,
        status: 'unknown', // 'unknown', 'revealed', 'exploded'
      };
    }
  }

  // Placer les mines symétriquement sur les rangées centrales (3 à 6)
  const placeableRanks = [2, 3]; // index 2 et 3 (rangs '3' et '4')
  const availableSquares = [];
  for (const rankIndex of placeableRanks) {
    for (let fileIndex = 0; fileIndex < FILES.length; fileIndex++) {
      availableSquares.push(getSquare(fileIndex, rankIndex));
    }
  }

  let minesToPlace = mineCount / 2;
  while (minesToPlace > 0 && availableSquares.length > 0) {
    const randomIndex = Math.floor(Math.random() * availableSquares.length);
    const square = availableSquares.splice(randomIndex, 1)[0];
    
    const [file, rank] = getCoords(square);
    const mirrorRank = 7 - rank;
    const mirrorSquare = getSquare(file, mirrorRank);

    if (!board[square].hasMine) {
      board[square].hasMine = true;
      board[mirrorSquare].hasMine = true;
      minesToPlace--;
    }
  }

  const minesPlaced = Object.values(board).filter(c => c.hasMine).length;

  // Calculer les mines adjacentes pour chaque case
  for (const square in board) {
    if (board[square].hasMine) {
      board[square].adjacentMines = -1; // -1 pour indiquer une mine
      continue;
    }

    const [file, rank] = getCoords(square);
    let mineCount = 0;
    for (let df = -1; df <= 1; df++) {
      for (let dr = -1; dr <= 1; dr++) {
        if (df === 0 && dr === 0) continue;
        
        const adjacentFile = file + df;
        const adjacentRank = rank + dr;

        if (adjacentFile >= 0 && adjacentFile < 8 && adjacentRank >= 0 && adjacentRank < 8) {
          const adjacentSquare = getSquare(adjacentFile, adjacentRank);
          if (board[adjacentSquare].hasMine) {
            mineCount++;
          }
        }
      }
    }
    board[square].adjacentMines = mineCount;
  }

  return { board, minesPlaced };
} 