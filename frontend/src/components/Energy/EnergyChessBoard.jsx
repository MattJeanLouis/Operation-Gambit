import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Chess } from 'chess.js';
import useGameStore from '../../store/gameStore';
import { useStockfish } from '../../hooks/useStockfish';
import EnergyBar from './EnergyBar';
import CardHand from './CardHand';
import { generateHand, updateHandLegality, calculateMoveCost } from '../../utils/energyChess';
import '../ChessBoard.css';
import './EnergyChessBoard.css';

const initialFen = new Chess().fen();

function EnergyChessBoard() {
  const { gameMode, aiDifficulty, playerColor, energyConfig, showMainMenu } = useGameStore();
  const [game, setGame] = useState(new Chess());
  const [selectedSquare, setSelectedSquare] = useState(null);
  const [status, setStatus] = useState('Blancs doivent jouer');
  const [moveHistory, setMoveHistory] = useState([]);
  const [fenHistory, setFenHistory] = useState([initialFen]);
  const [currentMoveIndex, setCurrentMoveIndex] = useState(0);
  
  // États Energy Mode
  const [whitePlayer, setWhitePlayer] = useState({
    energy: energyConfig.maxEnergy,
    hand: [],
    lastRegenTick: Date.now()
  });
  const [blackPlayer, setBlackPlayer] = useState({
    energy: energyConfig.maxEnergy,
    hand: [],
    lastRegenTick: Date.now()
  });
  const [matchClock, setMatchClock] = useState(energyConfig.matchClockSeconds * 1000);
  const [gameStartTime] = useState(Date.now());
  const [isGameActive, setIsGameActive] = useState(true);
  
  // États de feedback visuel
  const [hoveredCard, setHoveredCard] = useState(null);
  const [highlightedSquares, setHighlightedSquares] = useState({
    from: null,
    to: null,
    special: []
  });
  
  // États d'animation
  const [playingCard, setPlayingCard] = useState(null);
  const [movingPiece, setMovingPiece] = useState(null);
  const [moveEffects, setMoveEffects] = useState({
    flash: null,
    ripple: null,
    particles: []
  });
  
  // États pour mobile
  const [isMobile, setIsMobile] = useState(false);
  const [orientation, setOrientation] = useState('portrait');
  const [showMobileHelp, setShowMobileHelp] = useState(false);
  
  const regenIntervalRef = useRef(null);
  const matchClockRef = useRef(null);
  const gameRef = useRef(game);
  
  // Mise à jour de la référence du jeu
  useEffect(() => {
    gameRef.current = game;
  }, [game]);
  
  // IA Hook pour mode energy-ai
  const { isReady: aiReady, isThinking, makeMove: makeAiMove, setOnMoveCallback } = useStockfish(aiDifficulty);
  
  const isAiMode = gameMode === 'energy-ai';
  const currentPlayer = game.turn() === 'w' ? whitePlayer : blackPlayer;
  const currentPlayerName = isAiMode 
    ? (game.turn() === 'w' && playerColor === 'white') || (game.turn() === 'b' && playerColor === 'black')
      ? "Vous" 
      : "IA"
    : game.turn() === 'w' ? "Blancs" : "Noirs";
  
  const isPlayerTurn = !isAiMode || 
    (game.turn() === 'w' && playerColor === 'white') || 
    (game.turn() === 'b' && playerColor === 'black');

  // Gestion du feedback visuel des cartes
  const handleCardHover = useCallback((card) => {
    if (!card || !card.move) {
      setHoveredCard(null);
      setHighlightedSquares({ from: null, to: null, special: [] });
      return;
    }
    
    setHoveredCard(card);
    
    const move = card.move;
    const special = [];
    
    // Détection des mouvements spéciaux
    if (move.flags) {
      if (move.flags.includes('c')) special.push('castling');
      if (move.flags.includes('e')) special.push('en-passant');
      if (move.flags.includes('k') || move.flags.includes('q')) special.push('promotion');
      if (move.captured) special.push('capture');
    }
    
    setHighlightedSquares({
      from: move.from,
      to: move.to,
      special: special
    });
  }, []);

  const handleCardLeave = useCallback(() => {
    setHoveredCard(null);
    setHighlightedSquares({ from: null, to: null, special: [] });
  }, []);

  // Animation de mouvement de pièce
  const animateMovement = useCallback((fromSquare, toSquare, moveType = 'normal') => {
    const fromElement = document.querySelector(`[data-square="${fromSquare}"]`);
    const toElement = document.querySelector(`[data-square="${toSquare}"]`);
    
    if (!fromElement || !toElement) return Promise.resolve();
    
    return new Promise((resolve) => {
      // Créer une pièce fantôme pour l'animation
      const piece = fromElement.querySelector('.piece');
      if (!piece) {
        resolve();
        return;
      }
      
      const ghost = piece.cloneNode(true);
      ghost.className += ' piece-moving';
      
      // Calculer les positions
      const fromRect = fromElement.getBoundingClientRect();
      const toRect = toElement.getBoundingClientRect();
      const deltaX = toRect.left - fromRect.left;
      const deltaY = toRect.top - fromRect.top;
      
      // Positionner la pièce fantôme
      ghost.style.position = 'fixed';
      ghost.style.left = fromRect.left + 'px';
      ghost.style.top = fromRect.top + 'px';
      ghost.style.zIndex = '1000';
      ghost.style.transition = 'all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1)';
      ghost.style.transform = 'scale(1.1)';
      
      // Masquer la pièce originale
      piece.style.opacity = '0';
      
      // Ajouter au DOM
      document.body.appendChild(ghost);
      
      // Démarrer l'animation après un micro-délai
      setTimeout(() => {
        ghost.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(1.2)`;
        
        // Effet spécial selon le type de mouvement
        if (moveType === 'capture') {
          ghost.style.filter = 'drop-shadow(0 0 10px #f44336) hue-rotate(15deg)';
        } else if (moveType === 'castling') {
          ghost.style.filter = 'drop-shadow(0 0 8px #9c27b0)';
        } else if (moveType === 'promotion') {
          ghost.style.filter = 'drop-shadow(0 0 12px #ffc107) brightness(1.3)';
        }
      }, 10);
      
      // Nettoyer après l'animation
      setTimeout(() => {
        document.body.removeChild(ghost);
        piece.style.opacity = '1';
        resolve();
      }, 400);
    });
  }, []);

  // Effets visuels de mouvement
  const triggerMoveEffects = useCallback((fromSquare, toSquare, moveType) => {
    // Flash sur les cases
    setMoveEffects(prev => ({
      ...prev,
      flash: { from: fromSquare, to: toSquare, type: moveType }
    }));
    
    // Effet ripple
    setTimeout(() => {
      setMoveEffects(prev => ({
        ...prev,
        ripple: { square: toSquare, type: moveType }
      }));
    }, 200);
    
    // Particules
    const particles = [];
    for (let i = 0; i < (moveType === 'capture' ? 8 : 4); i++) {
      particles.push({
        id: Date.now() + i,
        square: toSquare,
        delay: i * 50
      });
    }
    
    setMoveEffects(prev => ({
      ...prev,
      particles: particles
    }));
    
    // Nettoyer les effets
    setTimeout(() => {
      setMoveEffects({
        flash: null,
        ripple: null,
        particles: []
      });
    }, 1000);
  }, []);

  // Initialisation des mains - LOGIQUE CORRIGÉE
  useEffect(() => {
    const initializeHands = () => {
      // Générer les cartes pour le joueur actuel uniquement
      const currentTurn = game.turn();
      const currentHand = generateHand(game, 4);
      
      if (currentTurn === 'w') {
        setWhitePlayer(prev => ({ ...prev, hand: currentHand }));
        // Main vide pour les Noirs au début
        setBlackPlayer(prev => ({ ...prev, hand: [] }));
      } else {
        setBlackPlayer(prev => ({ ...prev, hand: currentHand }));
        // Main vide pour les Blancs au début  
        setWhitePlayer(prev => ({ ...prev, hand: [] }));
      }
    };
    
    initializeHands();
  }, []); // Seulement au mount

  // Régénération d'énergie
  useEffect(() => {
    if (!isGameActive) return;
    
    regenIntervalRef.current = setInterval(() => {
      const now = Date.now();
      const deltaTime = 50; // 50ms tick
      const energyRegen = (energyConfig.regenRate * deltaTime) / 1000;
      
      setWhitePlayer(prev => ({
        ...prev,
        energy: Math.min(energyConfig.maxEnergy, prev.energy + energyRegen),
        lastRegenTick: now
      }));
      
      setBlackPlayer(prev => ({
        ...prev,
        energy: Math.min(energyConfig.maxEnergy, prev.energy + energyRegen),
        lastRegenTick: now
      }));
    }, 50);
    
    return () => {
      if (regenIntervalRef.current) {
        clearInterval(regenIntervalRef.current);
      }
    };
  }, [isGameActive, energyConfig]);

  // Gestion du timer de match
  useEffect(() => {
    if (!isGameActive) return;
    
    matchClockRef.current = setInterval(() => {
      setMatchClock(prev => {
        const newTime = prev - 100; // 100ms tick
        if (newTime <= 0) {
          setIsGameActive(false);
          setStatus('⏰ Temps écoulé ! Match terminé');
          return 0;
        }
        return newTime;
      });
    }, 100);
    
    return () => {
      if (matchClockRef.current) {
        clearInterval(matchClockRef.current);
      }
    };
  }, [isGameActive]);

  // Mise à jour des mains après chaque coup - LOGIQUE SIMPLIFIÉE
  useEffect(() => {
    const currentTurn = game.turn();
    
    // Générer une nouvelle main pour le joueur actuel
    const newHand = generateHand(game, 4);
    
    if (currentTurn === 'w') {
      setWhitePlayer(prev => ({
        ...prev,
        hand: newHand
      }));
    } else {
      setBlackPlayer(prev => ({
        ...prev,
        hand: newHand
      }));
    }
  }, [game.fen()]); // Utiliser game.fen() pour éviter les références circulaires

  // Callback pour l'IA
  const handleAiMove = useCallback((bestMove) => {
    if (!bestMove || !isAiMode) return;
    
    console.log('🤖 IA propose coup:', bestMove);
    
    // Vérifier si l'IA a une carte correspondante
    const currentGameState = gameRef.current;
    const aiPlayer = currentGameState.turn() === 'w' ? whitePlayer : blackPlayer;
    
    const matchingCard = aiPlayer.hand.find(card => 
      card && card.move && 
      (card.move.from + card.move.to + (card.move.promotion || '') === bestMove)
    );
    
    if (matchingCard && aiPlayer.energy >= matchingCard.cost) {
      console.log('🤖 IA joue carte correspondante:', matchingCard.san);
      playCard(matchingCard);
    } else {
      // L'IA n'a pas la carte ou pas assez d'énergie
      // Chercher une carte jouable alternative
      const playableCards = aiPlayer.hand.filter(card => 
        card && card.status === 'active' && aiPlayer.energy >= card.cost
      );
      
      if (playableCards.length > 0) {
        const randomCard = playableCards[Math.floor(Math.random() * playableCards.length)];
        console.log('🤖 IA joue carte alternative:', randomCard.san);
        playCard(randomCard);
      } else {
        console.log('🤖 IA ne peut pas jouer - pas assez d\'énergie');
      }
    }
  }, [isAiMode, whitePlayer, blackPlayer]);

  // Configurer le callback de l'IA
  useEffect(() => {
    if (isAiMode) {
      setOnMoveCallback(handleAiMove);
    }
  }, [isAiMode, handleAiMove, setOnMoveCallback]);

  // Déclencher l'IA si nécessaire - LOGIQUE CORRIGÉE AVEC GESTION ÉCHEC
  useEffect(() => {
    if (isAiMode && !isPlayerTurn && aiReady && !isThinking && !game.isGameOver() && isGameActive) {
      const aiPlayer = game.turn() === 'w' ? whitePlayer : blackPlayer;
      
      // Vérifier si l'IA a des cartes
      if (aiPlayer.hand.length === 0) {
        // Générer des cartes pour l'IA si elle n'en a pas
        const newHand = generateHand(game, 4);
        if (game.turn() === 'w') {
          setWhitePlayer(prev => ({ ...prev, hand: newHand }));
        } else {
          setBlackPlayer(prev => ({ ...prev, hand: newHand }));
        }
        return; // Attendre le prochain cycle
      }
      
      // VALIDATION EN TEMPS RÉEL - Vérifier quelles cartes sont encore valides
      const currentLegalMoves = game.moves({ verbose: true });
      const currentLegalSans = new Set(currentLegalMoves.map(m => m.san));
      const isInCheck = game.inCheck();
      
      // GESTION SPÉCIALE ÉCHEC : Si en échec, on doit pouvoir jouer même sans énergie suffisante
      const validCards = aiPlayer.hand.filter(card => 
        card && 
        card.status === 'active' && 
        currentLegalSans.has(card.san) && // Vérification en temps réel !
        (isInCheck || aiPlayer.energy >= card.cost) // En échec, ignorer le coût d'énergie
      );
      
      console.log('🤖 IA vérifie ses cartes:', {
        total: aiPlayer.hand.length,
        valid: validCards.length,
        energy: aiPlayer.energy,
        legalMoves: currentLegalSans.size,
        inCheck: isInCheck
      });
      
      if (validCards.length > 0) {
        const timeoutId = setTimeout(() => {
          // TRIPLE VÉRIFICATION avant de jouer
          const gameState = gameRef.current;
          if (gameState.turn() === (playerColor === 'white' ? 'b' : 'w') && isGameActive) {
            
            // Re-vérifier les coups légaux au moment de jouer
            const finalLegalMoves = gameState.moves({ verbose: true });
            const finalLegalSans = new Set(finalLegalMoves.map(m => m.san));
            const finalIsInCheck = gameState.inCheck();
            
            const finalValidCards = validCards.filter(card => 
              finalLegalSans.has(card.san) &&
              (finalIsInCheck || aiPlayer.energy >= card.cost) // Re-vérifier échec
            );
            
            if (finalValidCards.length > 0) {
              // EN ÉCHEC : priorité aux coups qui sortent d'échec
              let cardToPlay;
              if (finalIsInCheck) {
                // Trier par coût croissant en situation d'échec
                finalValidCards.sort((a, b) => a.cost - b.cost);
                cardToPlay = finalValidCards[0];
                console.log('⚠️ IA en échec - joue le coup le moins cher:', cardToPlay.san, `(${cardToPlay.cost}⚡)`);
              } else {
                cardToPlay = finalValidCards[Math.floor(Math.random() * finalValidCards.length)];
                console.log('🤖 IA joue (vérifié):', cardToPlay.san);
              }
              
              playCard(cardToPlay);
            } else {
              console.log('🤖 IA n\'a plus de cartes valides - génération nouvelle main');
              // Forcer la génération d'une nouvelle main
              const newHand = generateHand(gameState, 4);
              if (gameState.turn() === 'w') {
                setWhitePlayer(prev => ({ ...prev, hand: newHand }));
              } else {
                setBlackPlayer(prev => ({ ...prev, hand: newHand }));
              }
            }
          }
        }, 1000 + Math.random() * 1000); // Délai variable pour plus de réalisme
        
        return () => clearTimeout(timeoutId);
      } else {
        console.log('🤖 IA n\'a pas de cartes jouables - génération nouvelle main');
        // Forcer la génération d'une nouvelle main
        const newHand = generateHand(game, 4);
        if (game.turn() === 'w') {
          setWhitePlayer(prev => ({ ...prev, hand: newHand }));
        } else {
          setBlackPlayer(prev => ({ ...prev, hand: newHand }));
        }
      }
    }
  }, [isAiMode, isPlayerTurn, aiReady, isThinking, game.fen(), isGameActive, whitePlayer.hand.length, blackPlayer.hand.length]);

  const updateStatus = (gameInstance) => {
    if (!isGameActive) return;
    
    if (gameInstance.isCheckmate()) {
      setStatus('🏆 Échec et mat ! ' + (gameInstance.turn() === 'w' ? 'Les Noirs' : 'Les Blancs') + ' gagnent !');
      setIsGameActive(false);
    } else if (gameInstance.isStalemate()) {
      setStatus('🤝 Pat ! Match nul.');
      setIsGameActive(false);
    } else if (gameInstance.isCheck()) {
      setStatus(`⚔️ ${currentPlayerName} doit jouer - Échec !`);
    } else {
      setStatus(`⚡ Au tour de ${currentPlayerName}`);
    }
  };

  const playCard = useCallback(async (card) => {
    if (!isGameActive || !card || card.status !== 'active') {
      console.warn('Carte non jouable:', card?.status, isGameActive);
      return;
    }
    
    // Utiliser l'état du jeu le plus récent
    const currentGameState = gameRef.current;
    const currentPlayerState = currentGameState.turn() === 'w' ? whitePlayer : blackPlayer;
    const isInCheck = currentGameState.inCheck();
    
    // GESTION SPÉCIALE ÉCHEC : Vérifier l'énergie seulement si pas en échec
    if (!isInCheck && currentPlayerState.energy < card.cost) {
      console.warn('Pas assez d\'énergie pour jouer cette carte');
      return;
    }
    
    if (isInCheck && currentPlayerState.energy < card.cost) {
      console.log('⚠️ Échec détecté - autorisation de jouer sans énergie suffisante:', card.san);
    }
    
    // VÉRIFICATION AMÉLIORÉE de la légalité
    const legalMoves = currentGameState.moves({ verbose: true });
    const matchingMove = legalMoves.find(move => move.san === card.san);
    
    if (!matchingMove) {
      console.warn('❌ Coup plus légal:', card.san, 'Position:', currentGameState.fen());
      console.warn('❌ Coups disponibles:', legalMoves.map(m => m.san));
      
      // Marquer la carte comme illégale et demander un refresh
      const updatePlayerHand = (prevState) => {
        const newHand = prevState.hand.map(c => 
          c && c.id === card.id ? { ...c, status: 'illegal' } : c
        );
        return { ...prevState, hand: newHand };
      };
      
      if (currentGameState.turn() === 'w') {
        setWhitePlayer(updatePlayerHand);
      } else {
        setBlackPlayer(updatePlayerHand);
      }
      
      // Pour l'IA, générer immédiatement une nouvelle main
      if (isAiMode && !isPlayerTurn) {
        console.log('🤖 IA - Génération nouvelle main après coup invalide');
        setTimeout(() => {
          const newHand = generateHand(currentGameState, 4);
          if (currentGameState.turn() === 'w') {
            setWhitePlayer(prev => ({ ...prev, hand: newHand }));
          } else {
            setBlackPlayer(prev => ({ ...prev, hand: newHand }));
          }
        }, 100);
      }
      
      return;
    }
    
    // Animer la carte qui est jouée
    setPlayingCard(card);
    
    // Jouer le coup avec le move trouvé (plus sûr)
    const gameCopy = new Chess(currentGameState.fen());
    let result;
    
    try {
      result = gameCopy.move(matchingMove);
    } catch (error) {
      console.error('Erreur lors du coup:', error, card);
      setPlayingCard(null);
      return;
    }
    
    if (result === null) {
      console.warn('Coup invalide après tentative:', card);
      setPlayingCard(null);
      return;
    }
    
    // Déterminer le type de mouvement pour les effets
    let moveType = 'normal';
    if (result.captured) moveType = 'capture';
    else if (result.flags.includes('c')) moveType = 'castling';
    else if (result.flags.includes('q') || result.flags.includes('k')) moveType = 'promotion';
    
    // Déclencher les animations
    triggerMoveEffects(result.from, result.to, moveType);
    await animateMovement(result.from, result.to, moveType);
    
    // Effacer le feedback visuel
    setHoveredCard(null);
    setHighlightedSquares({ from: null, to: null, special: [] });
    setPlayingCard(null);
    
    // Mettre à jour l'état du jeu
    setGame(gameCopy);
    gameRef.current = gameCopy;
    const newFen = gameCopy.fen();
    setFenHistory(prev => [...prev, newFen]);
    setMoveHistory(prev => [...prev, result]);
    setCurrentMoveIndex(prev => prev + 1);
    
    // Consommer l'énergie et remplacer la carte
    // EN ÉCHEC : Coût d'énergie peut être ignoré si pas assez d'énergie
    const energyToConsume = isInCheck && currentPlayerState.energy < card.cost ? 0 : card.cost;
    
    const updatePlayerState = (prevState) => {
      const newHand = [...prevState.hand];
      const cardIndex = newHand.findIndex(c => c && c.id === card.id);
      
      if (cardIndex !== -1) {
        // Remplacer la carte après un délai
        setTimeout(() => {
          const newCard = generateHand(gameCopy, 1)[0];
          if (newCard) {
            if (currentGameState.turn() === 'w') {
              setWhitePlayer(prev => {
                const updatedHand = [...prev.hand];
                updatedHand[cardIndex] = newCard;
                return { ...prev, hand: updatedHand };
              });
            } else {
              setBlackPlayer(prev => {
                const updatedHand = [...prev.hand];
                updatedHand[cardIndex] = newCard;
                return { ...prev, hand: updatedHand };
              });
            }
          }
        }, energyConfig.replaceDelay * 1000);
        
        // Retirer temporairement la carte
        newHand[cardIndex] = null;
      }
      
      return {
        ...prevState,
        energy: Math.max(0, prevState.energy - energyToConsume),
        hand: newHand
      };
    };
    
    if (currentGameState.turn() === 'w') {
      setWhitePlayer(updatePlayerState);
    } else {
      setBlackPlayer(updatePlayerState);
    }
    
    if (energyToConsume === 0 && isInCheck) {
      console.log('⚠️ Coup joué gratuitement en situation d\'échec');
    }
    
    updateStatus(gameCopy);
  }, [isGameActive, whitePlayer, blackPlayer, energyConfig, animateMovement, triggerMoveEffects]);

  // Nouveau : Rafraîchir toute la main
  const refreshAllCards = useCallback(() => {
    if (!isGameActive || !isPlayerTurn) return;
    
    const currentPlayerState = game.turn() === 'w' ? whitePlayer : blackPlayer;
    
    if (currentPlayerState.energy < energyConfig.refreshAllCost) {
      console.warn('Pas assez d\'énergie pour rafraîchir toute la main');
      return;
    }
    
    // Générer une nouvelle main complète
    const newHand = generateHand(game, 4);
    
    const updatePlayerState = (prevState) => ({
      ...prevState,
      energy: Math.max(0, prevState.energy - energyConfig.refreshAllCost),
      hand: newHand
    });
    
    if (game.turn() === 'w') {
      setWhitePlayer(updatePlayerState);
    } else {
      setBlackPlayer(updatePlayerState);
    }
  }, [isGameActive, isPlayerTurn, game, whitePlayer, blackPlayer, energyConfig]);

  // Détection mobile et orientation
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth <= 768 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      const orient = window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
      setIsMobile(mobile);
      setOrientation(orient);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    window.addEventListener('orientationchange', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('orientationchange', checkMobile);
    };
  }, []);

  // Gestion des vibrations pour mobile
  const vibrate = useCallback((pattern = [100]) => {
    if (isMobile && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }, [isMobile]);

  // Feedback tactile amélioré pour mobile
  const handleMobileCardPlay = useCallback((card) => {
    if (isMobile) {
      vibrate([50]); // Vibration courte pour feedback
    }
    playCard(card);
  }, [isMobile, vibrate, playCard]);

  // Gestion clavier améliorée pour mobile
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isPlayerTurn || !isGameActive) return;
      
      const key = e.key;
      if (['1', '2', '3', '4'].includes(key)) {
        e.preventDefault(); // Prévenir le comportement par défaut sur mobile
        const cardIndex = parseInt(key) - 1;
        const card = currentPlayer.hand[cardIndex];
        if (card && card.status === 'active' && (game.inCheck() || currentPlayer.energy >= card.cost)) {
          if (isMobile) {
            vibrate([30]); // Vibration pour confirmation
          }
          playCard(card);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPlayerTurn, isGameActive, currentPlayer, playCard, isMobile, vibrate, game]);

  // Notification mobile pour les changements d'état
  useEffect(() => {
    if (isMobile && game.inCheck()) {
      vibrate([100, 50, 100]); // Pattern spécial pour échec
    }
  }, [game.fen(), isMobile, vibrate]);

  // Affichage du plateau
  const displayedGame = new Chess(fenHistory[currentMoveIndex]);
  const board = displayedGame.board();

  const formatTime = (ms) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const togglePause = () => {
    setIsGameActive(!isGameActive);
  };

  // Fonction pour déterminer si une case doit être surlignée
  const getSquareHighlight = (square) => {
    if (!highlightedSquares.from && !highlightedSquares.to) return '';
    
    let classes = '';
    
    if (highlightedSquares.from === square) {
      classes += ' highlight-from';
    }
    
    if (highlightedSquares.to === square) {
      classes += ' highlight-to';
      
      // Ajouter des classes spéciales selon le type de mouvement
      if (highlightedSquares.special.includes('capture')) {
        classes += ' highlight-capture';
      }
      if (highlightedSquares.special.includes('castling')) {
        classes += ' highlight-castling';
      }
      if (highlightedSquares.special.includes('en-passant')) {
        classes += ' highlight-en-passant';
      }
      if (highlightedSquares.special.includes('promotion')) {
        classes += ' highlight-promotion';
      }
    }
    
    return classes;
  };

  // Fonction pour les effets de mouvement
  const getMoveEffectClasses = (square) => {
    let classes = '';
    
    if (moveEffects.flash && (moveEffects.flash.from === square || moveEffects.flash.to === square)) {
      classes += ` move-flash move-flash-${moveEffects.flash.type}`;
    }
    
    if (moveEffects.ripple && moveEffects.ripple.square === square) {
      classes += ` move-ripple move-ripple-${moveEffects.ripple.type}`;
    }
    
    return classes;
  };

  return (
    <div className={`energy-chess-container ${isMobile ? 'mobile' : 'desktop'} ${orientation}`}>
      <div className="energy-chess-header">
        <div className="match-info">
          <div className="match-clock">
            <span className="clock-icon">⏱️</span>
            <span className="clock-time">{formatTime(matchClock)}</span>
          </div>
          {!isMobile && <div className="match-mode">⚡ Energy Chess</div>}
        </div>
        
        <div className="game-status">
          <div className="status-message">
            {status}
            {isMobile && game.inCheck() && <span className="mobile-check-alert"> 🚨</span>}
          </div>
        </div>
      </div>

      <div className="energy-game-area">
        {/* Main des Blancs */}
        <div className="white-hand-area">
          <CardHand
            hand={whitePlayer.hand}
            playerEnergy={whitePlayer.energy}
            refreshCost={energyConfig.refreshCost}
            refreshAllCost={energyConfig.refreshAllCost}
            onPlayCard={game.turn() === 'w' ? (isMobile ? handleMobileCardPlay : playCard) : null}
            onRefreshAll={game.turn() === 'w' ? refreshAllCards : null}
            onCardHover={game.turn() === 'w' && !isMobile ? handleCardHover : null}
            onCardLeave={game.turn() === 'w' && !isMobile ? handleCardLeave : null}
            playingCard={playingCard}
            isDisabled={game.turn() !== 'w' || !isGameActive || (isAiMode && !((game.turn() === 'w' && playerColor === 'white') || (game.turn() === 'b' && playerColor === 'black')))}
            playerName={isAiMode ? (playerColor === 'white' ? "Vous" : "IA") : "Blancs"}
            isOpponent={isAiMode && playerColor !== 'white'}
            gameState={game}
            isMobile={isMobile}
          />
        </div>

        <div className="chessboard-area">
          <div className="chessboard-container">
            {isMobile && (
              <div className="mobile-game-info">
                <span className="current-player">{currentPlayerName}</span>
                {game.inCheck() && <span className="mobile-check">⚠️ ÉCHEC</span>}
              </div>
            )}
            
            <div className="chessboard-wrapper">
              <div className="chessboard">
                <div className="coords-corner" />
                {'ABCDEFGH'.split('').map(file => (<div className="coords-file" key={file}>{file}</div>))}
                <div className="coords-corner" />
                {board.map((row, rowIndex) => [
                  <div className="coords-rank" key={'rank-' + rowIndex}>{8 - rowIndex}</div>,
                  ...row.map((piece, colIndex) => {
                    const square = String.fromCharCode('a'.charCodeAt(0) + colIndex) + (8 - rowIndex);
                    const highlightClass = getSquareHighlight(square);
                    const effectClass = getMoveEffectClasses(square);
                    
                    return (
                      <div
                        key={`${rowIndex}-${colIndex}`}
                        data-square={square}
                        className={`tile ${(rowIndex + colIndex) % 2 === 1 ? 'light' : 'dark'} ${selectedSquare === square ? 'selected' : ''}${highlightClass}${effectClass}`}
                        onTouchStart={isMobile ? (e) => {
                          e.preventDefault();
                          if (piece) {
                            vibrate([25]);
                          }
                        } : undefined}
                      >
                        {piece && (
                          <span className={`piece ${piece.color === 'w' ? 'white-piece' : 'black-piece'}`}>
                            {getPieceSymbol(piece)}
                          </span>
                        )}
                        
                        {/* Flèche directionnelle - cachée sur mobile */}
                        {highlightedSquares.from === square && hoveredCard && !isMobile && (
                          <div className="move-arrow" data-to={highlightedSquares.to}>
                            <span className="arrow-indicator">→</span>
                          </div>
                        )}
                        
                        {/* Indicateur de destination - simplifié sur mobile */}
                        {highlightedSquares.to === square && hoveredCard && (
                          <div className="move-indicator">
                            {highlightedSquares.special.includes('capture') && <span className="capture-indicator">✕</span>}
                            {highlightedSquares.special.includes('castling') && <span className="castle-indicator">♜</span>}
                            {highlightedSquares.special.includes('promotion') && <span className="promotion-indicator">♕</span>}
                          </div>
                        )}
                        
                        {/* Particules d'effet - réduites sur mobile */}
                        {moveEffects.particles.filter(p => p.square === square).slice(0, isMobile ? 2 : 8).map(particle => (
                          <div
                            key={particle.id}
                            className="move-particle"
                            style={{ animationDelay: `${particle.delay}ms` }}
                          >
                            ✨
                          </div>
                        ))}
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
          </div>
        </div>

        {/* Main des Noirs */}
        <div className="black-hand-area">
          <CardHand
            hand={blackPlayer.hand}
            playerEnergy={blackPlayer.energy}
            refreshCost={energyConfig.refreshCost}
            refreshAllCost={energyConfig.refreshAllCost}
            onPlayCard={game.turn() === 'b' ? (isMobile ? handleMobileCardPlay : playCard) : null}
            onRefreshAll={game.turn() === 'b' ? refreshAllCards : null}
            onCardHover={game.turn() === 'b' && !isMobile ? handleCardHover : null}
            onCardLeave={game.turn() === 'b' && !isMobile ? handleCardLeave : null}
            playingCard={playingCard}
            isDisabled={game.turn() !== 'b' || !isGameActive || (isAiMode && !((game.turn() === 'w' && playerColor === 'white') || (game.turn() === 'b' && playerColor === 'black')))}
            playerName={isAiMode ? (playerColor === 'black' ? "Vous" : "IA") : "Noirs"}
            isOpponent={isAiMode && playerColor !== 'black'}
            gameState={game}
            isMobile={isMobile}
          />
        </div>
      </div>

      <div className="energy-actions">
        <button onClick={togglePause} className="pause-btn">
          {isGameActive ? (isMobile ? '⏸️' : '⏸️ Pause') : (isMobile ? '▶️' : '▶️ Reprendre')}
        </button>
        <button onClick={showMainMenu} className="menu-button">
          {isMobile ? '🏠' : '🏠 Menu Principal'}
        </button>
        
        {isMobile && (
          <div className="mobile-help-btn" 
               onClick={() => setShowMobileHelp(!showMobileHelp)}
               title="Aide tactile">
            ❓
          </div>
        )}
      </div>

      {/* Aide mobile */}
      {isMobile && showMobileHelp && (
        <div className="mobile-help-overlay" onClick={() => setShowMobileHelp(false)}>
          <div className="mobile-help-content">
            <h3>🎮 Aide Energy Chess Mobile</h3>
            <div className="help-section">
              <p><strong>🎯 Jouer :</strong> Appuyez sur une carte pour jouer le coup</p>
              <p><strong>⌨️ Raccourcis :</strong> Touches 1-4 pour jouer les cartes</p>
              <p><strong>⚠️ Échec :</strong> Cartes jouables gratuitement</p>
              <p><strong>📱 Vibrations :</strong> Feedback tactile activé</p>
            </div>
            <button onClick={() => setShowMobileHelp(false)}>Fermer</button>
          </div>
        </div>
      )}
    </div>
  );
}

// Fonction utilitaire pour les symboles de pièces
const pieceUnicode = { 
  p: '\u265F', r: '\u265C', n: '\u265E', b: '\u265D', q: '\u265B', k: '\u265A', 
  P: '\u2659', R: '\u2656', N: '\u2658', B: '\u2657', Q: '\u2655', K: '\u2654' 
};

function getPieceSymbol(piece) {
  if (!piece) return '';
  const letter = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
  return pieceUnicode[letter] || '';
}

export default EnergyChessBoard; 