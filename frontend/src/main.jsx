import React from 'react';
import { createRoot } from 'react-dom/client';
import { Capacitor } from '@capacitor/core';
import { StatusBar, Style } from '@capacitor/status-bar';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapacitorApp } from '@capacitor/app';
import { Haptics, ImpactStyle } from '@capacitor/haptics';
import useGameStore from './store/gameStore';
import MainMenu from './components/Menu/MainMenu';
import GameSetup from './components/Menu/GameSetup';
import ChessBoard from './components/ChessBoard';
import EnergyChessBoard from './components/Energy/EnergyChessBoard';

// Configuration mobile Capacitor
const initializeCapacitor = async () => {
  if (Capacitor.isNativePlatform()) {
    // Configuration de la StatusBar
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#667eea' });
    
    // Masquer le SplashScreen après 2 secondes
    setTimeout(async () => {
      await SplashScreen.hide();
    }, 2000);

    // Gestion du bouton retour Android
    CapacitorApp.addListener('backButton', ({ canGoBack }) => {
      if (!canGoBack) {
        CapacitorApp.exitApp();
      } else {
        window.history.back();
      }
    });

    // Export de la fonction de vibration pour les composants
    window.mobileVibrate = async (style = ImpactStyle.Light) => {
      try {
        await Haptics.impact({ style });
      } catch (error) {
        console.log('Vibration non supportée:', error);
      }
    };

    console.log('🚀 Energy Chess - Mode Android Native activé !');
  } else {
    // Mode web/navigateur
    window.mobileVibrate = () => {
      if (navigator.vibrate) {
        navigator.vibrate(50);
      }
    };
    console.log('🌐 Energy Chess - Mode Web activé !');
  }
};

function App() {
  const { gameMode, isGameStarted } = useGameStore();

  React.useEffect(() => {
    initializeCapacitor();
  }, []);

  // Menu principal
  if (!gameMode) {
    return <MainMenu />;
  }

  // Configuration pour les modes IA
  if ((gameMode === 'ai' || gameMode === 'energy-ai') && !isGameStarted) {
    return <GameSetup />;
  }

  // Jeu en cours - modes Energy
  if (gameMode === 'energy-local' || gameMode === 'energy-ai') {
    return <EnergyChessBoard />;
  }

  // Jeu en cours - modes classiques
  if (gameMode === 'local' || gameMode === 'ai') {
    return <ChessBoard />;
  }

  // Fallback
  return <MainMenu />;
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);