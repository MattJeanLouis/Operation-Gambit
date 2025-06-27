import React, { useState } from 'react';

const sampleDialogue = {
  id: 'start',
  text: 'Welcome agent. Your mission begins now. Choose your path.',
  options: [
    { text: 'Explore the lobby', nextId: 'lobby' },
    { text: 'Visit the training room', nextId: 'training' },
  ],
};

const dialogues = {
  start: sampleDialogue,
  lobby: {
    id: 'lobby',
    text: 'You enter the lobby. There are several people here. What do you do?',
    options: [
      { text: 'Talk to the receptionist', nextId: 'receptionist' },
      { text: 'Look around quietly', nextId: 'lookAround' },
    ],
  },
  training: {
    id: 'training',
    text: 'The training room is quiet. You see puzzles and a coach AI terminal.',
    options: [
      { text: 'Try a puzzle', nextId: 'puzzle' },
      { text: 'Talk to the coach AI', nextId: 'coachAI' },
    ],
  },
  // Additional dialogue nodes...
};

function Dialogue() {
  const [currentId, setCurrentId] = useState('start');
  const currentNode = dialogues[currentId] || { text: 'Dialogue node not found.', options: [] };

  function selectOption(nextId) {
    setCurrentId(nextId);
  }

  return (
    <div className="dialogue-container">
      <p>{currentNode.text}</p>
      <div className="options">
        {currentNode.options.map((option, index) => (
          <button key={index} onClick={() => selectOption(option.nextId)}>
            {option.text}
          </button>
        ))}
      </div>
    </div>
  );
}

export default Dialogue;