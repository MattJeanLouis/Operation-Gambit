import React from 'react';
import './EnergyBar.css';

function EnergyBar({ current, max, isRegenerating = true }) {
  const percentage = Math.max(0, Math.min(100, (current / max) * 100));
  
  return (
    <div className="energy-bar-container">
      <div className="energy-bar-label">
        <span className="energy-icon">⚡</span>
        <span className="energy-text">{Math.floor(current)}/{max}</span>
      </div>
      <div className="energy-bar-wrapper">
        <div 
          className={`energy-bar-fill ${isRegenerating ? 'regenerating' : ''}`}
          style={{ width: `${percentage}%` }}
        />
        <div className="energy-bar-background" />
      </div>
    </div>
  );
}

export default EnergyBar; 