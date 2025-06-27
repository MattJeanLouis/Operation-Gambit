import { useState, useEffect, useRef } from 'react';

export const useStockfish = (difficulty = 1) => {
  const [isReady, setIsReady] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const engineRef = useRef(null);
  const onMoveCallbackRef = useRef(null);

  useEffect(() => {
    const initializeEngine = async () => {
      if (!engineRef.current) {
        console.log('🔧 Initialisation IA simple...');
        const { SimpleAI } = await import('../utils/simpleAI');
        const simpleAI = new SimpleAI(difficulty);
        engineRef.current = { isSimple: true, ai: simpleAI };
        console.log('✅ IA simple prête - Niveau:', difficulty);
        setIsReady(true);
      } else {
        // Mise à jour de la difficulté seulement
        engineRef.current.ai.difficulty = difficulty;
        console.log('🔄 Difficulté IA mise à jour:', difficulty);
      }
    };

    initializeEngine();
  }, [difficulty]);

  const setOnMoveCallback = (callback) => {
    onMoveCallbackRef.current = callback;
  };

  const makeMove = (fen, timeLimit = 1000) => {
    if (!isReady || !engineRef.current?.isSimple) {
      console.warn('IA pas prête ou invalide');
      return;
    }
    
    setIsThinking(true);
    
    engineRef.current.ai.getBestMove(fen, timeLimit)
      .then(move => {
        setIsThinking(false);
        if (move && onMoveCallbackRef.current) {
          onMoveCallbackRef.current(move);
        }
      })
      .catch(error => {
        console.error('Erreur IA:', error);
        setIsThinking(false);
      });
  };

  return {
    isReady,
    isThinking,
    makeMove,
    setOnMoveCallback
  };
}; 