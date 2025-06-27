import { Chess } from 'chess.js';

// Mapping des pièces vers leurs poids - SIMPLIFIÉ
const PIECE_WEIGHTS = {
  'p': 0, // Pion : GRATUIT pour encourager le jeu
  'n': 1, // Cavalier : 1 énergie
  'b': 1, // Fou : 1 énergie  
  'r': 2, // Tour : 2 énergie
  'q': 3, // Reine : 3 énergie (réduit de 4)
  'k': 0, // Roi : gratuit
};

/**
 * Calcule le coût énergétique d'un coup - SIMPLIFIÉ
 */
export function calculateMoveCost(move, game) {
  // Si le coup inclut un objet de coup détaillé
  if (typeof move === 'object' && move.piece) {
    const pieceType = move.piece.toLowerCase();
    const weight = PIECE_WEIGHTS[pieceType] || 0;
    
    // Coût spéciaux
    if (move.flags?.includes('c')) { // Castling - GRATUIT
      return 0;
    }
    
    if (move.captured) { // Capture - BONUS : coût réduit de 1 (min 0)
      return Math.max(0, weight - 1);
    }
    
    return weight;
  }
  
  // Fallback : analyser le coup depuis la position
  try {
    const tempGame = new Chess(game.fen());
    const moveDetail = tempGame.move(move);
    
    if (moveDetail) {
      const pieceType = moveDetail.piece.toLowerCase();
      const weight = PIECE_WEIGHTS[pieceType] || 0;
      
      if (moveDetail.flags.includes('c')) { // Castling
        return 0;
      }
      
      if (moveDetail.captured) { // Capture
        return Math.max(0, weight - 1);
      }
      
      return weight;
    }
  } catch (e) {
    console.warn('Erreur calcul coût:', e);
  }
  
  return 0; // Par défaut gratuit
}

/**
 * Génère une main de 4 cartes à partir des coups légaux avec plus d'infos - CORRIGÉ v3
 */
export function generateHand(game, handSize = 4) {
  const legalMoves = game.moves({ verbose: true });
  
  if (legalMoves.length === 0) {
    console.warn('⚠️ Aucun coup légal disponible pour générer des cartes');
    return [];
  }
  
  const hand = [];
  const used = new Set();
  const timestamp = Date.now();
  const isInCheck = game.inCheck();
  
  // GESTION SPÉCIALE ÉCHEC : Prioriser les coups qui sortent d'échec
  if (isInCheck) {
    console.log('⚠️ Génération de cartes en situation d\'échec - priorité aux coups de sortie');
    
    // S'assurer qu'au moins la moitié des cartes permettent de sortir d'échec
    const checkExitMoves = legalMoves.filter(move => {
      try {
        const testGame = new Chess(game.fen());
        testGame.move(move);
        return !testGame.inCheck(); // Vérifier que le coup sort d'échec
      } catch (error) {
        return false;
      }
    });
    
    const minCheckExitCards = Math.min(Math.ceil(handSize / 2), checkExitMoves.length);
    
    // Ajouter prioritairement des cartes qui sortent d'échec
    for (let i = 0; i < minCheckExitCards && hand.length < handSize; i++) {
      const move = checkExitMoves[i % checkExitMoves.length];
      if (!used.has(move.san)) {
        used.add(move.san);
        
        hand.push({
          id: `${move.from}${move.to}${move.promotion || ''}_${timestamp}_${hand.length}`,
          move: move,
          cost: calculateMoveCost(move, game),
          san: move.san,
          status: 'active',
          type: move.captured ? 'captures' : 'normal',
          description: getMovDescription(move)
        });
      }
    }
  }
  
  // Prioriser la diversité des types de coups (logique normale)
  const moveTypes = {
    captures: legalMoves.filter(m => m.captured),
    castling: legalMoves.filter(m => m.flags.includes('c')),
    promotions: legalMoves.filter(m => m.flags.includes('q') || m.flags.includes('k')),
    normal: legalMoves.filter(m => !m.captured && !m.flags.includes('c') && !m.flags.includes('q') && !m.flags.includes('k'))
  };
  
  // Log pour débug - PLUS COMPACT
  console.log(`🎴 Position ${game.fen().split(' ')[0]} - Coups: ${legalMoves.length} (${moveTypes.captures.length}⚔️ ${moveTypes.castling.length}🏰 ${moveTypes.promotions.length}👑 ${moveTypes.normal.length}🎯)${isInCheck ? ' ⚠️ÉCHEC' : ''}`);
  
  // Essayer de prendre au moins une carte de chaque type si possible
  const typePriority = ['captures', 'promotions', 'castling', 'normal'];
  
  for (const type of typePriority) {
    if (hand.length >= handSize) break;
    
    const availableMoves = moveTypes[type].filter(m => !used.has(m.san));
    if (availableMoves.length > 0) {
      const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
      used.add(move.san);
      
      // VALIDATION SUPPLÉMENTAIRE - Vérifier que le coup est vraiment légal
      try {
        const testGame = new Chess(game.fen());
        const testResult = testGame.move(move);
        
        if (testResult) {
          hand.push({
            id: `${move.from}${move.to}${move.promotion || ''}_${timestamp}_${hand.length}`,
            move: move,
            cost: calculateMoveCost(move, game),
            san: move.san,
            status: 'active',
            type: type,
            description: getMovDescription(move)
          });
        } else {
          console.warn('⚠️ Coup filtré car invalide:', move.san);
        }
      } catch (error) {
        console.warn('⚠️ Erreur validation carte:', move.san, error);
      }
    }
  }
  
  // Compléter avec des coups aléatoires si nécessaire - ALGORITHME AMÉLIORÉ
  let attempts = 0;
  const maxAttempts = Math.min(50, legalMoves.length * 2);
  
  while (hand.length < handSize && legalMoves.length > 0 && attempts < maxAttempts) {
    attempts++;
    
    const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
    
    if (!used.has(move.san)) {
      used.add(move.san);
      
      // VALIDATION SUPPLÉMENTAIRE
      try {
        const testGame = new Chess(game.fen());
        const testResult = testGame.move(move);
        
        if (testResult) {
          hand.push({
            id: `${move.from}${move.to}${move.promotion || ''}_${timestamp}_${hand.length}`,
            move: move,
            cost: calculateMoveCost(move, game),
            san: move.san,
            status: 'active',
            type: 'normal',
            description: getMovDescription(move)
          });
        } else {
          console.warn('⚠️ Coup filtré car invalide (2):', move.san);
        }
      } catch (error) {
        console.warn('⚠️ Erreur validation carte (2):', move.san, error);
      }
    }
  }
  
  // Si on n'a toujours pas assez de cartes, autoriser les doublons
  if (hand.length < handSize && legalMoves.length > 0) {
    console.log(`🎴 Pas assez de cartes uniques (${hand.length}/${handSize}) - autorisation doublons`);
    
    while (hand.length < handSize && attempts < maxAttempts * 2) {
      attempts++;
      const move = legalMoves[Math.floor(Math.random() * legalMoves.length)];
      
      try {
        const testGame = new Chess(game.fen());
        const testResult = testGame.move(move);
        
        if (testResult) {
          hand.push({
            id: `${move.from}${move.to}${move.promotion || ''}_${timestamp}_${hand.length}_dup`,
            move: move,
            cost: calculateMoveCost(move, game),
            san: move.san,
            status: 'active',
            type: 'normal',
            description: getMovDescription(move)
          });
        }
      } catch (error) {
        // Ignorer les erreurs sur les doublons
      }
    }
  }
  
  const costSummary = hand.map(c => `${c.san}(${c.cost}⚡)`).join(', ');
  console.log(`✅ Main générée: ${costSummary}${isInCheck ? ' - ÉCHEC GÉRÉ' : ''}`);
  return hand;
}

/**
 * Génère une description lisible du mouvement
 */
function getMovDescription(move) {
  let desc = `${move.piece.toUpperCase()} ${move.from}→${move.to}`;
  
  if (move.captured) {
    desc += ` (Capture ${move.captured.toUpperCase()})`;
  }
  
  if (move.flags.includes('c')) {
    desc = move.to === 'g1' || move.to === 'g8' ? 'Petit roque' : 'Grand roque';
  }
  
  if (move.flags.includes('q')) {
    desc += ' (Promotion Dame)';
  } else if (move.flags.includes('r')) {
    desc += ' (Promotion Tour)';
  } else if (move.flags.includes('n')) {
    desc += ' (Promotion Cavalier)';
  } else if (move.flags.includes('b')) {
    desc += ' (Promotion Fou)';
  }
  
  if (move.flags.includes('e')) {
    desc += ' (En passant)';
  }
  
  return desc;
}

/**
 * Met à jour le statut des cartes selon la légalité des coups - AMÉLIORÉ
 */
export function updateHandLegality(hand, game) {
  const legalMoves = game.moves({ verbose: true });
  const legalSans = new Set(legalMoves.map(m => m.san));
  
  const updatedHand = hand.map(card => {
    // Gérer les cartes null (remplacées temporairement)
    if (!card) {
      return null;
    }
    
    // DOUBLE VALIDATION - aussi tester le coup
    let isValid = legalSans.has(card.san);
    
    if (isValid) {
      try {
        const testGame = new Chess(game.fen());
        const testResult = testGame.move(card.san);
        isValid = testResult !== null;
      } catch (error) {
        console.warn('⚠️ Carte invalide détectée:', card.san);
        isValid = false;
      }
    }
    
    const updatedCard = {
      ...card,
      status: isValid ? 'active' : 'illegal'
    };
    
    return updatedCard;
  });
  
  // Log seulement s'il y a des changements
  const illegalCount = updatedHand.filter(c => c && c.status === 'illegal').length;
  if (illegalCount > 0) {
    console.log(`🔄 Validation main - ${illegalCount} carte(s) illégale(s) détectée(s)`);
  }
  
  return updatedHand;
}

/**
 * Créé l'état initial d'un joueur pour le mode Energy
 */
export function createEnergyPlayerState(game, config) {
  return {
    energy: config.maxEnergy,
    hand: generateHand(game, 4),
    lastRegenTick: Date.now()
  };
}

export default {
  calculateMoveCost,
  generateHand,
  updateHandLegality,
  createEnergyPlayerState
}; 