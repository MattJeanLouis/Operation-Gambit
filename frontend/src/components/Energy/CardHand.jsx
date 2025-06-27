import React, { useCallback, useEffect } from 'react';
import './CardHand.css';

const PIECE_ICONS = {
  'p': '♟', 'P': '♙',
  'r': '♜', 'R': '♖', 
  'n': '♞', 'N': '♘',
  'b': '♝', 'B': '♗',
  'q': '♛', 'Q': '♕',
  'k': '♚', 'K': '♔'
};

const TYPE_COLORS = {
  'captures': '#e74c3c',
  'castling': '#9b59b6', 
  'promotions': '#f39c12',
  'normal': '#3498db'
};

const TYPE_ICONS = {
  'captures': '⚔️',
  'castling': '🏰',
  'promotions': '👑',
  'normal': '🎯'
};

function CardHand({ 
  hand, 
  playerEnergy, 
  refreshCost, 
  refreshAllCost,
  onPlayCard, 
  onRefreshCard, 
  onRefreshAll,
  onCardHover, 
  onCardLeave, 
  playingCard, 
  isDisabled = false,
  playerName = "Joueur",
  isOpponent = false,
  gameState = null,
  isMobile = false
}) {
  const canRefreshAll = playerEnergy >= refreshAllCost;
  const illegalCards = hand.filter(card => card && card.status === 'illegal').length;
  const isInCheck = gameState ? gameState.inCheck() : false;
  
  // Fonction pour actualiser automatiquement les cartes illégales
  const autoRefreshIllegalCards = useCallback(() => {
    if (!onRefreshCard || !hand || isOpponent) return;
    
    const illegalCardsToRefresh = hand.filter(card => 
      card && card.status === 'illegal'
    );
    
    if (illegalCardsToRefresh.length > 0) {
      console.log('🔄 Auto-refresh des cartes illégales:', illegalCardsToRefresh.map(c => c.san));
      
      illegalCardsToRefresh.forEach((card, index) => {
        setTimeout(() => {
          const cardIndex = hand.findIndex(c => c && c.id === card.id);
          if (cardIndex !== -1) {
            onRefreshCard(cardIndex, 0); // Coût 0 pour cartes illégales
          }
        }, index * 200); // Délai échelonné pour éviter les conflits
      });
    }
  }, [hand, onRefreshCard, isOpponent]);

  // Auto-refresh périodique des cartes illégales (seulement pour le joueur)
  useEffect(() => {
    if (isOpponent) return;
    
    const interval = setInterval(() => {
      autoRefreshIllegalCards();
    }, 5000); // Vérifier toutes les 5 secondes
    
    return () => clearInterval(interval);
  }, [autoRefreshIllegalCards, isOpponent]);

  const renderCard = (card, index) => {
    if (!card) {
      return (
        <div key={`empty-${index}`} className="card-slot empty">
          <div className="card-empty-indicator">🔄</div>
        </div>
      );
    }

    // GESTION SPÉCIALE ÉCHEC : Cartes jouables même sans énergie suffisante
    const canAfford = isInCheck || playerEnergy >= card.cost;
    const isLegal = card.status === 'active';
    const isPlayable = canAfford && isLegal && !isOpponent && !isDisabled;
    const isPlaying = playingCard?.id === card.id;
    
    // Classes CSS
    const cardClasses = [
      'card-slot',
      isPlayable ? 'playable' : '',
      !canAfford ? 'unaffordable' : '',
      !isLegal ? 'illegal' : '',
      isPlaying ? 'playing' : '',
      isInCheck && card.cost > playerEnergy ? 'check-emergency' : '' // Nouvelle classe pour échec
    ].filter(Boolean).join(' ');

    const handleCardClick = () => {
      if (isPlayable && onPlayCard) {
        onPlayCard(card);
      } else if (!isLegal && onRefreshCard && !isOpponent) {
        // Auto-refresh des cartes illégales en cliquant dessus
        onRefreshCard(index, 0);
      } else if (!canAfford && !isOpponent && !isInCheck) {
        console.warn('⚠️ Pas assez d\'énergie pour jouer cette carte');
      }
    };

    const handleMouseEnter = () => {
      if (onCardHover && isPlayable && !isPlaying) {
        onCardHover(card);
      }
    };

    const handleMouseLeave = () => {
      if (onCardLeave) {
        onCardLeave();
      }
    };

    // Icônes
    const pieceIcon = PIECE_ICONS[card.move.piece] || '?';
    const typeColor = TYPE_COLORS[card.type] || TYPE_COLORS.normal;
    const typeIcon = TYPE_ICONS[card.type] || TYPE_ICONS.normal;

    // Titre de la carte avec indication spéciale échec
    let cardTitle = `${card.description} (${card.cost} énergie) - ${isLegal ? 'Légal' : 'Illégal'}`;
    if (isInCheck && card.cost > playerEnergy) {
      cardTitle += ' - JOUABLE EN ÉCHEC';
    }

    return (
      <div
        key={card.id}
        className={cardClasses}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        style={{ borderLeftColor: typeColor }}
        title={cardTitle}
      >
        <div className="card-content">
          <div className="card-header">
            <div className="card-piece">{pieceIcon}</div>
            <div className="card-type-icon">{typeIcon}</div>
          </div>
          
          <div className="card-move-info">
            <div className="card-move">
              <span>{card.move.from}</span>
              <span className="card-arrow">→</span>
              <span>{card.move.to}</span>
            </div>
            <div className="card-san">{card.san}</div>
          </div>
          
          <div className="card-footer">
            <div className="card-cost">
              <span className="cost-value">
                {isInCheck && card.cost > playerEnergy ? '0' : card.cost}
              </span>
              <span className="cost-icon">⚡</span>
              {isInCheck && card.cost > playerEnergy && (
                <span className="emergency-indicator">⚠️</span>
              )}
            </div>
            <div className="card-hotkey">{index + 1}</div>
          </div>
          
          {/* Effet de consommation */}
          {isPlaying && (
            <div className="card-consumption-effect">
              <div className="energy-burst">⚡</div>
              <div className="play-indicator">JOUÉ!</div>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className={`card-hand ${isOpponent ? 'opponent' : 'player'} ${isMobile ? 'mobile' : ''}`}>
      <div className="card-hand-header">
        <div className="card-hand-label">
          <span className="player-name">
            {playerName}
            {isInCheck && <span className="check-indicator"> ⚠️ ÉCHEC</span>}
          </span>
          <div className="energy-display">
            <span className="energy-value">{Math.floor(playerEnergy)}</span>
            <span className="energy-icon">⚡</span>
          </div>
        </div>
        
        {!isOpponent && !isDisabled && (
          <div className="card-hand-actions">
            <button 
              className={`refresh-all-btn ${canRefreshAll ? 'enabled' : 'disabled'}`}
              onClick={canRefreshAll ? onRefreshAll : undefined}
              disabled={!canRefreshAll}
              title={`Rafraîchir toute la main (${refreshAllCost} ⚡)`}
            >
              <span className="refresh-icon">🔄</span>
              {!isMobile && <span className="refresh-text">Nouvelle Main</span>}
              <span className="refresh-cost">{refreshAllCost}⚡</span>
            </button>
            
            {illegalCards > 0 && (
              <div className="illegal-notice">
                <span className="illegal-icon">⚠️</span>
                <span className="illegal-text">{illegalCards} carte(s) illégale(s)</span>
              </div>
            )}
            
            {isInCheck && (
              <div className="check-notice">
                <span className="check-icon">⚠️</span>
                <span className="check-text">{isMobile ? 'Gratuit' : 'Cartes gratuites en échec'}</span>
              </div>
            )}
          </div>
        )}
      </div>
      
      <div className="card-slots">
        {[0, 1, 2, 3].map(index => renderCard(hand[index], index))}
      </div>
      
      {!isOpponent && (
        <div className="card-hand-help">
          <small>
            {isDisabled ? 'Attendez votre tour' : 
             isInCheck ? (isMobile ? 'Échec ! Cartes gratuites' : 'Échec ! Cartes jouables gratuitement • Touches 1-4') :
             (isMobile ? 'Appuyez pour jouer • 1-4' : 'Survolez pour prévisualiser • Touches 1-4 pour jouer')}
          </small>
        </div>
      )}
    </div>
  );
}

export default CardHand; 