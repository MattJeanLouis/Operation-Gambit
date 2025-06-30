import React from 'react';
import useGameStore from '../../store/gameStore';
import './MainMenu.css';

function MainMenu() {
  const { setGameMode } = useGameStore();

  const handleModeSelect = (mode) => {
    setGameMode(mode);
  };

  return (
    <div className="main-menu">
      <div className="menu-container">
        <h1 className="menu-title">♔ Jeu d'Échecs ♔</h1>
        <p className="menu-subtitle">Choisissez votre mode de jeu</p>
        
        <div className="modes-grid">
          {/* Modes Classiques */}
          <div className="mode-section classic-modes">
            <h2 className="section-title">🏛️ Modes Classiques</h2>
            <div className="modes-row">
              <button 
                className="mode-button local" 
                onClick={() => handleModeSelect('local')}
              >
                <div className="mode-icon">👥</div>
                <div className="mode-content">
                  <h3>Deux Joueurs</h3>
                  <p>Partie locale entre deux joueurs</p>
                </div>
              </button>
              
              <button 
                className="mode-button ai" 
                onClick={() => handleModeSelect('ai')}
              >
                <div className="mode-icon">🤖</div>
                <div className="mode-content">
                  <h3>Contre l'IA</h3>
                  <p>Affrontez l'intelligence artificielle</p>
                </div>
              </button>
            </div>
          </div>

          {/* Modes Energy */}
          <div className="mode-section energy-modes">
            <h2 className="section-title">⚡ Energy Chess</h2>
            <p className="section-description">Mode innovant avec système d'énergie et cartes</p>
            <div className="modes-row">
              <button 
                className="mode-button energy-local" 
                onClick={() => handleModeSelect('energy-local')}
              >
                <div className="mode-icon">⚡👥</div>
                <div className="mode-content">
                  <h3>Energy 2 Joueurs</h3>
                  <p>Mode énergie entre deux joueurs</p>
                </div>
              </button>
              
              <button 
                className="mode-button energy-ai" 
                onClick={() => handleModeSelect('energy-ai')}
              >
                <div className="mode-icon">⚡🤖</div>
                <div className="mode-content">
                  <h3>Energy vs IA</h3>
                  <p>Défiez l'IA en mode énergie</p>
                </div>
              </button>
            </div>
            
            <div className="energy-features">
              <div className="feature-item">
                <span className="feature-icon">🃏</span>
                <span>Main de 4 cartes</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">💎</span>
                <span>Système d'énergie</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏱️</span>
                <span>Match chronométré</span>
              </div>
            </div>
          </div>

          {/* Mode Chessweeper */}
          <div className="mode-section chessweeper-modes">
            <h2 className="section-title">💣 Chessweeper</h2>
            <p className="section-description">Échecs & Démineur : chaque case est un piège potentiel</p>
            <div className="modes-row">
              <button
                className="mode-button chessweeper-local"
                onClick={() => handleModeSelect('chessweeper-local')}
              >
                <div className="mode-icon">💣👥</div>
                <div className="mode-content">
                  <h3>Chessweeper 2 Joueurs</h3>
                  <p>Déminez l'échiquier à deux</p>
                </div>
              </button>
              
              <button
                className="mode-button chessweeper-ai"
                onClick={() => handleModeSelect('chessweeper-ai')}
              >
                <div className="mode-icon">💣🤖</div>
                <div className="mode-content">
                  <h3>Chessweeper vs IA</h3>
                  <p>L'IA ne vous fera aucun cadeau</p>
                </div>
              </button>
            </div>
            <div className="energy-features">
              <div className="feature-item">
                <span className="feature-icon">💥</span>
                <span>Mines cachées</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">❓</span>
                <span>Cases à révéler</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🤯</span>
                <span>Roi explosif = fin</span>
              </div>
            </div>
          </div>

          {/* Mode PongChess */}
          <div className="mode-section pong-chess-modes">
            <h2 className="section-title">🏓 Pong Échecs</h2>
            <p className="section-description">Marquez au Pong pour pouvoir jouer aux échecs !</p>
            <div className="modes-row">
              <button
                className="mode-button pong-chess-local"
                onClick={() => handleModeSelect('pongchess-local')}
              >
                <div className="mode-icon">🏓👥</div>
                <div className="mode-content">
                  <h3>PongÉchecs 2 Joueurs</h3>
                  <p>Le duel ultime : réflexes et stratégie</p>
                </div>
              </button>
            </div>
            <div className="energy-features">
              <div className="feature-item">
                <span className="feature-icon">🏆</span>
                <span>Marquez pour jouer</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">🔥</span>
                <span>Enchaînez les coups</span>
              </div>
              <div className="feature-item">
                <span className="feature-icon">⏳</span>
                <span>Horloge Fischer</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="menu-footer">
          <p>Développé avec ❤️ - Projet OG Chess</p>
        </div>
      </div>
    </div>
  );
}

export default MainMenu; 