# Opération Gambit – Development Plan (v0.1)

## 1. Overview

This document outlines the detailed development plan for the "Opération Gambit" project, based on the Game Design Document (GDD v0.1). It defines the project phases, milestones, key deliverables, technical architecture, and risk mitigation strategies.

---

## 2. Project Phases & Milestones

| Phase             | Duration | Key Deliverables                          | Description                                      |
|-------------------|----------|------------------------------------------|------------------------------------------------|
| Prototype System  | 3 weeks  | Board + dialogues mock                    | Develop core chessboard UI, basic dialogue system, and integration with Stockfish engine mock. |
| MVP Alpha         | 6 weeks  | Act I playable                            | Implement Act I content: exploration hub, chess matches, espionage mechanics, coach AI feedback. |
| Beta Closed       | 4 weeks  | Acts I-III playable, balancing            | Complete Acts II and III, add balancing, polish UI/UX, implement secondary loops (training, relations). |
| Release 1.0       | 2 weeks  | Final act, polish, bug fixes              | Implement Act IV finale, finalize polish, fix bugs, prepare for release. |

---

## 3. Key Features per Phase

### Prototype System
- Chessboard UI (640px, pixel-art pieces)
- Basic Stockfish integration (mock or limited depth)
- Dialogue system with branching JSON trees
- Basic exploration hub layout (static)
- Simple NPC interaction placeholders

### MVP Alpha
- Full Act I narrative and exploration zones (Lobby, Park)
- Espionage mini-missions with indices system
- Coach AI feedback integration using Stockfish analysis
- Player progression system (ELO narrative, XP)
- Basic UI elements: HUD, timer, dialogue boxes

### Beta Closed
- Acts II and III narrative and zones (VIP floors, backstage)
- Advanced espionage mechanics and mini-games
- NPC relationship system with passive bonuses
- Training puzzles and replay analysis
- Performance optimization and mobile profiling

### Release 1.0
- Act IV finale and key player choices
- Multiplayer P2P (optional stretch goal)
- Polish UI/UX and art assets
- Final bug fixes and testing

---

## 4. Technical Architecture

```mermaid
graph TD
  Frontend[Frontend: React + Vite + Zustand]
  Backend[Backend: FastAPI + PostgreSQL + WebSocket]
  Stockfish[Stockfish Engine (python-chess)]
  CoachAI[Coach AI Module]
  DB[Database: PostgreSQL]
  Infra[Infrastructure: Docker-compose (dev), Kubernetes (prod)]

  Frontend -->|REST + WebSocket| Backend
  Backend -->|Chess logic| Stockfish
  Backend -->|Data storage| DB
  Backend -->|Coach analysis| CoachAI
  Frontend -->|UI/UX| Player
  Infra --> Backend
  Infra --> Frontend
```

---

## 5. Dependencies & Risks

| Risk                      | Impact | Mitigation                                  |
|---------------------------|--------|---------------------------------------------|
| Stockfish integration      | High   | Prototype early, fallback to WASM version   |
| Narrative scope creep      | Medium | Freeze MVP content, phase delivery          |
| Mobile performance         | Medium | Profiling, sprite optimization, lazy loading|

---

## 6. Tools & Technologies

- Frontend: React, Vite, Zustand for state management
- Backend: FastAPI, Python-chess, WebSocket for real-time moves
- Database: PostgreSQL
- AI: Stockfish 16, custom Coach AI heuristics
- Infrastructure: Docker-compose for dev, Kubernetes for production
- Art: Pixel-art assets (48x48 sprites), particle effects
- Audio: Electro-jazz OST, UI SFX

---

## 7. Next Steps

- Confirm plan and priorities
- Setup project repositories and CI/CD pipelines
- Begin Prototype System phase with chessboard UI and dialogue mock

---

*Document created on 19 June 2025 by ChatGPT (Architect Mode)*