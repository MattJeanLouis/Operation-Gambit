import { Chess } from 'chess.js';

export class SimpleAI {
  constructor(difficulty = 1) {
    this.difficulty = difficulty; // 1-20
  }

  getBestMove(fen, timeLimit = 1000) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        try {
          const game = new Chess(fen);
          const moves = game.moves({ verbose: true });
          
          if (moves.length === 0) {
            console.warn('⚠️ Aucun coup légal disponible');
            resolve(null);
            return;
          }

          let selectedMove;
          
          if (this.difficulty <= 5) {
            // Coups complètement aléatoires
            selectedMove = moves[Math.floor(Math.random() * moves.length)];
          } else if (this.difficulty <= 10) {
            // Favoriser les captures
            const captures = moves.filter(move => move.captured);
            if (captures.length > 0 && Math.random() < 0.7) {
              selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else {
              selectedMove = moves[Math.floor(Math.random() * moves.length)];
            }
          } else {
            // Logique plus avancée (captures + échecs)
            const captures = moves.filter(move => move.captured);
            const checks = moves.filter(move => {
              try {
                const tempGame = new Chess(fen);
                tempGame.move(move);
                return tempGame.inCheck();
              } catch (e) {
                return false;
              }
            });
            
            if (checks.length > 0 && Math.random() < 0.5) {
              selectedMove = checks[Math.floor(Math.random() * checks.length)];
            } else if (captures.length > 0 && Math.random() < 0.8) {
              selectedMove = captures[Math.floor(Math.random() * captures.length)];
            } else {
              selectedMove = moves[Math.floor(Math.random() * moves.length)];
            }
          }
          
          // Construction sécurisée du coup
          const moveString = selectedMove.from + selectedMove.to;
          const promotion = selectedMove.promotion || '';
          const finalMove = moveString + promotion;
          
          console.log('🤖 IA choisit:', selectedMove.san, '(' + finalMove + ')');
          resolve(finalMove);
          
        } catch (error) {
          console.error('🚫 Erreur dans IA simple:', error);
          reject(error);
        }
      }, Math.random() * (timeLimit * 0.4) + 400);
    });
  }
}

export default SimpleAI; 