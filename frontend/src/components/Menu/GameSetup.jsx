import React from 'react';
import useGameStore from '../../store/gameStore';
import './GameSetup.css';

function GameSetup() {
  const { 
    gameMode, 
    aiDifficulty, 
    playerColor, 
    setAiDifficulty, 
    setPlayerColor, 
    startGame, 
    showMainMenu 
  } = useGameStore();

  const handleStartGame = () => {
    startGame();
  };

  const getDifficultyLabel = (level) => {
    if (level <= 3) return 'Facile';
    if (level <= 8) return 'Moyen';
    if (level <= 15) return 'Difficile';
    return 'Expert';
  };

  const getDifficultyColor = (level) => {
    if (level <= 3) return '#4CAF50';
    if (level <= 8) return '#FF9800';
    if (level <= 15) return '#F44336';
    return '#9C27B0';
  };

  return (
    <div className="game-setup">
      <div className="setup-container">
        <div className="setup-header">
          <button className="back-button" onClick={showMainMenu}>
            ← Retour
          </button>
          <h2>Configuration de Partie</h2>
        </div>

        {gameMode === 'ai' && (
          <div className="setup-options">
            <div className="option-group">
              <h3>Choisissez votre camp</h3>
              <div className="color-selection">
                <button 
                  className={`color-button white ${playerColor === 'white' ? 'selected' : ''}`}
                  onClick={() => setPlayerColor('white')}
                >
                  <span className="piece-icon">♔</span>
                  <span>Blancs</span>
                  <small>Vous commencez</small>
                </button>
                
                <button 
                  className={`color-button black ${playerColor === 'black' ? 'selected' : ''}`}
                  onClick={() => setPlayerColor('black')}
                >
                  <span className="piece-icon">♚</span>
                  <span>Noirs</span>
                  <small>L'IA commence</small>
                </button>
              </div>
            </div>

            <div className="option-group">
              <h3>Difficulté de l'IA</h3>
              <div className="difficulty-selection">
                <div className="difficulty-slider">
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={aiDifficulty}
                    onChange={(e) => setAiDifficulty(parseInt(e.target.value))}
                    className="slider"
                  />
                  <div className="difficulty-info">
                    <span 
                      className="difficulty-label"
                      style={{ color: getDifficultyColor(aiDifficulty) }}
                    >
                      {getDifficultyLabel(aiDifficulty)} (Niveau {aiDifficulty})
                    </span>
                    <div className="difficulty-description">
                      {aiDifficulty <= 3 && "Parfait pour débuter et apprendre"}
                      {aiDifficulty > 3 && aiDifficulty <= 8 && "Défi modéré pour progresser"}
                      {aiDifficulty > 8 && aiDifficulty <= 15 && "Challenge intense pour joueurs expérimentés"}
                      {aiDifficulty > 15 && "Niveau maître pour les experts"}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {gameMode === 'local' && (
          <div className="setup-options">
            <div className="local-mode-info">
              <div className="info-icon">👥</div>
              <h3>Mode Deux Joueurs</h3>
              <p>Vous allez jouer à tour de rôle sur le même appareil.</p>
              <ul>
                <li>Les Blancs commencent</li>
                <li>Alternez les coups</li>
                <li>L'interface indique à qui c'est le tour</li>
              </ul>
            </div>
          </div>
        )}

        <div className="setup-actions">
          <button 
            className="start-button"
            onClick={handleStartGame}
          >
            Commencer la Partie
          </button>
        </div>
      </div>
    </div>
  );
}

export default GameSetup; 