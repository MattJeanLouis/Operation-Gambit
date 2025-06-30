import React, { useState, useEffect, useRef } from 'react';
import './PongGame.css';

const PADDLE_HEIGHT = 100;
const BALL_SIZE = 20;
const GAME_WIDTH = 800;
const GAME_HEIGHT = 400;

function PongGame({ phase, onPointScored, chessTurnPlayer }) {
  const [paddles, setPaddles] = useState({
    left: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
    right: { y: GAME_HEIGHT / 2 - PADDLE_HEIGHT / 2 },
  });
  const [ball, setBall] = useState({
    x: GAME_WIDTH / 2 - BALL_SIZE / 2,
    y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
    vx: 5,
    vy: 5,
  });

  const keysPressed = useRef({}).current;
  const gameLoopRef = useRef();

  useEffect(() => {
    const handleKeyDown = (e) => { keysPressed[e.key] = true; };
    const handleKeyUp = (e) => { keysPressed[e.key] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const resetBall = (serveToRight) => {
    setBall({
      x: GAME_WIDTH / 2 - BALL_SIZE / 2,
      y: GAME_HEIGHT / 2 - BALL_SIZE / 2,
      vx: serveToRight ? 5 : -5,
      vy: (Math.random() - 0.5) * 10,
    });
  };
  
  useEffect(() => {
    const gameLoop = () => {
      if (phase !== 'playing') {
        cancelAnimationFrame(gameLoopRef.current);
        return;
      }

      // Update paddles
      setPaddles(prev => {
        const newPaddles = { ...prev };
        const speed = 10;
        if (keysPressed['w']) newPaddles.left.y = Math.max(0, newPaddles.left.y - speed);
        if (keysPressed['s']) newPaddles.left.y = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newPaddles.left.y + speed);
        if (keysPressed['ArrowUp']) newPaddles.right.y = Math.max(0, newPaddles.right.y - speed);
        if (keysPressed['ArrowDown']) newPaddles.right.y = Math.min(GAME_HEIGHT - PADDLE_HEIGHT, newPaddles.right.y + speed);
        return newPaddles;
      });

      // Update ball
      setBall(prev => {
        let newVx = prev.vx;
        let newVy = prev.vy;
        let newX = prev.x + newVx;
        let newY = prev.y + newVy;

        // Wall collision (top/bottom)
        if (newY <= 0 || newY >= GAME_HEIGHT - BALL_SIZE) {
          newVy = -newVy;
        }

        // Paddle collision
        // Left paddle
        if (newX <= 35 && newX > 20 && newY > paddles.left.y && newY < paddles.left.y + PADDLE_HEIGHT) {
          newVx = -newVx * 1.1; // Accelerate
        }
        // Right paddle
        if (newX >= GAME_WIDTH - 35 - BALL_SIZE && newX < GAME_WIDTH - 20 - BALL_SIZE && newY > paddles.right.y && newY < paddles.right.y + PADDLE_HEIGHT) {
          newVx = -newVx * 1.1; // Accelerate
        }

        // Score
        if (newX < 0) {
          onPointScored('black'); // Right player scores
          resetBall(false);
          return { ...prev, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
        }
        if (newX > GAME_WIDTH) {
          onPointScored('white'); // Left player scores
          resetBall(true);
          return { ...prev, x: GAME_WIDTH / 2, y: GAME_HEIGHT / 2 };
        }

        return { ...prev, x: newX, y: newY, vx: newVx, vy: newVy };
      });

      gameLoopRef.current = requestAnimationFrame(gameLoop);
    };

    if (phase === 'playing') {
      gameLoopRef.current = requestAnimationFrame(gameLoop);
    } else {
      cancelAnimationFrame(gameLoopRef.current);
    }

    return () => cancelAnimationFrame(gameLoopRef.current);
  }, [phase, paddles]); // Rerun loop logic if phase or paddles change

  return (
    <div className="pong-container">
      {phase !== 'playing' && (
        <div className="pong-message-overlay">
          {chessTurnPlayer ? (
            <>
              <h2>Point marqué !</h2>
              <p>C'est au tour des <b>{chessTurnPlayer === 'white' ? 'Blancs' : 'Noirs'}</b> de jouer aux échecs.</p>
            </>
          ) : (
            <>
             <h2>Jeu en pause</h2>
             <p>En attente de commencer...</p>
            </>
          )}
        </div>
      )}
      <div className="pong-net" />
      <div className="pong-paddle paddle-left" style={{ top: `${paddles.left.y}px` }} />
      <div className="pong-paddle paddle-right" style={{ top: `${paddles.right.y}px` }} />
      <div className="pong-ball" style={{ top: `${ball.y}px`, left: `${ball.x}px` }} />
    </div>
  );
}

export default PongGame; 