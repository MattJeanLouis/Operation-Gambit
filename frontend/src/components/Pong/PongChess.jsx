import React, { useEffect } from 'react';
import useGameStore from '../../store/gameStore';
import ChessBoard from '../ChessBoard';
import PongGame from './PongGame';
import './PongChess.css';

function PongChess() {
  const {
    pongScore,
    pongPhase,
    chessTurnAcquiredBy,
    setPongPhase,
    scorePongPoint,
    completePongChessTurn,
    showMainMenu,
  } = useGameStore();

  useEffect(() => {
    // Start the game in Pong phase
    setPongPhase('playing');
  }, [setPongPhase]);

  const handleChessMove = () => {
    console.log('Chess move completed, switching back to Pong.');
    completePongChessTurn();
  };
  
  const handlePointScored = (winner) => {
    console.log(`Point scored by ${winner}, pausing Pong for Chess move.`);
    scorePongPoint(winner);
  };

  const whoseTurnText = () => {
    if (chessTurnAcquiredBy) {
      return `Aux ${chessTurnAcquiredBy === 'white' ? 'Blancs' : 'Noirs'} de jouer !`;
    }
    return "Phase de Pong !";
  };

  return (
    <div className="pong-chess-container">
      <div className="pong-chess-header">
        <h2>Pong Échecs</h2>
        <div className={`pong-chess-turn-indicator turn-${chessTurnAcquiredBy || 'none'}`}>
          {whoseTurnText()}
        </div>
        <div className="pong-chess-score">
          Score: {pongScore.white} - {pongScore.black}
        </div>
      </div>
      
      <div className={`chess-area-wrapper ${pongPhase === 'playing' ? 'disabled' : ''}`}>
        <ChessBoard
          onMove={handleChessMove}
          isMoveAllowed={!!chessTurnAcquiredBy}
          playerTurn={chessTurnAcquiredBy}
        />
      </div>

      <PongGame
        phase={pongPhase}
        onPointScored={handlePointScored}
        chessTurnPlayer={chessTurnAcquiredBy}
      />

      <div className="pong-chess-controls">
        <button onClick={() => setPongPhase(pongPhase === 'playing' ? 'paused' : 'playing')}>
          {pongPhase === 'playing' ? 'Pause' : 'Reprendre'}
        </button>
        <button onClick={showMainMenu}>Menu Principal</button>
      </div>
    </div>
  );
}

export default PongChess; 