import React, { useState, useEffect, useRef } from 'react';
import { Chess } from 'chess.js';
import useGameStore from '../store/gameStore';
import { useStockfish } from '../hooks/useStockfish';
import { initializeChessweeperBoard } from '../utils/chessweeper';
import './ChessweeperBoard.css';

const initialFen = new Chess().fen();

function ChessweeperBoard() {
  const { 
    gameMode, 
    aiDifficulty, 
    playerColor, 
    showMainMenu,
    chessweeperBoard,
    minesRemaining,
    flags,
    chessweeperMineCount,
    setupChessweeper,
    updateChessweeperCell,
    toggleFlag,
    decrementMinesRemaining
  } = useGameStore();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState('White to move');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([initialFen]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  const [piecesCapturedByWhite, setPiecesCapturedByWhite] = useState([]);
  const [piecesCapturedByBlack, setPiecesCapturedByBlack] = useState([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const boardRef = useRef(null);
  const sidebarRef = useRef(null);
  
  // IA Hook
  const { isReady: aiReady, isThinking, makeMove: makeAiMove, setOnMoveCallback } = useStockfish(aiDifficulty);
  
  // Initialize Chessweeper board on game start
  useEffect(() => {
    // Make sure this runs only for chessweeper modes
    if (gameMode.startsWith('chessweeper-')) {
      console.log('Initializing Chessweeper board with', chessweeperMineCount, 'mines');
      const { board, minesPlaced } = initializeChessweeperBoard(chessweeperMineCount);
      setupChessweeper(board, minesPlaced);
    }
  }, [gameMode, chessweeperMineCount]); // removed setupChessweeper from deps to avoid re-init

  // Callback pour les coups de l'IA
  const handleAiMove = React.useCallback((bestMove) => {
    if (!bestMove || !gameMode.endsWith('-ai')) return;
    
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
        handleMove(moveObj);
      } else {
        console.warn('⚠️ IA coup invalide:', bestMove, 'Position:', game.fen());
      }
    } catch (error) {
      console.error('🚫 Erreur validation coup IA:', error, bestMove);
    }
  }, [gameMode, game, handleMove]);
  
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
    if (gameMode.endsWith('-ai') && playerColor === 'black' && 
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
      if (gameMode.endsWith('-ai')) {
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
      if (gameMode.endsWith('-ai')) {
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

  function getSquare(file, rank) {
    return `${String.fromCharCode('a'.charCodeAt(0) + file)}${8 - rank}`;
  }

  function getCoords(square) {
    const file = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = 8 - parseInt(square[1], 10);
    return { file, rank };
  }

  function revealAdjacentSquares(square) {
    const { file, rank } = getCoords(square);
    const squaresToReveal = [square];
    const processed = new Set([square]);
  
    let i = 0;
    while (i < squaresToReveal.length) {
      const currentSquare = squaresToReveal[i++];
      updateChessweeperCell(currentSquare, { status: 'revealed' });
      
      const currentCell = chessweeperBoard[currentSquare];
      if (currentCell && currentCell.adjacentMines === 0) {
        const { file: f, rank: r } = getCoords(currentSquare);
        for (let df = -1; df <= 1; df++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (df === 0 && dr === 0) continue;
            
            const nextFile = f + df;
            const nextRank = r + dr;
  
            if (nextFile >= 0 && nextFile < 8 && nextRank >= 0 && nextRank < 8) {
              const adjacentSquare = getSquare(nextFile, nextRank);
              if (!processed.has(adjacentSquare) && chessweeperBoard[adjacentSquare].status === 'unknown') {
                squaresToReveal.push(adjacentSquare);
                processed.add(adjacentSquare);
              }
            }
          }
        }
      }
    }
  }

  function handleMove(move) {
    const fromSquare = move.from;
    const toSquare = move.to;

    // Custom rule: Prevent illegal castling based on Chessweeper rules
    const piece = game.get(fromSquare);
    if (piece && piece.type === 'k') {
      const fromFile = fromSquare.charCodeAt(0);
      const toFile = toSquare.charCodeAt(0);
      if (Math.abs(fromFile - toFile) > 1) { // Detect castling
        let squaresToCheck = [];
        if (toSquare === 'g1') squaresToCheck = ['f1', 'g1'];
        else if (toSquare === 'c1') squaresToCheck = ['c1', 'd1'];
        else if (toSquare === 'g8') squaresToCheck = ['f8', 'g8'];
        else if (toSquare === 'c8') squaresToCheck = ['c8', 'd8'];
        
        for (const sq of squaresToCheck) {
          if (chessweeperBoard[sq].hasMine || chessweeperBoard[sq].status !== 'revealed') {
            console.warn(`Castling to ${toSquare} aborted: square ${sq} is not safe or revealed.`);
            setSelectedSquare(null);
            return; // Abort move
          }
        }
      }
    }

    const targetCell = chessweeperBoard[toSquare];

    // Case 1: Stepped on a mine
    if (targetCell.hasMine) {
      updateChessweeperCell(toSquare, { status: 'exploded' });
      decrementMinesRemaining();

      // If KING explodes, game over.
      if (piece.type === 'k') {
        const winner = piece.color === 'w' ? 'Noirs' : 'Blancs';
        setStatus(`Le roi ${piece.color === 'w' ? 'Blanc' : 'Noir'} a explosé ! ${winner} gagnent.`);
        setIsGameOver(true);
        setSelectedSquare(null);
        return;
      }

      // If NOT a king, remove piece and pass turn.
      const gameCopy = new Chess(game.fen());
      gameCopy.remove(fromSquare);

      // Pass turn
      const fenTokens = gameCopy.fen().split(" ");
      fenTokens[1] = fenTokens[1] === 'w' ? 'b' : 'w'; // Switch turn
      fenTokens[3] = '-'; // Reset en-passant
      const newFen = fenTokens.join(" ");
      const nextTurnGame = new Chess(newFen);
      
      setGame(nextTurnGame);
      setFenHistory([...fenHistory.slice(0, currentMoveIndex + 1), newFen]);
      setMoveHistory([...moveHistory.slice(0, currentMoveIndex), { san: `${piece.type.toUpperCase()}${toSquare}💥`, from: fromSquare, to: toSquare, piece: piece.type, color: piece.color }]);
      setCurrentMoveIndex(currentMoveIndex + 1);
      setSelectedSquare(null);

      // If game is not over, trigger AI move
      if (gameMode.endsWith('-ai') && aiReady && !isThinking) {
        setTimeout(() => {
          makeAiMove(nextTurnGame.fen(), 1500); // Use the new game state
        }, 600);
      }
      return; // IMPORTANT: Stop execution to not fall through to "Safe Square"
    }

    // Case 2: Safe square
    const gameCopy = new Chess(game.fen());
    const result = gameCopy.move(move);
    if(result === null) {
      setSelectedSquare(null);
      return;
    }

    if (targetCell.status === 'unknown') {
      if (targetCell.adjacentMines === 0) {
        revealAdjacentSquares(toSquare);
      } else {
        updateChessweeperCell(toSquare, { status: 'revealed' });
      }
    }

    const newFenHistory = fenHistory.slice(0, currentMoveIndex + 1);
    const newMoveHistory = moveHistory.slice(0, currentMoveIndex);

    setGame(gameCopy);
    const newFen = gameCopy.fen();
    setFenHistory([...newFenHistory, newFen]);
    setMoveHistory([...newMoveHistory, result]);
    setCurrentMoveIndex(newFenHistory.length);
    setSelectedSquare(null);
    
    // Trigger AI if needed
    if (gameMode.endsWith('-ai') && !gameCopy.isGameOver() && aiReady && !isThinking) {
      const isPlayerTurn = (gameCopy.turn() === 'w' && playerColor === 'white') || 
                          (gameCopy.turn() === 'b' && playerColor === 'black');
      
      if (!isPlayerTurn) {
        setTimeout(() => {
          makeAiMove(gameCopy.fen(), 1500);
        }, 600);
      }
    }
  }

  function onSquareClick(row, col) {
    const square = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
    
    if (game.isGameOver() || isGameOver) return;
    
    // Check if it's the player's turn in AI mode
    if (gameMode.endsWith('-ai') && currentMoveIndex === fenHistory.length - 1) {
      const isPlayerTurn = (game.turn() === 'w' && playerColor === 'white') || 
                          (game.turn() === 'b' && playerColor === 'black');
      if (!isPlayerTurn || isThinking) {
        return;
      }
    }
    
    // If a piece is selected, try to move
    if (selectedSquare) {
      if (selectedSquare === square) {
        return setSelectedSquare(null); // Deselect
      }
      handleMove({ from: selectedSquare, to: square, promotion: 'q' });
    } else {
      const piece = displayedGame.get(square);
      if (piece && piece.color === game.turn() && currentMoveIndex === fenHistory.length - 1) {
        setSelectedSquare(square);
      }
    }
  }

  function handleSquareRightClick(e, square) {
    e.preventDefault();
    if (chessweeperBoard[square].status === 'unknown') {
      toggleFlag(square);
    }
  }

  function onDragStart(event, row, col) {
    const square = String.fromCharCode('a'.charCodeAt(0) + col) + (8 - row);
    if (currentMoveIndex !== fenHistory.length - 1 || isGameOver) {
      event.preventDefault();
      return;
    }
    const piece = game.get(square);
    if (!piece || piece.color !== game.turn() || isGameOver) {
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
    handleMove({ from, to, promotion: 'q' });
  }

  function onResetClick() {
    setGame(new Chess());
    setSelectedSquare(null);
    setMoveHistory([]);
    setFenHistory([initialFen]);
    setCurrentMoveIndex(0);
    setStatus('White to move');
    setIsGameOver(false);
    // Re-initialize chessweeper board
    const { board, minesPlaced } = initializeChessweeperBoard(chessweeperMineCount);
    setupChessweeper(board, minesPlaced);
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

  const pieceUnicode = { p: '\u265F', r: '\u265C', n: '\u265E', b: '\u265D', q: '♛', k: '♚', P: '♙', R: '♖', N: '♘', B: '♗', Q: '♕', K: '♔' };

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
                  const isLight = (rowIndex + colIndex) % 2 === 1;
                  const cellInfo = chessweeperBoard ? chessweeperBoard[square] : null;

                  let tileClassName = `tile ${isLight ? 'light' : 'dark'}`;
                  if (selectedSquare === square) tileClassName += ' selected';
                  if (legalMoves.includes(square)) tileClassName += ' legal-move';
                  if (cellInfo && cellInfo.status === 'revealed') tileClassName += ' revealed';

                  return (
                    <div
                      key={`${rowIndex}-${colIndex}`}
                      className={tileClassName}
                      onClick={() => onSquareClick(rowIndex, colIndex)}
                      onContextMenu={(e) => handleSquareRightClick(e, square)}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={e => onDrop(e, rowIndex, colIndex)}
                    >
                      {cellInfo && (
                        <div className="overlay">
                          {flags.includes(square) && cellInfo.status === 'unknown' && <span className="flag">🚩</span>}
                          {cellInfo.status === 'revealed' && cellInfo.adjacentMines > 0 && (
                            <span className={`mine-count-${cellInfo.adjacentMines}`}>{cellInfo.adjacentMines}</span>
                          )}
                          {cellInfo.status === 'exploded' && <span className="explosion">💥</span>}
                        </div>
                      )}
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
            <span>{status}</span>
            <span style={{marginLeft: '20px'}}>Mines restantes : {minesRemaining}</span>
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

export default ChessweeperBoard; 