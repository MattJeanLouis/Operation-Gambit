import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import useGameStore from '../store/gameStore';
import { useStockfish } from '../hooks/useStockfish';
import './ChessBoard.css';

const initialFen = new Chess().fen();

function ChessBoard() {
  const { gameMode, aiDifficulty, playerColor, showMainMenu } = useGameStore();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState('White to move');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([initialFen]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [piecesCapturedByWhite, setPiecesCapturedByWhite] = useState([]);
  const [piecesCapturedByBlack, setPiecesCapturedByBlack] = useState([]);
  const boardRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // IA Hook
  const { isReady: aiReady, isThinking, makeMove: makeAiMove, setOnMoveCallback } = useStockfish(aiDifficulty);
  
  // Callback pour les coups de l'IA
  const handleAiMove = React.useCallback((bestMove) => {
    if (!bestMove || gameMode !== 'ai') return;
    
    // Validation stricte du coup
    const moveObj = { from: bestMove.slice(0, 2), to: bestMove.slice(2, 4) };
    if (bestMove.length > 4) {
      moveObj.promotion = bestMove.slice(4);
    }
    
    // Vérifier avec l'état actuel du jeu
    const currentGame = new Chess(game.fen());
    try {
      const validMove = currentGame.move(moveObj);
      if (validMove) {
        console.log('✅ IA joue:', validMove.san);
        makeMove(moveObj);
      } else {
        console.warn('⚠️ IA coup invalide:', bestMove, 'Position:', game.fen());
      }
    } catch (error) {
      console.error('🚫 Erreur validation coup IA:', error, bestMove);
    }
  }, [gameMode, game, makeMove]);
  
  // Configurer le callback de l'IA
  React.useEffect(() => {
    setOnMoveCallback(handleAiMove);
  }, [handleAiMove, setOnMoveCallback]);

  const displayedGame = new Chess(fenHistory[currentMoveIndex]);
  const board = displayedGame.board();
  const legalMoves = selectedSquare ? game.moves({ square: selectedSquare, verbose: true }).map(m => m.to) : [];

  // Update status and captured pieces based on the displayed board state
  useEffect(() => {
    const tempGame = new Chess(fenHistory[currentMoveIndex]);
    updateStatus(tempGame);
    
    // Correctly calculate captures from the beginning of the history up to the current move
    const currentMoveHistory = moveHistory.slice(0, currentMoveIndex);
    const capturedByWhite = []; // Black pieces
    const capturedByBlack = []; // White pieces
    currentMoveHistory.forEach(move => {
      if (move.captured) {
        const capturedPiece = { type: move.captured, color: move.color === 'w' ? 'b' : 'w' };
        if (move.color === 'w') {
          capturedByWhite.push(capturedPiece);
        } else {
          capturedByBlack.push(capturedPiece);
        }
      }
    });
    setPiecesCapturedByWhite(capturedByWhite);
    setPiecesCapturedByBlack(capturedByBlack);
  }, [currentMoveIndex, moveHistory, fenHistory]);
  
  // Keyboard and mouse navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === 'ArrowLeft') handlePrevious();
    };
    const handleWheel = (e) => {
      // Only navigate history if the wheel event is not on the sidebar
      if (sidebarRef.current && sidebarRef.current.contains(e.target)) return;
      
      e.preventDefault(); // Prevent page scrolling
      if (e.deltaY < 0) handlePrevious();
      else handleNext();
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [currentMoveIndex, fenHistory]); // Deps are correct

  // Effet pour démarrer avec l'IA si le joueur est noir
  useEffect(() => {
    if (gameMode === 'ai' && playerColor === 'black' && 
        game.turn() === 'w' && moveHistory.length === 0 && aiReady && !isThinking) {
      console.log('🤖 IA commence (joueur noir)');
      setTimeout(() => {
        makeAiMove(game.fen(), 1500);
      }, 800);
    }
  }, [gameMode, playerColor, aiReady, moveHistory.length, isThinking, game, makeAiMove]);

  function updateStatus(gameInstance) {
    if (gameInstance.isCheckmate()) {
      setStatus('Échec et mat ! ' + (gameInstance.turn() === 'w' ? 'Les Noirs' : 'Les Blancs') + ' gagnent !');
    } else if (gameInstance.isStalemate()) {
      setStatus('Pat ! Match nul.');
    } else if (gameInstance.isCheck()) {
      const currentPlayer = gameInstance.turn() === 'w' ? 'Blancs' : 'Noirs';
      if (gameMode === 'ai') {
        if ((gameInstance.turn() === 'w' && playerColor === 'white') || 
            (gameInstance.turn() === 'b' && playerColor === 'black')) {
          setStatus(`À vous de jouer (${currentPlayer}) - Échec !`);
        } else {
          setStatus(`${isThinking ? 'IA réfléchit...' : 'IA doit jouer'} (${currentPlayer}) - Échec !`);
        }
      } else {
        setStatus(`${currentPlayer} doivent jouer - Échec !`);
      }
    } else {
      const currentPlayer = gameInstance.turn() === 'w' ? 'Blancs' : 'Noirs';
      if (gameMode === 'ai') {
        if ((gameInstance.turn() === 'w' && playerColor === 'white') || 
            (gameInstance.turn() === 'b' && playerColor === 'black')) {
          setStatus(`À vous de jouer (${currentPlayer})`);
        } else {
          setStatus(`${isThinking ? 'IA réfléchit...' : 'IA doit jouer'} (${currentPlayer})`);
        }
      } else {
        setStatus(`${currentPlayer} doivent jouer`);
      }
    }
  }

  function makeMove(move) {
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if(result === null) return;

    // If we are back in history, truncate the future
    const newFenHistory = fenHistory.slice(0, currentMoveIndex + 1);
    const newMoveHistory = moveHistory.slice(0, currentMoveIndex);

    setGame(gameCopy);
    const newFen = gameCopy.fen();
    setFenHistory([...newFenHistory, newFen]);
    setMoveHistory([...newMoveHistory, result]);
    setCurrentMoveIndex(newFenHistory.length);
    setSelectedSquare(null);
    
    // Déclencher coup de l'IA si nécessaire
    if (gameMode === 'ai' && !gameCopy.isGameOver() && aiReady && !isThinking) {
      const isPlayerTurn = (gameCopy.turn() === 'w' && playerColor === 'white') || 
                          (gameCopy.turn() === 'b' && playerColor === 'black');
      
      if (!isPlayerTurn) {
        console.log('🤖 IA doit jouer après coup joueur');
        setTimeout(() => {
          makeAiMove(gameCopy.fen(), 1500);
        }, 600);
      }
    }
  }

  function onSquareClick(row, col) {
    const square = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
    
    // Vérifier si c'est le tour du joueur en mode IA
    if (gameMode === 'ai' && currentMoveIndex === fenHistory.length - 1) {
      const isPlayerTurn = (game.turn() === 'w' && playerColor === 'white') || 
                          (game.turn() === 'b' && playerColor === 'black');
      if (!isPlayerTurn || isThinking) {
        return; // Pas le tour du joueur ou IA en train de réfléchir
      }
    }
    
    // If a piece is selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        return setSelectedSquare(null); // Deselect
      }
      makeMove({ from: selectedSquare, to: square, promotion: 'q' });
    } else {
      // If no piece is selected, select one
      const piece = displayedGame.get(square);
      // Can only select pieces if viewing the latest move
      if (piece && piece.color === game.turn() && currentMoveIndex === fenHistory.length - 1) {
        setSelectedSquare(square);
      }
    }
  }

  function onDragStart(event, row, col) {
    const square = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
    if (currentMoveIndex !== fenHistory.length - 1) {
      event.preventDefault();
      return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn()) {
      event.preventDefault();
      return;
    }
    setSelectedSquare(square);
    event.dataTransfer.setData('text/plain', square);
  }
  
  function onDrop(event, row, col) {
    event.preventDefault();
    const from = event.dataTransfer.getData('text/plain');
    const to = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
    makeMove({ from, to, promotion: 'q' });
  }

  function onResetClick() {
    setGame(new Chess());
    setSelectedSquare(null);
    setMoveHistory([]);
    setFenHistory([initialFen]);
    setCurrentMoveIndex(0);
    setStatus('White to move');
  }
  
  // Navigation handlers
  const handleGoToMove = (index) => setCurrentMoveIndex(index);
  const handlePrevious = () => setCurrentMoveIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setCurrentMoveIndex(prev => Math.min(fenHistory.length - 1, prev + 1));
  const handleGoToStart = () => setCurrentMoveIndex(0);
  const handleGoToEnd = () => setCurrentMoveIndex(fenHistory.length - 1);

  // Action handlers
  const handleOfferDraw = () => {
    alert("Nulle proposée ! (Fonctionnalité en attente d'un adversaire)");
  };
  const handleResign = () => {
    if (confirm('Voulez-vous vraiment abandonner la partie ?')) {
      alert('Vous avez abandonné.');
      // In a real app, you would set the game state to game over here
    }
  };

  const pieceUnicode = { p: '\u265F', r: '\u265C', n: '\u265E', b: '\u265D', q: '\u265B', k: '\u265A', P: '\u2659', R: '\u2656', N: '\u2658', B: '\u2657', Q: '\u2655', K: '\u2654' };

  function getPieceSymbol(piece) {
    if (!piece) return '';
    const letter = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
    return pieceUnicode[letter] || '';
  }

  function renderCapturedPieces(pieces) {
    return (
      <div className="captured-pieces">
        {pieces.map((p, i) => (
          <span key={i} className={`piece ${p.color === 'w' ? 'white-piece' : 'black-piece'}`}>{getPieceSymbol(p)}</span>
        ))}
      </div>
    );
  }
  
  function formatMoveHistory() {
    const formatted = [];
    for (let i = 0; i < moveHistory.length; i += 2) {
      const moveNumber = i / 2 + 1;
      const whiteMove = moveHistory[i] ? moveHistory[i].san : '';
      const blackMove = moveHistory[i + 1] ? moveHistory[i + 1].san : '';
      formatted.push({moveNumber, whiteMove, blackMove});
    }
    return formatted;
  }

  return (
    <div className="game-container">
      <div className="chessboard-area">
        <div className="chessboard-container">
          <div className="captured-container">
            <div className="capture-box">
              <div className="captured-label">White Captured</div>
              {renderCapturedPieces(piecesCapturedByWhite)}
            </div>
            <div className="capture-box">
              <div className="captured-label">Black Captured</div>
              {renderCapturedPieces(piecesCapturedByBlack)}
            </div>
          </div>
          <div className="chessboard-wrapper" ref={boardRef}>
            <div className="chessboard">
              <div className="coords-corner" />
              {'ABCDEFGH'.split('').map(file => (<div className="coords-file" key={file}>{file}</div>))}
              <div className="coords-corner" />
              {board.map((row, rowIndex) => [
                <div className="coords-rank" key={'rank-' + rowIndex}>{8 - rowIndex}</div>,
                ...row.map((piece, colIndex) => {
                  const square = String.fromCharCode('a'.charCodeAt(0) + colIndex) + (8 - rowIndex);
                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={`tile ${(rowIndex + colIndex) % 2 === 1 ? 'light' : 'dark'} ${selectedSquare === square ? 'selected' : ''} ${legalMoves.includes(square) ? 'legal-move' : ''}`}
                      onClick={() => onSquareClick(rowIndex, colIndex)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={e => onDrop(e, rowIndex, colIndex)}
                    >
                      {piece && (
                        <span
                          className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}
                          draggable={piece.color === game.turn() && currentMoveIndex === fenHistory.length - 1}
                          onDragStart={e => onDragStart(e, rowIndex, colIndex)}
                        >{getPieceSymbol(piece)}</span>
                      )}
                    </div>
                  );
                }),
                <div className="coords-rank" key={'rank2-' + rowIndex}>{8 - rowIndex}</div>
              ])}
              <div className="coords-corner" />
              {'ABCDEFGH'.split('').map(file => (<div className="coords-file" key={'file-bottom-' + file}>{file}</div>))}
              <div className="coords-corner" />
            </div>
          </div>
          <div className="status-bar">
            {status}
          </div>
        </div>
      </div>
      <div className="sidebar-area" ref={sidebarRef}>
        <div className="move-history-panel">
          <h3>Move History</h3>
          <div className="move-list">
             <table>
              <tbody>
                {formatMoveHistory().map(({moveNumber, whiteMove, blackMove}) => (
                  <tr key={moveNumber}>
                    <td className="move-number">{moveNumber}.</td>
                    <td className={`move-san ${currentMoveIndex === moveNumber * 2 - 1 ? 'active-move' : ''}`} onClick={() => handleGoToMove(moveNumber * 2 - 1)}>{whiteMove}</td>
                    <td className={`move-san ${currentMoveIndex === moveNumber * 2 ? 'active-move' : ''}`} onClick={() => handleGoToMove(moveNumber * 2)}>{blackMove}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="navigation-buttons">
            <button onClick={handleGoToStart}>&lt;&lt;</button>
            <button onClick={handlePrevious}>&lt;</button>
            <button onClick={handleNext}>&gt;</button>
            <button onClick={handleGoToEnd}>&gt;&gt;</button>
          </div>
        </div>
        <div className="action-panel">
          <button onClick={onResetClick}>Nouvelle Partie</button>
          <button onClick={handleOfferDraw}>Proposer Nulle</button>
          <button onClick={handleResign}>Abandonner</button>
          <button onClick={showMainMenu} className="menu-button">Menu Principal</button>
        </div>
      </div>
    </div>
  );
}

export default ChessBoard;